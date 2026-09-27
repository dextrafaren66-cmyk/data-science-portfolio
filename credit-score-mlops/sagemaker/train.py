"""
SageMaker training entry point (runs inside the managed scikit-learn container).

SageMaker:
  1. mounts the training data at /opt/ml/input/data/train/
  2. runs this script
  3. uploads everything saved to /opt/ml/model/ back to S3

Cleaning, preprocessing and models mirror the local pipeline so results are consistent.
"""
import argparse
import os
import re
import tarfile

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler

RANDOM_STATE = 42
TEST_SIZE = 0.2

# ---- Columns (same as the local pipeline) ----
ID_COLS = ['ID', 'Customer_ID', 'Name', 'SSN']
DROP_COLS = ['Type_of_Loan', 'Month']
STRING_NUMERIC_COLS = [
    'Age', 'Annual_Income', 'Num_of_Loan', 'Num_of_Delayed_Payment',
    'Changed_Credit_Limit', 'Outstanding_Debt', 'Amount_invested_monthly',
    'Monthly_Balance'
]
DIRTY_PLACEHOLDERS = {
    'Occupation': '_______',
    'Credit_Mix': '_',
    'Payment_Behaviour': '!@9#%8',
}
AGE_MIN, AGE_MAX = 14, 100

NUMERIC_COLS = [
    'Age', 'Annual_Income', 'Monthly_Inhand_Salary', 'Num_Bank_Accounts',
    'Num_Credit_Card', 'Interest_Rate', 'Num_of_Loan', 'Delay_from_due_date',
    'Num_of_Delayed_Payment', 'Changed_Credit_Limit', 'Num_Credit_Inquiries',
    'Outstanding_Debt', 'Credit_Utilization_Ratio', 'Total_EMI_per_month',
    'Amount_invested_monthly', 'Monthly_Balance', 'Credit_History_Age_Months'
]
CATEGORICAL_COLS = ['Occupation', 'Credit_Mix', 'Payment_of_Min_Amount', 'Payment_Behaviour']


# ---- Cleaning helpers (same as pipeline/data_ingestion.py) ----
def _clean_trailing_underscore(val):
    if isinstance(val, str):
        return val.rstrip('_').strip()
    return val


def _parse_credit_history(val):
    if pd.isna(val):
        return np.nan
    match = re.match(r'(\d+)\s+Years?\s+and\s+(\d+)\s+Months?', str(val))
    if match:
        return int(match.group(1)) * 12 + int(match.group(2))
    return np.nan


def clean_data(df):
    """Same cleaning steps as the local DataIngestor."""
    df = df.drop(columns=ID_COLS, errors='ignore')

    for col in STRING_NUMERIC_COLS:
        df[col] = df[col].apply(_clean_trailing_underscore)
        df[col] = pd.to_numeric(df[col], errors='coerce')

    for col, placeholder in DIRTY_PLACEHOLDERS.items():
        df[col] = df[col].replace(placeholder, np.nan)

    df['Credit_History_Age_Months'] = df['Credit_History_Age'].apply(_parse_credit_history)
    df = df.drop(columns=['Credit_History_Age'])
    df = df.drop(columns=DROP_COLS, errors='ignore')

    df.loc[(df['Age'] < AGE_MIN) | (df['Age'] > AGE_MAX), 'Age'] = np.nan
    df = df.drop_duplicates().reset_index(drop=True)
    return df


def build_preprocessor():
    """Same ColumnTransformer as the local pipeline."""
    numeric_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    categorical_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    return ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, NUMERIC_COLS),
            ('cat', categorical_transformer, CATEGORICAL_COLS)
        ],
        remainder='drop'
    )


def get_model_specs():
    """Same three candidate models as the local pipeline."""
    return {
        "LogisticRegression": LogisticRegression(random_state=RANDOM_STATE, max_iter=1000),
        "RandomForest": RandomForestClassifier(
            n_estimators=100, max_depth=15, min_samples_leaf=2,
            random_state=RANDOM_STATE, n_jobs=-1
        ),
        "GradientBoosting": GradientBoostingClassifier(
            n_estimators=100, max_depth=5, learning_rate=0.1, random_state=RANDOM_STATE
        ),
    }


def main():
    # SageMaker passes these via environment variables / hyperparameters
    parser = argparse.ArgumentParser()
    parser.add_argument("--train", type=str, default=os.environ.get("SM_CHANNEL_TRAIN", "."))
    parser.add_argument("--model-dir", type=str, default=os.environ.get("SM_MODEL_DIR", "."))
    parser.add_argument("--data-file", type=str, default="credit_score_data.csv")
    args = parser.parse_args()

    print("=" * 60)
    print("SAGEMAKER TRAINING JOB - Credit Score Classification")
    print("=" * 60)

    # ---- 1. Load data from the SageMaker channel ----
    data_path = os.path.join(args.train, args.data_file)
    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path, index_col=0)
    print(f"Raw data shape   : {df.shape}")

    # ---- 2. Clean ----
    df = clean_data(df)
    print(f"Cleaned shape    : {df.shape}")

    # ---- 3. Split features/target and encode the target ----
    target_encoder = LabelEncoder()
    y = target_encoder.fit_transform(df['Credit_Score'])
    X = df.drop(columns=['Credit_Score'])
    print(f"Target classes   : {list(target_encoder.classes_)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"Train size       : {len(X_train)} | Test size: {len(X_test)}")

    # ---- 4. Train 3 models, keep the best by macro-F1 ----
    print("\n" + "=" * 60)
    print("TRAINING MODELS")
    print("=" * 60)
    best_name, best_score, best_pipeline = None, -1.0, None
    results = {}

    for name, model in get_model_specs().items():
        pipeline = Pipeline([
            ('preprocessing', build_preprocessor()),
            ('model', model)
        ])
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        acc = accuracy_score(y_test, preds)
        f1 = f1_score(y_test, preds, average='macro')
        results[name] = {"accuracy": acc, "f1_macro": f1}
        print(f"  {name:18s} | Acc: {acc:.4f} | F1: {f1:.4f}")

        if f1 > best_score:
            best_score, best_name, best_pipeline = f1, name, pipeline

    print(f"\nBest model: {best_name} (F1 macro: {best_score:.4f})")
    print("\nClassification report (best model):")
    print(classification_report(
        y_test, best_pipeline.predict(X_test),
        target_names=target_encoder.classes_
    ))

    # ---- 5. Approval check ----
    THRESHOLD = 0.5
    status = "APPROVED" if best_score >= THRESHOLD else "REJECTED"
    print("=" * 60)
    print(f"Best model : {best_name}")
    print(f"Best F1    : {best_score:.4f}")
    print(f"Threshold  : {THRESHOLD}")
    print(f"STATUS     : {status} for deployment")
    print("=" * 60)

    # ---- 6. Save artifacts to /opt/ml/model (SageMaker uploads them to S3) ----
    os.makedirs(args.model_dir, exist_ok=True)
    # Best model is saved under the standard name the Streamlit app loads
    joblib.dump(best_pipeline, os.path.join(args.model_dir, "credit_score_pipeline.pkl"))
    joblib.dump(target_encoder, os.path.join(args.model_dir, "label_encoder.pkl"))
    print(f"\nModel artifacts saved to: {args.model_dir}")
    print("  - credit_score_pipeline.pkl (best model)")
    print("  - label_encoder.pkl")


if __name__ == "__main__":
    main()
