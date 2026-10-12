"""
Evaluate the production Random Forest with a split by customer instead of a split by row.

The data has one row per customer per month, so the random row split in run_pipeline.py
puts most test customers in the training set too (in other months). Here every customer
lands entirely in train or entirely in test, which is what a credit model faces when it
scores a brand-new customer.

Cleaning, preprocessing and the Random Forest are the production ones; only the split
changes. Nothing is written to MLflow or to models/.

Usage (from the project root):
    python pipeline/group_split_check.py
"""
import sys
import tempfile
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

sys.path.insert(0, str(Path(__file__).resolve().parent))

from data_ingestion import DataIngestor  # noqa: E402
from train_pipeline import ModelTrainer  # noqa: E402

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "credit_score_data.csv"
TARGET_COLUMN = "Credit_Score"
GROUP_COLUMN = "Customer_ID"
TEST_SIZE = 0.2
RANDOM_STATE = 42
GROUP_SEEDS = (42, 7, 2024)  # three customer splits, to show the result isn't one lucky draw


def build_model(trainer):
    """The production preprocessing and Random Forest, untrained."""
    return Pipeline([
        ("preprocessing", trainer._build_preprocessor()),
        ("model", trainer._get_model_specs()["RandomForest"]),
    ])


def evaluate_split(label, trainer, X, y, groups, train_idx, test_idx):
    """Train on one split, print accuracy, macro-F1 and how many test rows have a known customer."""
    model = build_model(trainer).fit(X.iloc[train_idx], y[train_idx])
    preds = model.predict(X.iloc[test_idx])
    seen = np.isin(groups[test_idx], groups[train_idx]).mean()
    print(f"  {label:26s} | Acc: {accuracy_score(y[test_idx], preds):.4f} "
          f"| F1: {f1_score(y[test_idx], preds, average='macro'):.4f} "
          f"| test rows with a known customer: {seen:.1%}")


def main():
    raw = pd.read_csv(DATA_PATH, index_col=0)
    with tempfile.TemporaryDirectory() as tmp:
        df = DataIngestor(DATA_PATH, Path(tmp) / "data_cleaned.csv").ingest()
        trainer = ModelTrainer(Path(tmp) / "models", random_state=RANDOM_STATE)

        # Cleaning drops Customer_ID, so the groups come from the raw file. That only works
        # while cleaning keeps every row in its original order.
        assert len(df) == len(raw), "cleaning dropped rows, so they no longer line up with the raw file"
        groups = raw[GROUP_COLUMN].to_numpy()
        X = df.drop(columns=[TARGET_COLUMN])
        y = LabelEncoder().fit_transform(df[TARGET_COLUMN])
        rows = np.arange(len(X))

        print("=" * 50)
        print("RANDOM ROW SPLIT vs SPLIT BY CUSTOMER")
        print("=" * 50)
        print(f"  Rows      : {len(X)}")
        print(f"  Customers : {len(np.unique(groups))}")
        print("")

        # Exactly the split in run_pipeline.py (stratified, random per row)
        train_idx, test_idx = train_test_split(
            rows, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
        )
        evaluate_split("Random rows (production)", trainer, X, y, groups, train_idx, test_idx)

        for seed in GROUP_SEEDS:
            splitter = GroupShuffleSplit(n_splits=1, test_size=TEST_SIZE, random_state=seed)
            train_idx, test_idx = next(splitter.split(X, y, groups))
            evaluate_split(f"By customer (seed {seed})", trainer, X, y, groups, train_idx, test_idx)


if __name__ == "__main__":
    main()
