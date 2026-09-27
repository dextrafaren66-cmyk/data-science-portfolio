# Dextra Faren · Data Science Portfolio

I'm a Data Science undergraduate at BINUS University in Jakarta. These projects cover the whole workflow: cleaning messy data, statistical analysis, classical ML, deep learning, Bayesian modelling, and deploying models to the cloud.

If there's one thread running through all of them, it's this: **a score only means something next to a baseline and on clean data**. That's why you'll find a duplicate-row leak exposed in one project, naive forecasts benchmarked in another, and a prior-scale mistake owned up to in a third. I'd rather show a modest number I can defend than a perfect one I can't.

🌐 **[Portfolio website](https://dextrafaren66-cmyk.github.io/data-science-portfolio/)** · 📫 **[LinkedIn](https://www.linkedin.com/in/dextra-faren)** · **[Email](mailto:dextrafaren66@gmail.com)**

## Projects

| Project | What it shows | Headline result | Stack |
|---|---|---|---|
| **[Credit Score Classification: End-to-End MLOps](credit-score-mlops/)** | Dirty data cleaning, sklearn Pipelines, MLflow tracking, an approval gate, and deployment on AWS (S3, SageMaker, EC2) with a Streamlit app | Macro-F1 **0.72** (tuned RF) on 3 imbalanced classes | Python · scikit-learn · MLflow · Streamlit · AWS |
| **[Vehicle & License Plate Detection](vehicle-detection-yolov8/)** | Transfer learning for object detection on 13 Indonesian vehicle classes, a model size trade-off study, and a [live demo that runs in the browser](https://dextrafaren66-cmyk.github.io/data-science-portfolio/demo/) | mAP50 **0.81** (YOLOv8s), with a nano variant that's 2× faster | PyTorch · Ultralytics YOLOv8 · ONNX |
| **[Weather Forecasting with LSTMs](weather-forecasting-lstm/)** | Time series EDA, sliding windows, stacked LSTM vs BiLSTM, and **benchmarking against naive forecasts** | Next-hour MAE **0.48 °C**, 35% better than persistence | PyTorch · pandas |
| **[Bayesian House Price Regression](bayesian-house-prices/)** | MCMC with JAGS, convergence diagnostics, credible and predictive intervals, and fixing a prior scale mistake | Income effect **+$72k per SD**, R-hat ≤ 1.004 | R · JAGS · ggplot2 |
| **[Heart Disease Prediction](heart-disease-prediction/)** | Catching a 70% duplicate-row leak that inflates accuracy to 100%, then an honest model comparison | Recall **0.85**, ROC-AUC **0.87** | Python · scikit-learn |
| **[Bank Telemarketing EDA](bank-marketing-eda-r/)** | Data quality assessment, feature engineering, interactive charts and business recommendations | Warm leads convert **~6×** better | R · dplyr · plotly · R Markdown |

## Other projects

| Project | What it shows | Stack |
|---|---|---|
| **[GameStoB: Game Store Web UI](gamestob-web-design/)** | HCI course project: a storefront I designed in Figma and hand-coded, with a filterable catalog, a persistent cart and a validated checkout | HTML · CSS · JavaScript · Figma |

## Skills

- **Languages:** Python, R, SQL
- **ML / DL:** scikit-learn, PyTorch, Ultralytics YOLO, gradient boosting, LSTMs, transfer learning
- **Statistics:** Bayesian inference (JAGS / MCMC), hypothesis testing, time series analysis
- **MLOps & Cloud:** MLflow, Streamlit, AWS (S3, EC2, SageMaker), Git
- **Data:** pandas, dplyr, data cleaning, EDA, matplotlib, seaborn, ggplot2, plotly

## Repository layout

Each folder is self-contained, with its own README, data (or download instructions) and dependencies, so you can clone the repo and run any single project without touching the others.

```
data-science-portfolio/
├── credit-score-mlops/
├── vehicle-detection-yolov8/
├── weather-forecasting-lstm/
├── bayesian-house-prices/
├── heart-disease-prediction/
├── bank-marketing-eda-r/
├── gamestob-web-design/      # web UI (HCI), not data science
└── docs/                     # portfolio website (GitHub Pages)
```
