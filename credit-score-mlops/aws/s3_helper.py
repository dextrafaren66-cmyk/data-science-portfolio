"""
Small boto3 wrapper for the S3 operations used by the cloud pipeline and app:
download the dataset before training, upload model artifacts afterwards.

Requires AWS credentials (`aws configure`, an EC2 IAM role, or env vars).
"""
from pathlib import Path

import boto3
from botocore.exceptions import ClientError, NoCredentialsError


class S3Helper:
    def __init__(self, bucket_name, region="us-east-1"):
        self.bucket_name = bucket_name
        self.region = region
        self.s3 = boto3.client("s3", region_name=region)

    def upload_file(self, local_path, s3_key):
        local_path = str(local_path)
        try:
            self.s3.upload_file(local_path, self.bucket_name, s3_key)
            print(f"  [UPLOAD] {local_path} -> s3://{self.bucket_name}/{s3_key}")
            return True
        except (ClientError, NoCredentialsError) as e:
            print(f"  [ERROR] Upload failed: {e}")
            return False

    def download_file(self, s3_key, local_path):
        local_path = Path(local_path)
        local_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            self.s3.download_file(self.bucket_name, s3_key, str(local_path))
            print(f"  [DOWNLOAD] s3://{self.bucket_name}/{s3_key} -> {local_path}")
            return True
        except (ClientError, NoCredentialsError) as e:
            print(f"  [ERROR] Download failed: {e}")
            return False

    def upload_directory(self, local_dir, s3_prefix):
        """Recursively upload every file in a folder under an S3 prefix."""
        local_dir = Path(local_dir)
        count = 0
        for file_path in local_dir.rglob("*"):
            if file_path.is_file():
                rel_path = file_path.relative_to(local_dir)
                s3_key = f"{s3_prefix.rstrip('/')}/{rel_path.as_posix()}"
                if self.upload_file(file_path, s3_key):
                    count += 1
        print(f"  {count} files uploaded to s3://{self.bucket_name}/{s3_prefix}")
        return count

    def file_exists(self, s3_key):
        try:
            self.s3.head_object(Bucket=self.bucket_name, Key=s3_key)
            return True
        except ClientError:
            return False


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="S3 helper CLI")
    parser.add_argument("--bucket", required=True)
    parser.add_argument("--region", default="us-east-1")
    parser.add_argument("--action", required=True, choices=["upload", "download"])
    parser.add_argument("--local", required=True, help="local file path")
    parser.add_argument("--key", required=True, help="S3 object key")
    args = parser.parse_args()

    helper = S3Helper(args.bucket, args.region)
    if args.action == "upload":
        helper.upload_file(args.local, args.key)
    else:
        helper.download_file(args.key, args.local)
