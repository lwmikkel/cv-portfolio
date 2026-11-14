# League of Legends win probability

Can the outcome of a professional League of Legends match be predicted from the draft, and does a team-strength rating improve the prediction? Three logistic regression models were built and compared.

Built by Mikkel Leth Wilquin and Nicolai Leth Wilquin as a machine learning project, March 2026.

## Data

Professional matches from 2026 (LCK, LEC, MSI and other leagues, mostly patch 16.01) from [Oracle's Elixir](https://oracleselixir.com/). The CSV is not included in this repository. Download the 2026 match data and save it as `Data/2026_lolmatches.csv`.

## Notebooks

Run them in this order, from this folder:

| Notebook | What it does |
| --- | --- |
| `Draft_model.ipynb` | One-hot encodes the five picks per side and trains a logistic regression on the draft alone. Saves `Data/draft_encoded.csv` |
| `Elo_rating.ipynb` | Computes a running Elo rating per team (start 1500, K = 20) and trains a logistic regression on the rating difference. Saves `Data/elo_features.csv` |
| `Samlet_model.ipynb` | Joins the draft and Elo features, adds an Elo-times-side feature, standardises everything and trains a combined model |

```
pip install -r requirements.txt
jupyter notebook
```

## Results

| Model | Accuracy | AUC | Log loss |
| --- | --- | --- | --- |
| Draft only | 0.510 | 0.494 | 0.877 |
| Elo rating | 0.595 | 0.639 | 0.662 |
| Draft + Elo | 0.523 | 0.527 | 1.197 |

Team strength predicts the result better than the draft. The draft model is close to a coin flip (AUC 0.49), and adding the draft features to the Elo model made it worse. A likely reason is that the one-hot encoded champions give thousands of features for about two thousand matches from a single season, so they add noise.

The evaluation setups differ a little, so the numbers are not perfectly comparable: the draft model uses a random 80/20 split, the combined model a chronological 80/20 split, and the Elo model is evaluated on the same matches it was fitted on. That matters little with a single feature, but a time-based hold-out for all three would be the natural next step.

## Interactive version

The fitted Elo model is used in the win-probability demo in the Projects section of the portfolio site: https://lwmportfolioweb19.z1.web.core.windows.net
