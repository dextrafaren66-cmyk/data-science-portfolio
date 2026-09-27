"""
Cloud version of the training pipeline, meant to run on an EC2 instance:

    S3 (raw data) -> train on EC2 (same pipeline as local) -> S3 (model artifacts)

Usage:
    python aws/cloud_pipeline.py --bucket <your-bucket>

Prerequisites:
    - boto3 installed and AWS credentials available (EC2 IAM role or `aws configure`)
    - dataset uploaded to s3://<bucket>/data/credit_score_data.csv
"""
import argparse
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / "pipeline"))

from s3_helper import S3Helper  # noqa: E402


class CloudPipeline:
    DATA_KEY = "data/credit_score_data.csv"
    MODELS_PREFIX = "models/"

    def __init__(self, bucket_name, region="us-east-1", base_dir=None):
        self.bucket_name = bucket_name
        self.region = region
        self.base_dir = Path(base_dir) if base_dir else HERE.parent
        self.s3 = S3Helper(bucket_name, region)
        self.data_path = self.base_dir / "data" / "credit_score_data.csv"
        self.models_dir = self.base_dir / "models"

    def _download_data(self):
        print("\n" + "=" * 50)
        print("CLOUD STEP 1: DOWNLOAD DATA FROM S3")
        print("=" * 50)
        if not self.s3.file_exists(self.DATA_KEY):
            raise FileNotFoundError(
                f"Data not found at s3://{self.bucket_name}/{self.DATA_KEY}\n"
                f"Upload it first: aws s3 cp data/credit_score_data.csv s3://{self.bucket_name}/{self.DATA_KEY}"
            )
        self.s3.download_file(self.DATA_KEY, self.data_path)

    def _run_training(self):
        print("\n" + "=" * 50)
        print("CLOUD STEP 2: RUN TRAINING PIPELINE (on EC2)")
        print("=" * 50)
        from run_pipeline import CreditScorePipeline

        pipeline = CreditScorePipeline(base_dir=self.base_dir)
        pipeline.run()
        return pipeline.best_name, pipeline.best_score

    def _upload_artifacts(self):
        print("\n" + "=" * 50)
        print("CLOUD STEP 3: UPLOAD ARTIFACTS TO S3")
        print("=" * 50)
        if not self.models_dir.exists():
            raise FileNotFoundError(f"Models folder not found: {self.models_dir}")
        self.s3.upload_directory(self.models_dir, self.MODELS_PREFIX)

    def run(self):
        print(f"\n# CLOUD ML PIPELINE | bucket={self.bucket_name} | region={self.region}")
        self._download_data()
        best_name, best_score = self._run_training()
        self._upload_artifacts()
        print("\n# CLOUD PIPELINE COMPLETED")
        print(f"# Best model : {best_name}")
        print(f"# Best F1    : {best_score:.4f}")
        print(f"# Artifacts  : s3://{self.bucket_name}/{self.MODELS_PREFIX}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cloud ML pipeline (AWS)")
    parser.add_argument("--bucket", required=True, help="S3 bucket name")
    parser.add_argument("--region", default="us-east-1", help="AWS region")
    args = parser.parse_args()
    CloudPipeline(bucket_name=args.bucket, region=args.region).run()
