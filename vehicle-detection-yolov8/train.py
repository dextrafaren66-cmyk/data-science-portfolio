"""
Train and evaluate a YOLOv8 vehicle / license-plate detector from the command line.

    python train.py                      # YOLOv8s, 30 epochs
    python train.py --model yolov8n.pt   # lighter comparison model

Expects the Roboflow export (YOLOv8 format) unzipped into ./data (data/data.yaml).
Best weights end up in runs/detect/<name>/weights/best.pt.
"""
import argparse
from pathlib import Path

import torch
import yaml
from ultralytics import YOLO

SEED = 42


def fix_data_yaml(data_yaml: Path) -> Path:
    """Make the split paths in data.yaml relative to the dataset folder."""
    cfg = yaml.safe_load(data_yaml.read_text())
    cfg.update(path=str(data_yaml.parent.resolve()),
               train="train/images", val="valid/images", test="test/images")
    data_yaml.write_text(yaml.dump(cfg, default_flow_style=False))
    return data_yaml


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="data/data.yaml")
    parser.add_argument("--model", default="yolov8s.pt", help="yolov8n.pt / yolov8s.pt / ...")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=8)
    parser.add_argument("--patience", type=int, default=10)
    args = parser.parse_args()

    data_yaml = Path(args.data)
    if not data_yaml.exists():
        raise SystemExit(f"{data_yaml} not found. Download the dataset first (see README).")
    fix_data_yaml(data_yaml)

    device = 0 if torch.cuda.is_available() else "cpu"
    run_name = f"vehicle_detection_{Path(args.model).stem}"

    model = YOLO(args.model)  # COCO-pretrained weights are downloaded automatically
    model.train(data=str(data_yaml), epochs=args.epochs, imgsz=args.imgsz, batch=args.batch,
                patience=args.patience, device=device, seed=SEED, deterministic=True,
                workers=0, name=run_name, exist_ok=True)

    best = Path("runs/detect") / run_name / "weights" / "best.pt"
    metrics = YOLO(best).val(data=str(data_yaml), split="test", workers=0,
                             name=f"{run_name}_test", exist_ok=True)
    print("\n=== Test set ===")
    print(f"mAP50     : {metrics.box.map50:.4f}")
    print(f"mAP50-95  : {metrics.box.map:.4f}")
    print(f"Precision : {metrics.box.mp:.4f}")
    print(f"Recall    : {metrics.box.mr:.4f}")
    print(f"Weights   : {best}")


if __name__ == "__main__":
    main()
