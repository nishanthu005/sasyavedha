"""Reproducible scikit-learn models used by the agronomic recommendation endpoints.

The bundled reference data is a bootstrap baseline, not a replacement for local
farm records. Replace it with observed, labelled farm data before production use.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.ensemble import ExtraTreesRegressor, RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

CROPS = {"Rice": 4.0, "Wheat": 4.1, "Maize": 5.3, "Tomato": 23.0, "Cotton": 2.0, "Sugarcane": 75.0, "Soybean": 2.5}
FEATURES = ["crop", "temperature", "humidity", "rainfall", "et0", "wind_speed"]


def _training_rows(seed=42, rows_per_crop=180):
    rng = np.random.default_rng(seed)
    rows, yields, water = [], [], []
    for crop, base in CROPS.items():
        for _ in range(rows_per_crop):
            temp, humidity = rng.normal(27, 5), rng.uniform(35, 95)
            rainfall, et0, wind = max(0, rng.gamma(2.2, 7)), max(.4, rng.normal(4.0, 1.1)), max(.1, rng.normal(10, 4))
            rows.append([crop, temp, humidity, rainfall, et0, wind])
            heat_penalty = max(0, abs(temp - 26) - 5) * .035
            moisture_effect = min(.10, rainfall / 180) - heat_penalty
            yields.append(base * (1 + moisture_effect + rng.normal(0, .055)))
            # Daily net irrigation need (mm); used as the target for the irrigation model.
            water.append(max(0, et0 * (0.75 + rng.uniform(0, .35)) - rainfall * .55 + (60 - humidity) * .018 + rng.normal(0, .25)))
    return np.asarray(rows, dtype=object), np.asarray(yields), np.asarray(water)


def _pipeline(regressor):
    return Pipeline([("features", ColumnTransformer([("crop", OneHotEncoder(handle_unknown="ignore"), ["crop"]), ("numbers", "passthrough", FEATURES[1:])])), ("model", regressor)])


_rows, _yields, _water = _training_rows()
_frame = pd.DataFrame(_rows, columns=FEATURES)
YIELD_MODEL = _pipeline(RandomForestRegressor(n_estimators=240, min_samples_leaf=3, random_state=42, n_jobs=1)).fit(_frame, _yields)
IRRIGATION_MODEL = _pipeline(ExtraTreesRegressor(n_estimators=240, min_samples_leaf=3, random_state=43, n_jobs=1)).fit(_frame, _water)


def vector(crop: str, weather: dict):
    return pd.DataFrame([[crop, weather["temperature"], weather["humidity"], weather["forecast_rainfall"], weather["et0"], weather["wind_speed"]]], columns=FEATURES)


def yield_prediction(crop: str, weather: dict) -> float:
    return float(YIELD_MODEL.predict(vector(crop, weather))[0])


def irrigation_mm(crop: str, weather: dict) -> float:
    return max(0.0, float(IRRIGATION_MODEL.predict(vector(crop, weather))[0]))


def feature_importance() -> dict:
    names = ["Crop", "Temperature", "Humidity", "Forecast rainfall", "Evapotranspiration", "Wind speed"]
    values = YIELD_MODEL.named_steps["model"].feature_importances_
    return {name: round(float(value / values.sum() * 100), 1) for name, value in zip(names, values)}
