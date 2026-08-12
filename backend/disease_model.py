"""TensorFlow/Keras CNN inference for leaf disease photographs."""
from __future__ import annotations

import base64
import io
import json
from pathlib import Path

import numpy as np
from PIL import Image

MODEL_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODEL_DIR / "leaf_disease_mobilenetv2.keras"
CLASSES_PATH = MODEL_DIR / "leaf_disease_classes.json"


def _keras():
    try:
        import tensorflow as tf
        return tf
    except ImportError as exc:
        raise RuntimeError("TensorFlow is required for CNN disease prediction. Install backend requirements first.") from exc


def predict(image_b64: str, crop: str):
    """Predict one of the Crop__Disease classes with a trained MobileNetV2 CNN."""
    if not MODEL_PATH.exists() or not CLASSES_PATH.exists():
        raise FileNotFoundError("CNN disease model is not installed. Train it with PlantVillage images using train_disease_model.py.")
    tf = _keras()
    image = Image.open(io.BytesIO(base64.b64decode(image_b64))).convert("RGB").resize((224, 224))
    tensor = np.asarray(image, dtype=np.float32)[None, ...]
    model = tf.keras.models.load_model(MODEL_PATH)
    labels = json.loads(CLASSES_PATH.read_text(encoding="utf-8"))
    probabilities = model.predict(tensor, verbose=0)[0]
    permitted = [index for index, label in enumerate(labels) if label.split("__", 1)[0] == crop]
    if not permitted:
        raise ValueError(f"The CNN has no trained classes for {crop}.")
    best = max(permitted, key=lambda index: probabilities[index])
    confidence = probabilities[best] / probabilities[permitted].sum() * 100
    return labels[best].split("__", 1)[1], round(float(confidence), 1)
