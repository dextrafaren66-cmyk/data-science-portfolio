"""
Model training with scikit-learn Pipelines and MLflow experiment tracking.

Every model is wrapped in a single sklearn Pipeline (preprocessing + classifier),
so inference is one call and preprocessing is guaranteed to match training.
"""
from pathlib import Path

import joblib
import mlflow
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


class ModelTrainer:
    """Train several candidate classifiers and log each run to MLflow."""

    NUMERIC_COLS = [
        "Age", "Annual_Income", "Monthly_Inhand_Salary", "Num_Bank_Accounts",
        "Num_Credit_Card", "Interest_Rate", "Num_of_Loan", "Delay_from_due_date",
        "Num_of_Delayed_Payment", "Changed_Credit_Limit", "Num_Credit_Inquiries",
        "Outstanding_Debt", "Credit_Utilization_Ratio", "Total_EMI_per_month",
        "Amount_invested_monthly", "Monthly_Balance", "Credit_History_Age_Months",
    ]
    CATEGORICAL_COLS = ["Occupation", "Credit_Mix", "Payment_of_Min_Amount", "Payment_Behaviour"]

    EXPERIMENT_NAME = "Credit Score Classification"

    def __init__(self, artifact_dir, random_state=42):
        """
        Args:
            artifact_dir (Path | str): folder where trained .pkl files are saved
            random_state (int): seed for reproducibility
        """
        self.artifact_dir = Path(artifact_dir)
        self.artifact_dir.mkdir(parents=True, exist_ok=True)
        self.random_state = random_state
        self.trained_pipelines = {}
        self.run_ids = {}

    def _build_preprocessor(self):
        """
        Numeric     : median imputation + standard scaling
        Categorical : most-frequent imputation + one-hot encoding
        """
        numeric = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ])
        categorical = Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ])
        return ColumnTransformer(
            transformers=[
                ("num", numeric, self.NUMERIC_COLS),
                ("cat", categorical, self.CATEGORICAL_COLS),
            ],
            remainder="drop",
        )

    def _get_model_specs(self):
        return {
            "LogisticRegression": LogisticRegression(
                random_state=self.random_state, max_iter=1000
            ),
            "RandomForest": RandomForestClassifier(
                n_estimators=100, max_depth=15, min_samples_leaf=2,
                random_state=self.random_state, n_jobs=-1,
            ),
            "GradientBoosting": GradientBoostingClassifier(
                n_estimators=100, max_depth=5, learning_rate=0.1,
                random_state=self.random_state,
            ),
        }

    def _train_single_model(self, model_name, model, X_train, y_train):
        with mlflow.start_run(run_name=model_name) as run:
            pipeline = Pipeline([
                ("preprocessing", self._build_preprocessor()),
                ("model", model),
            ])
            pipeline.fit(X_train, y_train)

            mlflow.log_params(model.get_params())
            mlflow.log_param("preprocessor", "ColumnTransformer (SimpleImputer + StandardScaler/OneHot)")

            # The model is saved locally as .pkl (not logged as an MLflow artifact)
            # to keep disk usage small; params and metrics are still tracked in MLflow.
            artifact_path = self.artifact_dir / f"credit_score_{model_name}.pkl"
            joblib.dump(pipeline, artifact_path)

            print(f"  {model_name} trained -> {artifact_path.name}")
            return run.info.run_id, pipeline

    def train(self, X_train, y_train):
        """Train all candidate models. Returns (run_ids, trained_pipelines)."""
        print("=" * 50)
        print("STEP 2: TRAINING CLASSIFICATION MODELS")
        print("=" * 50)

        # Local SQLite tracking store. as_posix() keeps paths with spaces working on Windows.
        db_path = Path(__file__).resolve().parent / "mlflow.db"
        mlflow.set_tracking_uri(f"sqlite:///{db_path.as_posix()}")
        mlflow.set_experiment(self.EXPERIMENT_NAME)

        for model_name, model in self._get_model_specs().items():
            run_id, pipeline = self._train_single_model(model_name, model, X_train, y_train)
            self.run_ids[model_name] = run_id
            self.trained_pipelines[model_name] = pipeline

        print("")
        return self.run_ids, self.trained_pipelines
