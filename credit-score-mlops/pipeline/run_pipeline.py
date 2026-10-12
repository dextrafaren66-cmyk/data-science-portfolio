"""
End-to-end training pipeline:

    ingest & clean -> split & encode -> train (MLflow) -> evaluate -> approval gate -> promote

A model that fails the approval gate stops the pipeline before promotion, so the
model the app already uses stays in place.

Usage (from the project root):
    python pipeline/run_pipeline.py
"""
import shutil
import sys
from pathlib import Path

import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

sys.path.insert(0, str(Path(__file__).resolve().parent))

from data_ingestion import DataIngestor  # noqa: E402
from evaluate_pipeline import ModelEvaluator  # noqa: E402
from train_pipeline import ModelTrainer  # noqa: E402


class CreditScorePipeline:
    """Orchestrates DataIngestor -> ModelTrainer -> ModelEvaluator -> approval."""

    TARGET_COLUMN = "Credit_Score"
    TEST_SIZE = 0.2
    RANDOM_STATE = 42
    F1_THRESHOLD = 0.5  # minimum macro-F1 required to approve a model for deployment

    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).resolve().parent.parent
        self.data_path = self.base_dir / "data" / "credit_score_data.csv"
        self.ingested_path = self.base_dir / "pipeline" / "ingested" / "data_cleaned.csv"
        self.models_dir = self.base_dir / "models"
        self.models_dir.mkdir(parents=True, exist_ok=True)

        self.ingestor = DataIngestor(self.data_path, self.ingested_path)
        self.trainer = ModelTrainer(self.models_dir, random_state=self.RANDOM_STATE)
        self.target_encoder = LabelEncoder()
        self.evaluator = None

        self.df = None
        self.best_name = None
        self.best_score = None

    def _split_and_encode(self):
        """Encode the target and do a stratified train/test split (classes are imbalanced)."""
        X = self.df.drop(columns=[self.TARGET_COLUMN])
        y = self.target_encoder.fit_transform(self.df[self.TARGET_COLUMN])
        joblib.dump(self.target_encoder, self.models_dir / "label_encoder.pkl")

        mapping = dict(zip(self.target_encoder.classes_,
                           self.target_encoder.transform(self.target_encoder.classes_)))
        print(f"Target encoding : {mapping}")
        print("")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=self.TEST_SIZE, random_state=self.RANDOM_STATE, stratify=y
        )
        print(f"Train size      : {X_train.shape[0]}")
        print(f"Test size       : {X_test.shape[0]}")
        print("")
        return X_train, X_test, y_train, y_test

    def _promote_best_model(self):
        """Copy the best model to credit_score_pipeline.pkl, which the app loads."""
        best_path = self.models_dir / f"credit_score_{self.best_name}.pkl"
        deploy_path = self.models_dir / "credit_score_pipeline.pkl"
        shutil.copy(best_path, deploy_path)
        print(f"\n  Best model promoted: {best_path.name} -> {deploy_path.name}")

    def _approval_check(self):
        """Print the result and return True if the best model clears the macro-F1 threshold."""
        approved = self.best_score > self.F1_THRESHOLD
        print("\n" + "=" * 50)
        print("PIPELINE RESULT")
        print("=" * 50)
        print(f"  Best model    : {self.best_name}")
        print(f"  Best F1 macro : {self.best_score:.4f}")
        print(f"  Threshold     : {self.F1_THRESHOLD}")
        status = "APPROVED for deployment" if approved else "REJECTED (below threshold)"
        print(f"  STATUS        : {status}")
        print("")
        return approved

    def run(self):
        print("\n" + "=" * 50)
        print("RUNNING FULL ML PIPELINE")
        print("=" * 50 + "\n")

        self.df = self.ingestor.ingest()
        X_train, X_test, y_train, y_test = self._split_and_encode()
        run_ids, trained_pipelines = self.trainer.train(X_train, y_train)

        self.evaluator = ModelEvaluator(self.target_encoder)
        self.best_name, self.best_score = self.evaluator.evaluate(
            X_test, y_test, run_ids, trained_pipelines
        )

        # Check first, promote second: a rejected model must never replace the one the app uses
        if not self._approval_check():
            raise SystemExit("Pipeline stopped: the best model did not pass the approval gate")
        self._promote_best_model()


if __name__ == "__main__":
    CreditScorePipeline().run()
