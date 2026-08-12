from __future__ import annotations

import json
import sys
from pathlib import Path

from disease_model import CLASSES_PATH, MODEL_DIR, MODEL_PATH, _keras

# Arguments
root = Path(sys.argv[1]) if len(sys.argv) > 1 else None
epochs = int(sys.argv[2]) if len(sys.argv) > 2 else 12

if not root or not root.exists() or not root.is_dir():
    raise SystemExit(
        "Usage: python train_disease_model.py path/to/dataset [epochs]"
    )

# Find all class folders
folders = sorted(
    folder
    for folder in root.iterdir()
    if folder.is_dir()
)

if len(folders) < 2:
    raise SystemExit(
        "Dataset must contain at least two class folders."
    )

print(f"Dataset: {root}")
print(f"Found {len(folders)} classes:")

for folder in folders:
    print(f"  - {folder.name}")

# Initialize TensorFlow
tf = _keras()
tf.keras.utils.set_random_seed(42)

# Load training dataset
train = tf.keras.utils.image_dataset_from_directory(
    root,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=(224, 224),
    batch_size=32,
    label_mode="int",
)

# Load validation dataset
validation = tf.keras.utils.image_dataset_from_directory(
    root,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=(224, 224),
    batch_size=32,
    label_mode="int",
)

# Get class names
classes = train.class_names

print()
print(f"Number of classes: {len(classes)}")
print("Classes:")

for index, class_name in enumerate(classes):
    print(f"  {index}: {class_name}")

# Verify class names
expected_classes = sorted(folder.name for folder in folders)

if classes != expected_classes:
    raise SystemExit(
        "Class names returned by TensorFlow do not match the dataset folders."
    )

# Data augmentation
augment = tf.keras.Sequential(
    [
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.08),
        tf.keras.layers.RandomZoom(0.12),
    ],
    name="data_augmentation",
)

# Load MobileNetV2
base = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet",
)

base.trainable = False

# Build model
inputs = tf.keras.Input(
    shape=(224, 224, 3),
    name="image",
)

x = augment(inputs)
x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
x = base(x, training=False)
x = tf.keras.layers.GlobalAveragePooling2D()(x)
x = tf.keras.layers.Dropout(0.25)(x)

outputs = tf.keras.layers.Dense(
    len(classes),
    activation="softmax",
    name="disease_prediction",
)(x)

model = tf.keras.Model(
    inputs,
    outputs,
    name="plant_disease_mobilenetv2",
)

# Compile model
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

# Early stopping
callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=3,
        restore_best_weights=True,
    )
]

# Initial training
print()
print("=" * 70)
print("Starting transfer-learning training")
print("=" * 70)

model.fit(
    train.prefetch(tf.data.AUTOTUNE),
    validation_data=validation.prefetch(tf.data.AUTOTUNE),
    epochs=epochs,
    callbacks=callbacks,
)

# Fine-tune final MobileNetV2 layers
print()
print("=" * 70)
print("Starting MobileNetV2 fine-tuning")
print("=" * 70)

base.trainable = True

for layer in base.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model.fit(
    train.prefetch(tf.data.AUTOTUNE),
    validation_data=validation.prefetch(tf.data.AUTOTUNE),
    epochs=5,
    callbacks=callbacks,
)

# Save model and class names
MODEL_DIR.mkdir(exist_ok=True)

model.save(MODEL_PATH)

CLASSES_PATH.write_text(
    json.dumps(
        classes,
        ensure_ascii=False,
        indent=2,
    ),
    encoding="utf-8",
)

print()
print("=" * 70)
print("Training complete!")
print("=" * 70)
print(f"Saved MobileNetV2 CNN to: {MODEL_PATH}")
print(f"Saved {len(classes)} class names to: {CLASSES_PATH}")