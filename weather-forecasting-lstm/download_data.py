"""Download the Jena Climate 2009-2016 dataset into ./data (≈13 MB zip, 43 MB csv)."""
import io
import urllib.request
import zipfile
from pathlib import Path

URL = "https://storage.googleapis.com/tensorflow/tf-keras-datasets/jena_climate_2009_2016.csv.zip"
OUT = Path(__file__).resolve().parent / "data"

if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    target = OUT / "jena_climate_2009_2016.csv"
    if target.exists():
        print(f"Already downloaded: {target}")
    else:
        print(f"Downloading {URL} ...")
        with urllib.request.urlopen(URL) as resp:
            zipfile.ZipFile(io.BytesIO(resp.read())).extract("jena_climate_2009_2016.csv", OUT)
        print(f"Saved to {target}")
