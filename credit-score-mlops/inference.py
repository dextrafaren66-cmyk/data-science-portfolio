"""
Inference wrapper: loads the trained sklearn Pipeline + LabelEncoder and exposes predict().

Run directly for a smoke test on three example customers (one per class):
    python inference.py
"""
import joblib
import pandas as pd
from pathlib import Path


class CreditScorePredictor:
    """
    Predicts a customer's credit score class (Good / Standard / Poor).
    """

    FEATURE_COLUMNS = [
        'Age', 'Occupation', 'Annual_Income', 'Monthly_Inhand_Salary',
        'Num_Bank_Accounts', 'Num_Credit_Card', 'Interest_Rate', 'Num_of_Loan',
        'Delay_from_due_date', 'Num_of_Delayed_Payment', 'Changed_Credit_Limit',
        'Num_Credit_Inquiries', 'Credit_Mix', 'Outstanding_Debt',
        'Credit_Utilization_Ratio', 'Payment_of_Min_Amount', 'Total_EMI_per_month',
        'Amount_invested_monthly', 'Payment_Behaviour', 'Monthly_Balance',
        'Credit_History_Age_Months'
    ]

    def __init__(self, model_path=None, encoder_path=None):
        """
        Args:
            model_path (Path | str | None): path to the pipeline .pkl (default: models/credit_score_pipeline.pkl)
            encoder_path (Path | str | None): path to the label encoder .pkl (default: models/label_encoder.pkl)
        """
        base_dir = Path(__file__).parent
        models_dir = base_dir / "models"

        self.model_path = Path(model_path) if model_path else (models_dir / "credit_score_pipeline.pkl")
        self.encoder_path = Path(encoder_path) if encoder_path else (models_dir / "label_encoder.pkl")

        self._validate_paths()
        self.pipeline = joblib.load(self.model_path)
        self.label_encoder = joblib.load(self.encoder_path)

    def _validate_paths(self):
        """Make sure the model artifacts exist."""
        assert self.model_path.exists(), (f"Model not found: {self.model_path}. "
                                        "Run `python pipeline/run_pipeline.py` first.")
        assert self.encoder_path.exists(), f"Encoder not found: {self.encoder_path}"

    def _to_dataframe(self, input_data):
        """Normalise input into a DataFrame with a consistent column order."""
        if isinstance(input_data, dict):
            df = pd.DataFrame([input_data])
        elif isinstance(input_data, pd.DataFrame):
            df = input_data.copy()
        else:
            raise TypeError("input_data must be a dict or a pandas DataFrame")

        missing_cols = [c for c in self.FEATURE_COLUMNS if c not in df.columns]
        assert not missing_cols, f"Missing columns: {missing_cols}"

        return df[self.FEATURE_COLUMNS]

    def predict(self, input_data):
        """
        Predict a customer's credit score.

        Args:
            input_data (dict | pd.DataFrame): customer feature values

        Returns:
            dict: {
                "prediction" (str): 'Good' / 'Standard' / 'Poor',
                "confidence" (dict): probability per class
            }
        """
        df = self._to_dataframe(input_data)

        pred_idx = self.pipeline.predict(df)[0]
        pred_label = self.label_encoder.inverse_transform([pred_idx])[0]

        proba = self.pipeline.predict_proba(df)[0]
        confidence = {
            cls_name: round(float(p), 4)
            for cls_name, p in zip(self.label_encoder.classes_, proba)
        }

        return {
            "prediction": str(pred_label),
            "confidence": confidence
        }

    @property
    def classes(self):
        """Classes known to the model."""
        return list(self.label_encoder.classes_)


# ========================================
# EXAMPLE CUSTOMERS (one per class)
# ========================================
TEST_CASES = {
    "Good": {
        'Age': 49, 'Occupation': 'Entrepreneur', 'Annual_Income': 177723.80,
        'Monthly_Inhand_Salary': 15038.32, 'Num_Bank_Accounts': 3,
        'Num_Credit_Card': 4, 'Interest_Rate': 1, 'Num_of_Loan': 3,
        'Delay_from_due_date': -2, 'Num_of_Delayed_Payment': 12.0,
        'Changed_Credit_Limit': 16.6, 'Num_Credit_Inquiries': 2.0,
        'Credit_Mix': 'Good', 'Outstanding_Debt': 1292.23,
        'Credit_Utilization_Ratio': 43.42, 'Payment_of_Min_Amount': 'No',
        'Total_EMI_per_month': 338.79, 'Amount_invested_monthly': 221.92,
        'Payment_Behaviour': 'High_spent_Large_value_payments',
        'Monthly_Balance': 1183.12, 'Credit_History_Age_Months': 359.0
    },
    "Standard": {
        'Age': 35, 'Occupation': 'Teacher', 'Annual_Income': 100433.58,
        'Monthly_Inhand_Salary': 8074.47, 'Num_Bank_Accounts': 1,
        'Num_Credit_Card': 5, 'Interest_Rate': 10, 'Num_of_Loan': 2,
        'Delay_from_due_date': 13, 'Num_of_Delayed_Payment': 4.0,
        'Changed_Credit_Limit': 12.59, 'Num_Credit_Inquiries': 3.0,
        'Credit_Mix': 'Good', 'Outstanding_Debt': 1023.93,
        'Credit_Utilization_Ratio': 33.47, 'Payment_of_Min_Amount': 'No',
        'Total_EMI_per_month': 100.16, 'Amount_invested_monthly': 758.07,
        'Payment_Behaviour': 'Low_spent_Medium_value_payments',
        'Monthly_Balance': 229.21, 'Credit_History_Age_Months': 245.0
    },
    "Poor": {
        'Age': 25, 'Occupation': 'Developer', 'Annual_Income': 33119.82,
        'Monthly_Inhand_Salary': 3024.98, 'Num_Bank_Accounts': 10,
        'Num_Credit_Card': 5, 'Interest_Rate': 32, 'Num_of_Loan': 5,
        'Delay_from_due_date': 50, 'Num_of_Delayed_Payment': 18.0,
        'Changed_Credit_Limit': 15.79, 'Num_Credit_Inquiries': 10.0,
        'Credit_Mix': 'Bad', 'Outstanding_Debt': 2545.00,
        'Credit_Utilization_Ratio': 33.81, 'Payment_of_Min_Amount': 'Yes',
        'Total_EMI_per_month': 111.42, 'Amount_invested_monthly': 0.0,
        'Payment_Behaviour': 'Low_spent_Small_value_payments',
        'Monthly_Balance': 370.61, 'Credit_History_Age_Months': 176.0
    }
}


def run_smoke_test():
    """Smoke test: predict the three example customers."""
    print("=" * 50)
    print("INFERENCING SMOKE TEST")
    print("=" * 50)

    predictor = CreditScorePredictor()
    print(f"Loaded pipeline : {predictor.model_path.name}")
    print(f"Loaded encoder  : {predictor.encoder_path.name}")
    print(f"Target classes  : {predictor.classes}")
    print("")

    for expected_class, test_input in TEST_CASES.items():
        result = predictor.predict(test_input)
        pred = result["prediction"]
        conf = result["confidence"]
        match = "OK" if pred == expected_class else "MISMATCH"

        print(f"Test case: {expected_class:8s} -> Predicted: {pred:8s} [{match}]")
        for cls_name, p in conf.items():
            print(f"   {cls_name:10s}: {p:.4f}")
        print("")


if __name__ == "__main__":
    run_smoke_test()
