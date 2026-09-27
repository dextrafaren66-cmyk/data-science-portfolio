#!/bin/bash
# EC2 setup script (Ubuntu 22.04 / 24.04).
# Run from the project root after SSH-ing into the instance:
#   chmod +x aws/setup_ec2.sh && ./aws/setup_ec2.sh
# On Amazon Linux, replace apt-get with yum.

set -e

echo "== 1. Update system packages =="
sudo apt-get update -y
sudo apt-get upgrade -y

echo "== 2. Install Python, pip, venv, git =="
sudo apt-get install -y python3 python3-pip python3-venv git

echo "== 3. Create virtual environment =="
python3 -m venv venv
source venv/bin/activate

echo "== 4. Install Python dependencies =="
pip install --upgrade pip
pip install -r requirements.txt

echo "== 5. Verify installation =="
python3 -c "import sklearn, pandas, mlflow, streamlit, boto3; print('All packages OK')"

echo ""
echo "Setup complete. Next steps:"
echo "  source venv/bin/activate"
echo "  python aws/cloud_pipeline.py --bucket <BUCKET_NAME>"
echo "  export S3_BUCKET=<BUCKET_NAME>"
echo "  streamlit run app.py --server.port 8501 --server.address 0.0.0.0"
echo ""
echo "Make sure the EC2 security group allows inbound TCP 8501 (Streamlit) and 22 (SSH),"
echo "and that the instance's IAM role can read/write the S3 bucket (see aws/iam_policy_s3.json)."
