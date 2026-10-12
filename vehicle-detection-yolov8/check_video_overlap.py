"""
Count the validation and test images that come from a video or photo also used in training.

Roboflow keeps the source in every file name: MVI_0222_MOV-35_jpg.rf.<hash>.jpg is frame 35
of video MVI_0222_MOV. Frames a fraction of a second apart are near-duplicates, so a test
frame from a training video is far easier than a photo from a camera the model has never
seen. Roboflow splits per image, which is why this happens.

Usage (after prepare_dataset.py has filled ./data):
    python check_video_overlap.py
"""
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"


def source_of(path):
    """Original file name, shared by every Roboflow copy of the same frame or photo."""
    return path.name.split(".rf.")[0]


def video_of(path):
    """MVI_0222_MOV-35_jpg.rf.<hash>.jpg -> MVI_0222_MOV, and None for a single photo."""
    match = re.match(r"(.+?)-\d+_jpg$", source_of(path))
    return match.group(1) if match else None


def main():
    train = list((DATA_DIR / "train" / "images").glob("*.jpg"))
    assert train, f"No training images in {DATA_DIR}. Run prepare_dataset.py first."
    train_videos = {video_of(p) for p in train} - {None}
    train_sources = {source_of(p) for p in train}

    print("=" * 50)
    print("OVERLAP WITH THE TRAINING SET")
    print("=" * 50)
    print(f"Train images : {len(train)} ({len(train_videos)} source videos)")
    for split in ("valid", "test"):
        images = list((DATA_DIR / split / "images").glob("*.jpg"))
        from_train_video = sum(video_of(p) in train_videos for p in images)
        same_source = sum(source_of(p) in train_sources for p in images)
        print(f"{split:5s} images : {len(images)} | frames from a training video: {from_train_video} "
              f"({from_train_video / len(images):.0%}) | same original file as a training image: {same_source}")


if __name__ == "__main__":
    main()
