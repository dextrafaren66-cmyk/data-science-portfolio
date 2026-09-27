# Dataset

The images aren't stored in the repo (they're big, and the dataset has its own license), so you download them once and let the script set everything up.

1. Open [Roboflow Universe: deteksi-kendaraan v5](https://universe.roboflow.com/irfan-maulana/deteksi-kendaraan/dataset/5).
2. Choose **Download Dataset → YOLOv8** and download the zip.
3. From the project folder, run `python prepare_dataset.py "<downloaded zip>"`. This fills this folder with *data.yaml* and the *train*, *valid* and *test* folders, using the same 1,347 / 440 / 212 subset as the project. Add `--full` if you want all 5,014 images.

License: CC BY 4.0 (dataset author: irfan-maulana on Roboflow Universe).
