"""
Streamlit web app for credit score prediction.

Local:
    streamlit run app.py

AWS EC2 (model pulled from S3 if it isn't on disk yet):
    export S3_BUCKET=<your-bucket>
    streamlit run app.py --server.port 8501 --server.address 0.0.0.0
"""
import os
import sys
from pathlib import Path

import streamlit as st

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR / "aws"))

from inference import TEST_CASES, CreditScorePredictor  # noqa: E402

S3_BUCKET = os.environ.get("S3_BUCKET")
S3_REGION = os.environ.get("S3_REGION", "us-east-1")

st.set_page_config(page_title="Credit Score Prediction", page_icon="💳", layout="wide")

OCCUPATIONS = ["Accountant", "Architect", "Developer", "Doctor", "Engineer",
               "Entrepreneur", "Journalist", "Lawyer", "Manager", "Mechanic",
               "Media_Manager", "Musician", "Scientist", "Teacher", "Writer"]
CREDIT_MIX = ["Bad", "Standard", "Good"]
PAYMENT_OF_MIN = ["No", "Yes", "NM"]
PAYMENT_BEHAVIOUR = [
    "Low_spent_Small_value_payments", "Low_spent_Medium_value_payments",
    "Low_spent_Large_value_payments", "High_spent_Small_value_payments",
    "High_spent_Medium_value_payments", "High_spent_Large_value_payments",
]


@st.cache_resource
def get_predictor():
    models_dir = BASE_DIR / "models"
    model_path = models_dir / "credit_score_pipeline.pkl"
    encoder_path = models_dir / "label_encoder.pkl"

    if (not model_path.exists() or not encoder_path.exists()) and S3_BUCKET:
        from s3_helper import S3Helper
        s3 = S3Helper(S3_BUCKET, S3_REGION)
        s3.download_file("models/credit_score_pipeline.pkl", model_path)
        s3.download_file("models/label_encoder.pkl", encoder_path)

    return CreditScorePredictor(model_path=model_path, encoder_path=encoder_path)


try:
    predictor = get_predictor()
except AssertionError as err:
    st.error(f"{err}")
    st.stop()

model_name = type(predictor.pipeline.named_steps["model"]).__name__

# ---- Sidebar ----
st.sidebar.title("💳 Credit Score Classifier")
st.sidebar.markdown("---")
st.sidebar.markdown(f"**Model:** {model_name}")
st.sidebar.markdown(f"**Model source:** {'S3 (' + S3_BUCKET + ')' if S3_BUCKET else 'Local'}")
st.sidebar.markdown("**Classes:** Good, Standard, Poor")
st.sidebar.markdown("---")
st.sidebar.subheader("Example customers")
preset = st.sidebar.selectbox("Fill the form with an example", ["Standard", "Good", "Poor"])
defaults = TEST_CASES[preset]

# ---- Header ----
st.title("💳 Credit Score Prediction")
st.markdown("Enter a customer's financial profile to predict their credit score band.")
st.markdown("---")

st.subheader("📋 Customer Profile")
col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("**👤 Demographics & Income**")
    age = st.number_input("Age", 14, 100, int(defaults["Age"]))
    occupation = st.selectbox("Occupation", OCCUPATIONS, index=OCCUPATIONS.index(defaults["Occupation"]))
    annual_income = st.number_input("Annual Income ($)", 0.0, value=float(defaults["Annual_Income"]), step=1000.0)
    monthly_inhand = st.number_input("Monthly In-hand Salary ($)", 0.0,
                                     value=float(defaults["Monthly_Inhand_Salary"]), step=100.0)

with col2:
    st.markdown("**🏦 Accounts & Credit**")
    num_bank = st.number_input("Bank Accounts", 0, 20, int(defaults["Num_Bank_Accounts"]))
    num_cc = st.number_input("Credit Cards", 0, 20, int(defaults["Num_Credit_Card"]))
    interest = st.number_input("Interest Rate (%)", 0, 40, int(defaults["Interest_Rate"]))
    num_loan = st.number_input("Number of Loans", 0, 20, int(defaults["Num_of_Loan"]))
    credit_inquiries = st.number_input("Credit Inquiries", 0.0, value=float(defaults["Num_Credit_Inquiries"]), step=1.0)
    credit_mix = st.selectbox("Credit Mix", CREDIT_MIX, index=CREDIT_MIX.index(defaults["Credit_Mix"]))

