"""
Build the training dataset from the Roboflow export.

The full Roboflow export (v5, YOLOv8 format) has 5,014 images. The project used a
~40% subset (1,347 train / 440 val / 212 test) to keep training feasible on a 6 GB
laptop GPU. This script recreates that setup:

  * test  -> the exact 212 images used for the reported results (test_subset.txt)
  * train -> 1,347 images sampled with a fixed seed
  * valid ->   440 images sampled with a fixed seed

Usage:
    python prepare_dataset.py "Deteksi Kendaraan.v5-dataset1.yolov8.zip"
    python prepare_dataset.py <zip> --full     # use all 5,014 images instead
"""
import argparse
import random
import shutil
import zipfile
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
OUT = HERE / "data"
SEED = 42
SUBSET_SIZES = {"train": 1347, "valid": 440}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("zip_path", help="Roboflow export zip (YOLOv8 format)")
    parser.add_argument("--full", action="store_true", help="use every image in the export")
    args = parser.parse_args()

    zf = zipfile.ZipFile(args.zip_path)
    images = {s: sorted(n for n in zf.namelist() if n.startswith(f"{s}/images/") and not n.endswith("/"))
              for s in ("train", "valid", "test")}

    if args.full:
        chosen = images
    else:
        rng = random.Random(SEED)
        test_names = set((HERE / "test_subset.txt").read_text().split())
        chosen = {
            "train": rng.sample(images["train"], SUBSET_SIZES["train"]),
            "valid": rng.sample(images["valid"], SUBSET_SIZES["valid"]),
            "test": [n for n in images["test"] if Path(n).name in test_names],
        }

    for split in ("train", "valid", "test"):
        shutil.rmtree(OUT / split, ignore_errors=True)
        for img in chosen[split]:
            label = img.replace("/images/", "/labels/").rsplit(".", 1)[0] + ".txt"
            for member in (img, label):
                if member in zf.NameToInfo:
                    target = OUT / member
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(zf.read(member))
        print(f"{split:5s}: {len(chosen[split])} images")

    cfg = yaml.safe_load(zf.read("data.yaml"))
    cfg.update(path=str(OUT), train="train/images", val="valid/images", test="test/images")
    (OUT / "data.yaml").write_text(yaml.dump(cfg, default_flow_style=False, allow_unicode=True))
    print(f"Wrote {OUT / 'data.yaml'}")


if __name__ == "__main__":
    main()
