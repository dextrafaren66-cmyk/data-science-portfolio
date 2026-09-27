"""
Launch a SageMaker training job for the credit score model.

Run from a SageMaker notebook/Studio, or from any machine with access to a
SageMaker execution role:
    cd sagemaker
    python launch_training.py --bucket <your-bucket>

Flow:
  1. upload the dataset to S3 (if it isn't there yet)
  2. create a managed SKLearn estimator
  3. .fit() -> SageMaker runs train.py in a managed container
  4. SageMaker writes model.tar.gz to S3
  5. extract the .pkl files and put them under s3://<bucket>/models/ for the Streamlit app
"""
import argparse
import os
import tarfile

import boto3
import sagemaker
from sagemaker.sklearn.estimator import SKLearn


def get_execution_role_safe():
    """Use the notebook's role when available; otherwise fall back to an IAM role by name."""
    try:
        return sagemaker.get_execution_role()
    except Exception:
        role_name = os.environ.get("SAGEMAKER_ROLE_NAME", "LabRole")
        try:
            role = boto3.client("iam").get_role(RoleName=role_name)
            print(f"Using IAM role: {role_name}")
            return role["Role"]["Arn"]
        except Exception as e:
            raise RuntimeError(
                "Could not find a SageMaker execution role. Run this from SageMaker "
                "Studio/Notebook or set SAGEMAKER_ROLE_NAME."
            ) from e


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bucket", required=True, help="S3 bucket name")
    parser.add_argument("--data-file", default="credit_score_data.csv")
    parser.add_argument("--local-data", default="../data/credit_score_data.csv",
                        help="local dataset to upload if it isn't in S3 yet")
    parser.add_argument("--instance-type", default="ml.m5.large")
    args = parser.parse_args()

    sess = sagemaker.Session()
    role = get_execution_role_safe()
    print(f"Role   : {role}\nBucket : {args.bucket}\nRegion : {sess.boto_region_name}")

    # 1. Make sure the data is in S3
    s3 = boto3.client("s3")
    s3_data_key = f"data/{args.data_file}"
    s3_data_uri = f"s3://{args.bucket}/{s3_data_key}"
    try:
        s3.head_object(Bucket=args.bucket, Key=s3_data_key)
        print(f"Data already in S3: {s3_data_uri}")
    except Exception:
        if not os.path.exists(args.local_data):
            raise FileNotFoundError(f"Data not found in S3 or locally ({args.local_data})")
        print(f"Uploading data to {s3_data_uri}")
        s3.upload_file(args.local_data, args.bucket, s3_data_key)

    # 2. Managed scikit-learn estimator
    estimator = SKLearn(
        entry_point="train.py",
        source_dir=".",
        role=role,
        instance_type=args.instance_type,
        instance_count=1,
        framework_version="1.2-1",
        py_version="py3",
        output_path=f"s3://{args.bucket}/sagemaker-output",
        base_job_name="credit-score-training",
        hyperparameters={"data-file": args.data_file},
    )

    # 3. Run the training job (SageMaker provisions and tears down the instance)
    estimator.fit({"train": s3_data_uri})
    model_data = estimator.model_data
    print(f"\nTraining job complete. Model artifact: {model_data}")

    # 4. Extract model.tar.gz locally
    os.makedirs("../models", exist_ok=True)
    model_bucket = model_data.split("/")[2]
    model_key = "/".join(model_data.split("/")[3:])
    local_tar = "../models/model.tar.gz"
    s3.download_file(model_bucket, model_key, local_tar)
    with tarfile.open(local_tar) as tar:
        tar.extractall("../models")
    os.remove(local_tar)

    # 5. Publish the .pkl files for the Streamlit app
    for fname in ["credit_score_pipeline.pkl", "label_encoder.pkl"]:
        local_f = f"../models/{fname}"
        if os.path.exists(local_f):
            s3.upload_file(local_f, args.bucket, f"models/{fname}")
            print(f"  uploaded: s3://{args.bucket}/models/{fname}")

    print("\nDone. The model is ready for the Streamlit app (set S3_BUCKET and run app.py).")


if __name__ == "__main__":
    main()