with col3:
    st.markdown("**💸 Payment Behaviour**")
    delay_due = st.number_input("Days Past Due Date", -10, 200, int(defaults["Delay_from_due_date"]))
    num_delayed = st.number_input("Delayed Payments", 0.0, value=float(defaults["Num_of_Delayed_Payment"]), step=1.0)
    changed_limit = st.number_input("Changed Credit Limit", value=float(defaults["Changed_Credit_Limit"]), step=0.1)
    outstanding_debt = st.number_input("Outstanding Debt ($)", 0.0, value=float(defaults["Outstanding_Debt"]), step=100.0)
    util_ratio = st.number_input("Credit Utilization Ratio (%)", 0.0, 100.0,
                                 float(defaults["Credit_Utilization_Ratio"]), step=0.1)
    pay_min = st.selectbox("Pays Only Minimum Amount", PAYMENT_OF_MIN,
                           index=PAYMENT_OF_MIN.index(defaults["Payment_of_Min_Amount"]))

st.markdown("**📊 Spending & Balance**")
col4, col5, col6, col7 = st.columns(4)
with col4:
    total_emi = st.number_input("Total EMI per Month ($)", 0.0, value=float(defaults["Total_EMI_per_month"]), step=10.0)
with col5:
    invested = st.number_input("Invested Monthly ($)", 0.0, value=float(defaults["Amount_invested_monthly"]), step=10.0)
with col6:
    monthly_bal = st.number_input("Monthly Balance ($)", value=float(defaults["Monthly_Balance"]), step=10.0)
with col7:
    credit_hist = st.number_input("Credit History (months)", 0.0,
                                  value=float(defaults["Credit_History_Age_Months"]), step=1.0)

pay_behaviour = st.selectbox("Spending Pattern", PAYMENT_BEHAVIOUR,
                             index=PAYMENT_BEHAVIOUR.index(defaults["Payment_Behaviour"]))

input_data = {
    "Age": age, "Occupation": occupation, "Annual_Income": annual_income,
    "Monthly_Inhand_Salary": monthly_inhand, "Num_Bank_Accounts": num_bank,
    "Num_Credit_Card": num_cc, "Interest_Rate": interest, "Num_of_Loan": num_loan,
    "Delay_from_due_date": delay_due, "Num_of_Delayed_Payment": num_delayed,
    "Changed_Credit_Limit": changed_limit, "Num_Credit_Inquiries": credit_inquiries,
    "Credit_Mix": credit_mix, "Outstanding_Debt": outstanding_debt,
    "Credit_Utilization_Ratio": util_ratio, "Payment_of_Min_Amount": pay_min,
    "Total_EMI_per_month": total_emi, "Amount_invested_monthly": invested,
    "Payment_Behaviour": pay_behaviour, "Monthly_Balance": monthly_bal,
    "Credit_History_Age_Months": credit_hist,
}

st.markdown("---")
if st.button("Predict Credit Score", type="primary", use_container_width=True):
    result = predictor.predict(input_data)
    pred, conf = result["prediction"], result["confidence"]

    st.subheader("📊 Prediction")
    col_r1, col_r2 = st.columns([1, 2])
    with col_r1:
        if pred == "Good":
            st.success(f"### Credit Score: **{pred}**")
            st.markdown("Healthy credit profile.")
        elif pred == "Standard":
            st.warning(f"### Credit Score: **{pred}**")
            st.markdown("Average credit profile.")
        else:
            st.error(f"### Credit Score: **{pred}**")
            st.markdown("High-risk credit profile.")
    with col_r2:
        st.markdown("**Class probabilities**")
        for cls_name in ["Good", "Standard", "Poor"]:
            p = conf.get(cls_name, 0.0)
            st.progress(p, text=f"{cls_name}: {p:.1%}")

    with st.expander("Input sent to the model"):
        st.json(input_data)
