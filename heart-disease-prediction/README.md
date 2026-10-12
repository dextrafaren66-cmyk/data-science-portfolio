# Heart Disease Prediction

Predicts whether a patient has heart disease from 13 routine clinical measurements, comparing Logistic Regression, Random Forest, SVM and KNN. The models aren't the interesting part of this project, though. The data is: it hides two problems, and each one makes the usual results on this dataset wrong.

## Catch 1: 70% of the dataset is duplicates

The popular 1,025-row version of the UCI heart dataset contains **only 302 unique patients**. Leave the duplicates in, and **202 of the 205 test rows also appear in the training set**, so a Random Forest scores a perfect **100% accuracy**. Is the model brilliant? No, it has simply seen the answer key. That's **data leakage**, and it's why so many notebooks online report near-perfect scores on this dataset.

In this notebook I remove the duplicates before splitting and demonstrate the leak explicitly, so you can see the inflated score next to the honest one.

## Catch 2: the label is flipped

The dataset description says *target* = 1 means heart disease. The data says otherwise. Compare the two groups with what cardiologists already know about sick patients:

| Clinical sign | *target* = 0 | *target* = 1 | Expected in sick patients |
|---|---|---|---|
| Mean age | 56.6 | 52.6 | older |
| Men | 83% | 56% | more men |
| Exercise-induced angina (*exang*) | 55% | 14% | more often |
| ST depression (*oldpeak*) | 1.59 | 0.59 | higher |
| Major vessels coloured by fluoroscopy (*ca*) | 1.17 | 0.34 | more |
| Max heart rate (*thalach*) | 139 | 158 | lower |

Every sign points to *target* = 0 as the sick group, and the counts agree: after removing duplicates there are 164 patients with *target* = 1, exactly the number of **healthy** patients in the original UCI Cleveland data (164 healthy, 139 sick). So I flip the label before modelling. Without the flip, every "recall on the disease class" is really the recall on healthy patients, the opposite of what a screening tool needs. My first version of this project reported exactly that number, which is why the check is now its own section in the notebook.

## Results (302 unique patients, label flipped, stratified 80/20 split)

With 61 test patients, one patient is worth 1.6 points of accuracy, so I don't pick the model from the test set. I pick it with repeated stratified 5-fold cross-validation on the 241 training patients (10 repeats, so 50 scores per model), then report the chosen model on the test set.

| Model (repeated CV, mean ± SD) | Accuracy | Recall | ROC-AUC |
|---|---|---|---|
| **Logistic Regression** | **0.831 ± 0.056** | 0.761 ± 0.086 | 0.904 ± 0.044 |
| Random Forest (tuned) | 0.828 ± 0.053 | 0.764 ± 0.085 | 0.909 ± 0.038 |
| Random Forest | 0.827 ± 0.053 | 0.759 ± 0.091 | 0.908 ± 0.042 |
| SVM | 0.822 ± 0.047 | 0.729 ± 0.100 | 0.895 ± 0.044 |
| K-Nearest Neighbors | 0.814 ± 0.051 | 0.719 ± 0.099 | 0.868 ± 0.055 |

On the test set, Logistic Regression reaches **accuracy 0.787 and ROC-AUC 0.890**, and on the disease class **recall 0.750**, precision 0.778 and F1 0.764. It catches 21 of the 28 sick patients.

- **When the models tie, I keep the one a clinician can read.** Every model sits within about one standard deviation of the others, so the gaps between them are noise. Logistic Regression has the highest mean accuracy, a recall in line with the best, and coefficients a doctor can check one by one. In healthcare, I think that matters more than a fraction of a point.
- **The test set shows why one split can't pick a winner.** On those 61 patients the SVM and the tuned Random Forest score 0.820 against Logistic Regression's 0.787. That's two patients. Had I picked the model from that table, a different random split could easily have picked another one.
- I prioritise **recall** on the disease class, because missing a sick patient is far more costly than a false alarm that leads to one extra check-up. Recall 0.75 still misses 7 of the 28 sick patients, so the next step is a lower threshold, chosen by cross-validation on the training data rather than on the test set.

| ROC curves (test set) | Feature importance |
|---|---|
| ![ROC](images/roc_curves.png) | ![Importance](images/feature_importance.png) |

The strongest predictors are the number of major vessels, chest pain type, ST depression, thalassemia result and max heart rate. That lines up with what cardiologists already look at, which is a good sign the model learned something real.

## Run it

```bash
pip install -r requirements.txt
jupyter notebook heart_disease_prediction.ipynb
```

*report.pdf* is the full write-up: abstract, methodology, results and discussion. It was written for the first version, before I found the flipped label, so its numbers differ from the notebook. The notebook and this README have the corrected ones.

## Data

The data is the [UCI Heart Disease dataset](https://archive.ics.uci.edu/dataset/45/heart+disease) (Cleveland), in the 1,025-row Kaggle version stored in *data/heart.csv*. The CSV is left as downloaded; the label flip happens in the notebook, so anyone can see and rerun the check.

## Tech stack

Python · pandas · scikit-learn · matplotlib · seaborn
