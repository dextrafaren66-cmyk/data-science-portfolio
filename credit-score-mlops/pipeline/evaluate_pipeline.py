"""
Model evaluation.

Models are evaluated in memory (straight from training) rather than reloaded from
MLflow, which keeps the pipeline independent of MLflow artifact storage. Test
metrics are logged back to each model's MLflow run.
"""
import mlflow
from sklearn.metrics import (accuracy_score, classification_report, f1_score,
                             precision_score, recall_score)


class ModelEvaluator:
    """Score every trained model on the test set and pick the best by macro-F1."""

    def __init__(self, target_encoder):
        """
        Args:
            target_encoder (LabelEncoder): encoder fitted during training,
                used to print readable class names in the report
        """
        self.target_encoder = target_encoder
        self.results = {}
        self.best_name = None
        self.best_score = -1.0

    def _evaluate_single(self, model_name, model, run_id, X_test, y_test):
        preds = model.predict(X_test)
        metrics = {
            "test_accuracy": accuracy_score(y_test, preds),
            "test_precision_macro": precision_score(y_test, preds, average="macro", zero_division=0),
            "test_recall_macro": recall_score(y_test, preds, average="macro", zero_division=0),
            "test_f1_macro": f1_score(y_test, preds, average="macro", zero_division=0),
        }

        with mlflow.start_run(run_id=run_id):
            for metric_name, value in metrics.items():
                mlflow.log_metric(metric_name, value)

        print(f"  {model_name:18s} | Acc: {metrics['test_accuracy']:.4f} "
              f"| F1: {metrics['test_f1_macro']:.4f}")
        return metrics["test_f1_macro"], preds

    def _print_best_report(self, trained_pipelines, X_test, y_test):
        print(f"\n  Best: {self.best_name} (F1 macro: {self.best_score:.4f})")
        print("\n  Classification report (best model):")
        best_preds = trained_pipelines[self.best_name].predict(X_test)
        print(classification_report(y_test, best_preds, target_names=self.target_encoder.classes_))

    def evaluate(self, X_test, y_test, run_ids, trained_pipelines):
        """Evaluate all models. Returns (best_name, best_macro_f1)."""
        print("=" * 50)
        print("STEP 3: EVALUATE CLASSIFICATION MODELS")
        print("=" * 50)

        for model_name, model in trained_pipelines.items():
            f1, _ = self._evaluate_single(model_name, model, run_ids.get(model_name), X_test, y_test)
            self.results[model_name] = f1
            if f1 > self.best_score:
                self.best_score = f1
                self.best_name = model_name

        self._print_best_report(trained_pipelines, X_test, y_test)
        return self.best_name, self.best_score
