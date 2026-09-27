"""
Data ingestion & cleaning for the credit score dataset.

The raw data has several quality issues that are handled here:
  - identity columns (ID, Customer_ID, Name, SSN) that leak nothing useful
  - numeric columns stored as strings with trailing underscores ("39_")
  - junk placeholder values ("_______", "_", "!@9#%8")
  - Credit_History_Age stored as text ("22 Years and 1 Months")
  - impossible ages (e.g. 8466 or -500)
  - duplicate rows
"""
import re
from pathlib import Path

import numpy as np
import pandas as pd


class DataIngestor:
    """Load the raw CSV, clean it, and save a model-ready CSV."""

    ID_COLS = ["ID", "Customer_ID", "Name", "SSN"]
    DROP_COLS = ["Type_of_Loan", "Month"]

    STRING_NUMERIC_COLS = [
        "Age", "Annual_Income", "Num_of_Loan",
        "Num_of_Delayed_Payment", "Changed_Credit_Limit",
        "Outstanding_Debt", "Amount_invested_monthly",
        "Monthly_Balance",
    ]

    DIRTY_PLACEHOLDERS = {
        "Occupation": "_______",
        "Credit_Mix": "_",
        "Payment_Behaviour": "!@9#%8",
    }

    AGE_MIN = 14
    AGE_MAX = 100

    def __init__(self, input_path, output_path):
        """
        Args:
            input_path (Path | str): path to the raw CSV
            output_path (Path | str): where the cleaned CSV is written
        """
        self.input_path = Path(input_path)
        self.output_path = Path(output_path)
        self.df = None

    # ---- Static helpers ----
    @staticmethod
    def _clean_trailing_underscore(val):
        """Strip trailing underscores from numbers, e.g. '39_' -> '39'."""
        if isinstance(val, str):
            return val.rstrip("_").strip()
        return val

    @staticmethod
    def _parse_credit_history(val):
        """Convert 'X Years and Y Months' into a total number of months."""
        if pd.isna(val):
            return np.nan
        match = re.match(r"(\d+)\s+Years?\s+and\s+(\d+)\s+Months?", str(val))
        if match:
            return int(match.group(1)) * 12 + int(match.group(2))
        return np.nan

    # ---- Steps ----
    def _load(self):
        assert self.input_path.exists(), f"Dataset not found: {self.input_path}"
        self.df = pd.read_csv(self.input_path, index_col=0)
        print(f"Raw data loaded : {self.df.shape}")

    def _drop_identity(self):
        self.df = self.df.drop(columns=self.ID_COLS, errors="ignore")
        print(f"Dropped identity: {self.ID_COLS}")

    def _clean_numeric_strings(self):
        for col in self.STRING_NUMERIC_COLS:
            self.df[col] = self.df[col].apply(self._clean_trailing_underscore)
            self.df[col] = pd.to_numeric(self.df[col], errors="coerce")
        print(f"Numeric cleaned : {len(self.STRING_NUMERIC_COLS)} columns")

    def _replace_placeholders(self):
        for col, placeholder in self.DIRTY_PLACEHOLDERS.items():
            self.df[col] = self.df[col].replace(placeholder, np.nan)
        print(f"Placeholders cleaned: {list(self.DIRTY_PLACEHOLDERS.keys())}")

    def _parse_credit_history_col(self):
        self.df["Credit_History_Age_Months"] = (
            self.df["Credit_History_Age"].apply(self._parse_credit_history)
        )
        self.df = self.df.drop(columns=["Credit_History_Age"])
        print("Parsed Credit_History_Age -> total months")

    def _drop_low_value(self):
        self.df = self.df.drop(columns=self.DROP_COLS, errors="ignore")
        print(f"Dropped low-value: {self.DROP_COLS}")

    def _handle_age_outliers(self):
        """Ages outside [AGE_MIN, AGE_MAX] are data-entry errors -> NaN (imputed later)."""
        mask = (self.df["Age"] < self.AGE_MIN) | (self.df["Age"] > self.AGE_MAX)
        self.df.loc[mask, "Age"] = np.nan
        print(f"Age outliers    : {mask.sum()} rows -> NaN")

    def _drop_duplicates(self):
        before = len(self.df)
        self.df = self.df.drop_duplicates().reset_index(drop=True)
        print(f"Duplicates      : {before - len(self.df)} rows removed")

    def _validate(self):
        assert self.df is not None, "DataFrame has not been loaded"
        assert not self.df.empty, "Cleaned dataset is empty"
        assert "Credit_Score" in self.df.columns, "Target column missing"

    def _save(self):
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        self.df.to_csv(self.output_path, index=False)
        print(f"Cleaned data    : {self.df.shape}")
        print(f"Saved to        : {self.output_path}")

    # ---- Public API ----
    def ingest(self):
        """Run the full ingestion step and return the cleaned DataFrame."""
        print("=" * 50)
        print("STEP 1: DATA INGESTION & CLEANING")
        print("=" * 50)

        self._load()
        self._drop_identity()
        self._clean_numeric_strings()
        self._replace_placeholders()
        self._parse_credit_history_col()
        self._drop_low_value()
        self._handle_age_outliers()
        self._drop_duplicates()
        self._validate()
        self._save()
        print("")
        return self.df


if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent
    DataIngestor(
        input_path=BASE_DIR / "data" / "credit_score_data.csv",
        output_path=BASE_DIR / "pipeline" / "ingested" / "data_cleaned.csv",
    ).ingest()
