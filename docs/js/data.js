/* =============================================================================
   PORTFOLIO_DATA: edit this file to update the website.
   Every section of the site is rendered from the objects below, so you never
   need to touch the HTML, CSS or other JS files to change content.

   Quick start (things to fill in before publishing):
     1. site.githubUser   → your GitHub username
     2. links.linkedin    → your LinkedIn profile URL
     3. links.email       → your email address
     4. site.cvUrl        → put your CV at docs/assets/cv/ and write its path here
                            (leave "" to hide the "Download CV" buttons)

   Formatting inside any text: *italic* (use it for code names such as
   *Pipeline* or *pdays*) and **bold** (use it for key terms only).
   Writing style: first person, explain the "why", no dashes as separators.
   ============================================================================= */

const PORTFOLIO_DATA = {
  site: {
    name: "Dextra Faren",
    role: "Data Science Student",
    tagline:
      "I turn messy data into models that still hold up outside the notebook. Clean data first, honest metrics always.",
    location: "Jakarta, Indonesia",
    githubUser: "dextrafaren66-cmyk",       // your GitHub username (every GitHub link is built from it)
    repoName: "data-science-portfolio",      // the repo that holds the project code
    cvUrl: "assets/cv/Dextra_Faren_CV.pdf",  // public copy of the CV (no phone number)
    formEndpoint: "",                        // optional: a Formspree URL; empty = opens the visitor's email app
    year: 2026,
  },

  links: {
    github: "",                              // auto-filled from site.githubUser if left empty
    linkedin: "https://www.linkedin.com/in/dextra-faren",
    email: "dextrafaren66@gmail.com",
  },

  about: {
    heading: "Data first. Then the model.",
    paragraphs: [
      "I'm a Data Science undergraduate at BINUS University in Jakarta. What I enjoy most is the whole arc of a data problem: figuring out where the data came from, cleaning it properly, picking a model that fits the question, and shipping something another person can actually use.",
      "A model is only as solid as the data under it, the same way a house is only as solid as its foundation. That's why I spend so much time on **baselines** and **data leakage**. What is 100% accuracy worth if most of the test set was already in training? I'd rather report a modest number I can defend than a perfect one I can't.",
      "My work covers classical machine learning, deep learning for vision and time series, and Bayesian statistics. Right now I'm looking for an internship in data science, machine learning or analytics, ideally on a team that works on problems with real users.",
    ],
    highlights: [
      { label: "Focus", value: "Machine learning & applied statistics" },
      { label: "Approach", value: "Baselines first, honest metrics, reproducible code" },
      { label: "Looking for", value: "Data science / ML internships" },
    ],
  },

  // icon: code | barChart | brain | cpu | sigma | layers | activity | cloud | database | wrench | sparkles
  skills: [
    { category: "Programming", icon: "code", items: ["Python", "SQL", "R"] },
    { category: "Data Analysis", icon: "barChart", items: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "dplyr"] },
    { category: "Machine Learning", icon: "brain", items: ["Scikit-learn", "XGBoost", "Random Forest", "Gradient Boosting"] },
    { category: "Deep Learning", icon: "cpu", items: ["PyTorch", "TensorFlow", "Keras", "YOLOv8", "LSTM"] },
    { category: "Statistics", icon: "sigma", items: ["Bayesian inference", "JAGS / MCMC", "Hypothesis testing"] },
    { category: "Data Visualization", icon: "layers", items: ["Tableau", "ggplot2", "Plotly", "Matplotlib"] },
    { category: "MLOps / Experimentation", icon: "activity", items: ["MLflow", "Optuna"] },
    { category: "Deployment & Cloud", icon: "cloud", items: ["Streamlit", "AWS S3", "AWS EC2", "AWS SageMaker"] },
    { category: "Optimization", icon: "database", items: ["Pyomo"] },
    { category: "Tools", icon: "wrench", items: ["Jupyter Notebook", "VS Code", "Git", "GitHub", "Microsoft Office", "Cisco Packet Tracer"] },
  ],

  /* ---------------------------------------------------------------------------
     PROJECTS
     - `folder`   : sub-folder in the GitHub repo (used to build the GitHub link)
     - `demo`     : optional live-demo URL (relative paths work on GitHub Pages)
     - `chart`    : small bar chart shown in the project pop-up
                    { title, note, unit, decimals, items: [{ label, value, highlight }] }
     - `sections` : pop-up content. Any section can be removed; only the ones
                    that exist are shown. Values can be a string, an array of
                    strings (rendered as bullets) or an object { text, bullets }.
     - `figures`  : images shown in the pop-up (put files in assets/img/)
     --------------------------------------------------------------------------- */
  projects: [
    {
      id: "credit-score-mlops",
      title: "Credit Score Classification",
      subtitle: "End-to-end MLOps pipeline",
      category: "Machine Learning · MLOps",
      folder: "credit-score-mlops",
      demo: "",
      description:
        "Predicts whether a customer's credit score is Good, Standard or Poor, all the way from messy raw data to a Streamlit app running on AWS.",
      problem:
        "Banks need a fast, consistent first read on credit risk, but the raw customer data is full of broken values that quietly corrupt any model trained on it.",
      methodology:
        "Rule-based cleaning, scikit-learn Pipelines, 4 baseline models, GridSearch tuning, MLflow tracking, an F1 approval gate, SageMaker training and EC2 deployment.",
      metric: { value: "0.72", label: "macro-F1 across 3 imbalanced classes" },
      tech: ["Python", "Scikit-learn", "MLflow", "Streamlit", "AWS S3", "AWS EC2", "SageMaker"],
      image: "assets/img/credit-app.jpg",
      imageAlt: "Streamlit credit score prediction app",
      chart: {
        title: "Macro-F1 by model",
        note: "Higher is better",
        decimals: 3,
        items: [
          { label: "Logistic Regression", value: 0.576 },
          { label: "Gradient Boosting", value: 0.695 },
          { label: "Random Forest", value: 0.705 },
          { label: "Random Forest (tuned)", value: 0.718, highlight: true },
        ],
      },
      sections: {
        overview:
          "I built this as a production-style pipeline, not a notebook experiment. The same code trains locally with MLflow tracking, trains on AWS SageMaker, and serves predictions through a Streamlit app on EC2 that pulls the model from S3. Why go through all three? Because a model that only runs on my laptop isn't really deployed.",
        problem:
          "The target is imbalanced (Standard 53%, Poor 29%, Good 17%), and the data looks like real operational data: numbers stored as text, junk placeholders, impossible ages. Train a model on that naively and it will happily learn the noise.",
        dataset:
          "25,000 customer records from the public Kaggle Credit Score Classification dataset, with 27 columns covering income, accounts, loans, payment behaviour and credit history.",
        preprocessing: [
          "Stripped trailing underscores from numeric text (\"39_\" becomes 39), because otherwise the whole column is read as text.",
          "Replaced junk placeholders (_______, _, !@9#%8) with missing values, so they get imputed instead of being treated as a real category.",
          "Parsed \"22 Years and 1 Months\" into credit history length in months, a number a model can actually compare.",
          "Set impossible ages (e.g. 8,466) to missing, then imputed medians and modes.",
          "Dropped identifiers (ID, Name, SSN) and free-text loan types, since they either identify a person or add noise.",
        ],
        eda: [
          "Several key features are heavily right-skewed, which is why I imputed with the median instead of the mean.",
          "Missing values are scattered rather than clustered, so simple imputation is safe here.",
          "Credit mix, outstanding debt and interest rate separate the classes most clearly.",
        ],
        methodology:
          "All preprocessing lives inside one scikit-learn *Pipeline* (imputation, scaling, one-hot encoding). I think of it as a recipe card that travels with the dish: training and inference follow exactly the same steps, so they can't drift apart. Every candidate model is logged to MLflow, and the best one is promoted only if it clears a macro-F1 **approval gate**.",
        model:
          "Random Forest, chosen over Logistic Regression, Decision Tree and Gradient Boosting, then tuned with 3-fold *GridSearchCV*.",
        metrics: [
          "**Macro-F1** as the main metric. Plain accuracy would reward a model that predicts 'Standard' for everyone; macro-F1 makes the small 'Good' class count just as much.",
          "Accuracy, macro precision and macro recall for context.",
        ],
        results:
          "The tuned Random Forest reached macro-F1 0.718 and accuracy 0.743 on a stratified 20% hold-out (5,000 rows). The Random Forest in the production pipeline scored 0.705 and passed the 0.5 approval gate.",
        insights: [
          "Outstanding debt, interest rate and days past due are the strongest predictors.",
          "Most of the gain came from cleaning, not from model choice. It's the step people like to skip, and here it was the step that mattered most.",
        ],
        challenges: [
          "The 'Good' class is small and overlaps with 'Standard', which caps its F1 at about 0.63.",
          "Keeping local, SageMaker and EC2 training identical meant sharing one cleaning specification across three entry points.",
        ],
        future: [
          "Use each customer's monthly history as sequence features, since the data has one row per customer per month.",
          "Add probability calibration and cost-sensitive thresholds for the Poor class.",
          "Containerise the app and add CI for the training pipeline.",
        ],
      },
      figures: [
        { src: "assets/img/credit-app.jpg", caption: "Streamlit app: a customer profile and the predicted class probabilities." },
        { src: "assets/img/credit-importance.jpg", caption: "Feature importance of the tuned Random Forest." },
        { src: "assets/img/credit-mlflow.jpg", caption: "MLflow tracking of the three pipeline models." },
      ],
    },

    {
      id: "vehicle-detection-yolov8",
      title: "Vehicle & License Plate Detection",
      subtitle: "Computer vision with YOLOv8",
      category: "Computer Vision · Object Detection",
      folder: "vehicle-detection-yolov8",
      demo: "demo/",                // runs the model in the visitor's browser (docs/demo)
      demoLabel: "Live demo",
      description:
        "Detects 13 classes of Indonesian road users in a single image, from cars and motorbikes to angkot, becak and license plates.",
      problem:
        "Traffic monitoring and plate identification are still largely manual, and off-the-shelf detectors don't know local vehicles like angkot or becak.",
      methodology:
        "Transfer learning from COCO-pretrained YOLOv8s, a fair comparison against YOLOv8n, per-class evaluation and a live demo that runs in the browser.",
      metric: { value: "0.81", label: "mAP50 on the held-out test set" },
      tech: ["Python", "PyTorch", "YOLOv8", "Roboflow", "ONNX"],
      image: "assets/img/yolo-confusion.jpg",
      imageAlt: "Confusion matrix of the YOLOv8s detector",
      chart: {
        title: "mAP50 by class (YOLOv8s)",
        note: "Higher is better · selected classes",
        decimals: 2,
        items: [
          { label: "Car", value: 0.952 },
          { label: "Motorbike", value: 0.934 },
          { label: "Pickup", value: 0.916 },
          { label: "Medium truck", value: 0.843 },
          { label: "License plate", value: 0.728, highlight: true },
        ],
      },
      sections: {
        overview:
          "A YOLOv8 object detector trained on Indonesian street scenes, built as a team project. The real question behind it is a deployment one: is the bigger model actually worth its cost, or is the small one good enough?",
        problem:
          "Indonesian roads mix cars and motorbikes with vehicles that general-purpose detectors have never seen (ask a COCO model what an angkot is). License plates add a second problem: they're small, so boxing them precisely is hard.",
        dataset:
          "Roboflow Universe 'Deteksi Kendaraan' v5 (CC BY 4.0), 13 classes. We used a fixed ~40% subset (1,347 train, 440 validation and 212 test images) so training fits on a 6 GB laptop GPU.",
        preprocessing: [
          "Images resized to 640×640.",
          "Built-in augmentation (mosaic, horizontal flip, HSV jitter), so the model sees more variety than 1,347 images alone would give it.",
          "One fixed test set of 212 images for every experiment. Without that, comparing the two models would mean nothing.",
        ],
        methodology:
          "We fine-tuned COCO-pretrained weights for 30 epochs with early stopping (patience 10), batch size 8, seed 42 and deterministic mode. **Transfer learning** is like hiring someone who can already drive and only teaching them the local roads: the model already knows what wheels and edges look like, it just needs to learn angkot and becak. YOLOv8n was trained with identical settings, so the speed vs accuracy comparison is fair.",
        model: "YOLOv8s (11.1M parameters) as the final model, and YOLOv8n (3.0M) as the lightweight alternative.",
        metrics: [
          "**mAP50** and **mAP50-95**, which measure detection quality at loose and strict box overlap.",
          "Precision, recall and inference time per image.",
        ],
        results:
          "YOLOv8s reached mAP50 0.814, mAP50-95 0.574, precision 0.793 and recall 0.765 at 10.5 ms per image. YOLOv8n was twice as fast (5.1 ms) but about 5 points lower on mAP50 and 9 points lower on recall. For traffic monitoring I'd pick the s model: missing 9% more vehicles costs more than 5 ms ever will.",
        insights: [
          "Cars and motorbikes, the most frequent classes, are detected almost perfectly.",
          "License plates are the weakest class (mAP50-95 0.40). A box that's a few pixels off is a small miss on a car but a big miss on a plate.",
          "Training and validation losses fell together, so there was no sign of overfitting.",
        ],
        challenges: [
          "The full 5,014-image dataset was too slow to train on our laptops, so we used a fixed ~40% subset.",
          "Rare classes (large bus, bicycle, large truck) have fewer than 12 test images each, so their scores are noisy.",
        ],
        future: [
          "A two-stage pipeline: detect the plate first, then run OCR to actually read the number.",
          "Higher input resolution or SAHI tiling for small objects.",
          "More examples of the rare classes.",
        ],
      },
      figures: [
        { src: "assets/img/yolo-curves.jpg", caption: "Training curves for YOLOv8s (left) and YOLOv8n (right)." },
        { src: "assets/img/yolo-confusion.jpg", caption: "Confusion matrix of YOLOv8s on the test set." },
      ],
    },

    {
      id: "weather-forecasting-lstm",
      title: "Hourly Temperature Forecasting",
      subtitle: "Time series with LSTMs",
      category: "Deep Learning · Time Series",
      folder: "weather-forecasting-lstm",
      demo: "",
      description:
        "Forecasts next-hour temperature from 72 hours of weather readings, benchmarked honestly against naive forecasts.",
      problem:
        "Hourly temperature is so autocorrelated that even 'repeat the last value' scores R² 0.98. A model has to beat that, not just look good.",
      methodology:
        "Time series EDA, chronological splitting, 72-hour sliding windows, a stacked LSTM in PyTorch and a bidirectional ablation.",
      metric: { value: "0.48 °C", label: "MAE, 35% lower than persistence" },
      tech: ["Python", "PyTorch", "Pandas", "Scikit-learn", "Matplotlib"],
      image: "assets/img/weather-predictions.jpg",
      imageAlt: "Actual versus predicted temperature on the test set",
      chart: {
        title: "Mean absolute error (°C)",
        note: "Lower is better",
        unit: " °C",
        decimals: 2,
        items: [
          { label: "Seasonal naive (t−24h)", value: 2.379 },
          { label: "Persistence (t+1 = t)", value: 0.745 },
          { label: "Bidirectional LSTM", value: 0.477 },
          { label: "Stacked LSTM", value: 0.484, highlight: true },
        ],
      },
      sections: {
        overview:
          "A PyTorch LSTM that predicts the temperature one hour ahead from the previous three days of weather data. The interesting part isn't the LSTM itself, it's the comparison against the simple forecasts it has to beat.",
        problem:
          "A forecast score means nothing on its own. If 'the next hour looks like this hour' already gets you most of the way, what is the model actually adding? My goal was a model that measurably improves on **persistence** and **seasonal naive** forecasts.",
        dataset:
          "Jena Climate 2009–2016: 420,551 readings recorded every 10 minutes at the Max Planck Institute weather station in Jena, Germany, with 14 weather variables.",
        preprocessing: [
          "Fixed −9999 wind speed sensor errors, which the scaler would otherwise read as a hurricane.",
          "Subsampled from 10-minute to hourly readings.",
          "Kept 5 non-redundant inputs: pressure, temperature, humidity, wind speed and wind direction.",
          "Split chronologically 70 / 20 / 10 and fitted the scaler on training data only. A random split would let the model peek at the future.",
        ],
        eda: [
          "A strong yearly cycle (about 0 °C in January up to 19 °C in July) and a daily cycle that peaks around 2 pm.",
          "Derived variables like *Tpot* and *VPmax* are near-duplicates of temperature, so I left them out.",
        ],
        methodology:
          "72-hour sliding windows predict the next hour. Training used MSE loss, Adam, gradient clipping, *ReduceLROnPlateau* and early stopping that restores the best checkpoint.",
        model: "Two stacked LSTM layers (hidden size 64, dropout 0.2) feeding a small dense head, 54k parameters in total.",
        metrics: ["MAE and RMSE in °C, plus R²", "Always compared with the persistence and seasonal naive baselines on exactly the same test windows"],
        results:
          "The LSTM reached MAE 0.48 °C and RMSE 0.69 °C, cutting the error by about 35% compared to persistence (0.74 °C). The bidirectional variant was marginally better (0.477 °C) but needed 2.6× the parameters, which I don't think is worth it.",
        insights: [
          "R² alone is misleading here, because the naive baseline already scores 0.98.",
          "Errors are centred on zero, with no bias anywhere in the −10 to 35 °C range.",
          "More capacity (BiLSTM) gave diminishing returns.",
        ],
        challenges: [
          "Fixed a bug where early stopping kept a reference to the live weights instead of a copy of the best ones, so the 'best' model was quietly just the last one.",
          "Sensor error cleaning had to happen before the feature matrix was built, not after.",
        ],
        future: [
          "Multi-step forecasts (the next 24 hours), where persistence breaks down and a model has more room to prove itself.",
          "Cyclical time features and a gradient boosting baseline on lag features.",
        ],
      },
      figures: [
        { src: "assets/img/weather-predictions.jpg", caption: "Actual vs predicted temperature on the full test period and a zoomed window." },
        { src: "assets/img/weather-seasonality.jpg", caption: "Monthly and daily temperature cycles." },
        { src: "assets/img/weather-errors.jpg", caption: "Error distribution and actual vs predicted scatter." },
      ],
    },

    {
      id: "bayesian-house-prices",
      title: "Bayesian House Price Regression",
      subtitle: "MCMC and uncertainty in R",
      category: "Statistics · Bayesian Inference",
      folder: "bayesian-house-prices",
      demo: "",
      description:
        "A Bayesian regression of California house values fitted with MCMC, where every estimate and prediction comes with a credible interval.",
      problem:
        "A single price estimate hides risk. Investors and lenders need to know how uncertain a valuation is, not just its expected value.",
      methodology:
        "Bayesian linear regression in JAGS (Gibbs sampling), 3 chains, R-hat and effective sample size diagnostics, and posterior predictive intervals.",
      metric: { value: "$89k–$355k", label: "95% predictive interval around a $223k estimate" },
      tech: ["R", "JAGS", "rjags", "coda", "dplyr", "ggplot2"],
      image: "assets/img/bayes-coefficients.jpg",
      imageAlt: "Posterior coefficients with 95% credible intervals",
      chart: {
        title: "Effect on house value per +1 SD ($k)",
        note: "Posterior means · all credible except population per household",
        unit: "k",
        decimals: 1,
        items: [
          { label: "Median income", value: 72.5, highlight: true },
          { label: "Housing age", value: 21.2 },
          { label: "Pop. per household", value: -0.6 },
          { label: "Total rooms", value: -33.6 },
          { label: "Population", value: -35.6 },
        ],
      },
      sections: {
        overview:
          "A revised version of a group course project: a Bayesian linear regression of district-level house values. The goal isn't a sharper prediction, it's an honest one, with uncertainty attached to every coefficient and every forecast.",
        problem:
          "Ordinary regression gives you one number and says nothing about how sure it is. A weather forecast of '30 °C' is less useful than '28 to 32 °C', and house prices work the same way. So how confident can we be about each driver of price, and how wide is the plausible range for a new district?",
        dataset:
          "California Housing (1990 U.S. Census), 20,640 block groups. 19,475 remain after removing missing values and districts at the $500,001 price cap.",
        preprocessing: [
          "Removed prices capped at $500,001, since the cap squashes the whole upper tail into one fake value.",
          "Engineered ratio features (rooms per household, bedrooms per room, population per household).",
          "Standardised the predictors and expressed price in $100k, so the 'weakly informative' priors really are weakly informative.",
        ],
        methodology:
          "y ~ Normal(β₀ + Xβ, σ) with weakly informative Normal priors on the coefficients and a Gamma prior on the precision, sampled with JAGS: 3 chains, 2,000 burn-in and 5,000 draws each.",
        model: "Bayesian multiple linear regression (Gibbs sampling via JAGS).",
        metrics: ["Gelman-Rubin R-hat and effective sample size", "95% credible and predictive intervals", "DIC and Bayesian R²"],
        results:
          "All chains converged (R-hat ≤ 1.004). Median income is the dominant and most precisely estimated driver (+$72.5k per SD). For a hypothetical district the expected value is $223k, but the 95% predictive interval is $89k–$355k.",
        insights: [
          "Posterior means match OLS almost exactly, a useful sanity check that the priors aren't dominating the data.",
          "The opposite signs on households, rooms and population come from collinear block counts, so they have to be read together, not one by one.",
          "The model is confident about averages, but individual districts still vary a lot (σ ≈ $68k).",
        ],
        challenges: [
          "The original course version put 'vague' priors on raw-scale coefficients. At dollar scale those priors were actually very tight, and they shrank the income effect to about $30 per unit instead of about $46,000. It's like measuring a highway with a ruler marked in millimetres. After the course I rescaled the data myself, and the estimate came back to where it should be.",
        ],
        future: [
          "A log-price likelihood to keep predictions positive.",
          "Location effects (coordinates, ocean proximity) or a spatial random effect.",
        ],
      },
      figures: [
        { src: "assets/img/bayes-coefficients.jpg", caption: "Posterior coefficients with 95% credible intervals." },
        { src: "assets/img/bayes-predictive.jpg", caption: "Posterior predictive distribution for a new district." },
        { src: "assets/img/bayes-traces.jpg", caption: "MCMC trace plots for all parameters (3 chains)." },
      ],
    },

    {
      id: "heart-disease-prediction",
      title: "Heart Disease Prediction",
      subtitle: "Catching a data leak before modelling",
      category: "Machine Learning · Healthcare",
      folder: "heart-disease-prediction",
      demo: "",
      description:
        "Predicts heart disease from 13 clinical measurements, after I found that 70% of this popular dataset is duplicate rows.",
      problem:
        "Missing a sick patient is costly, so recall matters most. But duplicate records can make any model look perfect.",
      methodology:
        "Duplicate audit and leak demonstration, EDA, a stratified split, 4 classifiers, GridSearch tuning, and recall-focused evaluation with ROC curves.",
      metric: { value: "0.85", label: "recall on the disease class (ROC-AUC 0.87)" },
      tech: ["Python", "Scikit-learn", "Pandas", "Seaborn"],
      image: "assets/img/heart-roc.jpg",
      imageAlt: "ROC curves of the compared models",
      chart: {
        title: "Test accuracy",
        note: "The first bar is inflated by duplicate rows",
        decimals: 3,
        items: [
          { label: "Random Forest (with duplicates)", value: 1.0 },
          { label: "SVM", value: 0.770 },
          { label: "Random Forest (tuned)", value: 0.787 },
          { label: "Logistic Regression", value: 0.803, highlight: true },
        ],
      },
      sections: {
        overview:
          "A classification study on the UCI Heart Disease data. My main contribution here is methodological: catching a data quality problem that makes a lot of published results on this dataset unreliable. If you've seen notebooks scoring 100% on it, this is why.",
        problem:
          "Doctors need a quick screening aid that rarely misses patients with heart disease. That only works if the model is trained and tested on data we can trust.",
        dataset:
          "UCI Heart Disease (Cleveland), the 1,025-row Kaggle version. Only 302 rows are unique patients; the other 723 are exact duplicates.",
        preprocessing: [
          "Removed the 723 duplicate rows before splitting. Otherwise the same patient lands in both train and test, which is basically handing the model the answer key.",
          "Stratified 80/20 split, with scaling fitted on training data only.",
        ],
        eda: [
          "Chest pain type, max heart rate and ST slope correlate positively with disease.",
          "Exercise-induced angina, ST depression and number of vessels correlate negatively.",
        ],
        methodology:
          "Compared Logistic Regression, Random Forest, SVM and KNN, then tuned the Random Forest with 5-fold GridSearch over 108 combinations.",
        model:
          "Logistic Regression as the final model. The simplest model generalised best, and it's also the easiest to explain to a clinician, which in healthcare matters more than a fraction of a point.",
        metrics: ["**Recall** on the disease class as the main metric", "Accuracy, precision, F1 and ROC-AUC"],
        results:
          "With the duplicates left in, 202 of the 205 test rows also appear in training, and a Random Forest scores a misleading 100%. On unique patients, Logistic Regression reaches accuracy 0.80, recall 0.85, F1 0.82 and ROC-AUC 0.87.",
        insights: [
          "Auditing the data changed the conclusion more than any model choice did.",
          "On a small dataset (302 patients), simple linear models often beat ensembles.",
        ],
        challenges: ["A 61-patient test set makes single-split scores noisy. Cross-validation (0.85 for the tuned forest) gives a steadier picture."],
        future: ["Repeated stratified CV", "Probability calibration", "Threshold tuning to push recall higher"],
      },
      figures: [
        { src: "assets/img/heart-roc.jpg", caption: "ROC curves for all models." },
        { src: "assets/img/heart-confusion.jpg", caption: "Confusion matrices on the de-duplicated test set." },
        { src: "assets/img/heart-importance.jpg", caption: "Feature importance (tuned Random Forest)." },
      ],
    },

    {
      id: "bank-marketing-eda",
      title: "Bank Telemarketing Analysis",
      subtitle: "EDA and business recommendations in R",
      category: "Data Analysis · Visualization",
      folder: "bank-marketing-eda-r",
      demo: "reports/bank_marketing_eda.html",
      demoLabel: "Interactive report",
      description:
        "Explores a bank's phone campaign for term deposits to find out who subscribes and where the marketing team should focus its calls.",
      problem:
        "Only 11.9% of contacted clients subscribed. Instead of phoning everyone, the team needs to know where to focus.",
      methodology:
        "Data quality assessment, cleaning, feature engineering, statistical tests, interactive plotly charts and persona-based recommendations.",
      metric: { value: "~6×", label: "higher conversion for previously contacted clients" },
      tech: ["R", "dplyr", "tidyr", "ggplot2", "Plotly", "R Markdown"],
      image: "assets/img/bank-education.jpg",
      imageAlt: "Subscription rate by education level and age group",
      chart: {
        title: "Subscription rate by contact history",
        note: "Share of clients who subscribed",
        unit: "%",
        decimals: 1,
        items: [
          { label: "Never contacted before", value: 10.8 },
          { label: "Contacted over a week ago", value: 65.6 },
          { label: "Contacted within a week", value: 70.5, highlight: true },
        ],
      },
      sections: {
        overview:
          "An exploratory analysis in R Markdown that turns a bank's campaign data into concrete targeting recommendations. It knits to an interactive HTML report you can open right here.",
        problem: "Most calls don't convert. So which clients are worth calling, and what makes a call succeed?",
        dataset: "An 8,237-row sample of the UCI Bank Marketing dataset (Portuguese bank, Moro et al., 2014).",
        preprocessing: [
          "Converted 'unknown' categories to missing values and removed them.",
          "Treated the *pdays* = 999 sentinel as 'never contacted', not as a real number of days.",
          "Grouped education levels and removed extreme call durations.",
          "Engineered age group, contact recency and total contact attempts.",
        ],
        eda: [
          "Students (33%) and retirees (32%) subscribe the most, blue-collar workers the least (9%). Chi-squared p < 2e-16.",
          "Clients over 50 and university-educated clients under 30 respond best.",
        ],
        methodology: "Correlation and chi-squared tests, subscription rates per segment and interactive visualisation, followed by business recommendations.",
        results:
          "Previously contacted clients subscribe at 65–70%, versus about 11% for cold contacts. Successful calls also last about twice as long (518 s vs 220 s), but call length is only known after the call.",
        insights: [
          "**Warm leads** are by far the most valuable segment. If I were on the marketing team, that's where the budget would go first.",
          "The 30–50 age group is the largest but the least responsive. I'd research why before writing them off.",
          "Call duration is a correlation, not a lever: you can't use it to decide who to call.",
        ],
        future: ["A predictive lead scoring model that leaves out post-call variables such as duration."],
      },
      figures: [
        { src: "assets/img/bank-education.jpg", caption: "Subscription rate by education level, faceted by age group." },
        { src: "assets/img/bank-duration.jpg", caption: "Average call duration by outcome." },
      ],
    },
  ],

  // Smaller, non-data-science work shown as a compact list under the projects.
  otherProjects: [
    {
      title: "GameStoB: Game Store Web UI",
      description: "HCI course project: a storefront I designed in Figma and hand-coded in HTML, CSS and JavaScript.",
      tech: ["HTML", "CSS", "JavaScript", "Figma"],
      folder: "gamestob-web-design",
      demo: "gamestob/",
    },
  ],

  /* ---------------------------------------------------------------------------
     EXPERIENCE & ACTIVITIES
     type: "Organization" | "Leadership" | "Academic project" | "Volunteer" | "Work"
     Add your organisation, leadership and volunteer roles here. Example:
     {
       type: "Organization",
       role: "Member, Research & Development Division",
       organization: "Student Organization Name",
       date: "Sep 2025 – Present",
       description: "One sentence about the role.",
       responsibilities: ["What you did", "What you did"],
       achievements: ["A result you are proud of"],
     },
     --------------------------------------------------------------------------- */
  experience: [
    {
      type: "Academic project",
      role: "Individual project",
      organization: "Model Deployment course, BINUS University",
      date: "Jun 2026",
      description: "Built and deployed an end-to-end credit scoring pipeline on AWS.",
      responsibilities: [
        "Designed the cleaning, training and evaluation pipeline with MLflow tracking",
        "Trained on AWS SageMaker and served a Streamlit app from EC2, with models stored in S3",
      ],
      achievements: ["Macro-F1 0.72 on an imbalanced three-class problem"],
    },
    {
      type: "Academic project",
      role: "Team project",
      organization: "Deep Learning course, BINUS University",
      date: "May–Jun 2026",
      description: "Vehicle and license plate detection with YOLOv8 for Indonesian traffic, presented with a project poster.",
      responsibilities: [
        "Wrote the project's code: dataset checks, YOLOv8s and YOLOv8n fine-tuning, and test-set evaluation",
      ],
      achievements: ["mAP50 0.81 across 13 vehicle classes"],
    },
    {
      type: "Academic project",
      role: "Individual project",
      organization: "Human-Computer Interaction course, BINUS University",
      date: "Jun 2026",
      description: "Designed GameStoB in Figma and built it as a responsive website.",
      responsibilities: ["Applied HCI principles: feedback, consistency and form grouping", "Implemented a filterable catalog, a cart and a validated checkout"],
      achievements: [],
    },
    {
      type: "Academic project",
      role: "Team project",
      organization: "Bayesian Data Analysis course, BINUS University",
      date: "Jan 2026",
      description: "Bayesian regression of California house prices with JAGS, written up as a research paper. After the course I revised it on my own to fix the prior scaling.",
      responsibilities: [
        "Cleaned and prepared the data: missing values, the $500,001 price cap and engineered ratio features",
        "Wrote the R and JAGS code for the model, MCMC sampling and convergence diagnostics",
      ],
      achievements: [],
    },
  ],

  education: [
    {
      school: "BINUS University",
      program: "Bachelor's degree, Data Science",
      date: "2024–2028 (expected)",             // ← EDIT if needed
      location: "Jakarta, Indonesia",
      coursework: [
        "Machine Learning", "Deep Learning", "Bayesian Data Analysis", "Model Deployment",
        "Data Mining & Visualization", "Scientific Computing", "Big Data Infrastructure",
        "Database Technology", "Survey & Sampling Methods", "Algorithm Design & Analysis",
      ],
      achievements: [],                                   // e.g. "GPA 3.8 / 4.0", "Dean's list"
    },
  ],

  /* Add certifications here; the section shows coursework while this list is empty.
     Example:
     { name: "Google Data Analytics", issuer: "Coursera", date: "Mar 2026", url: "https://..." }
  */
  certifications: [],
};
