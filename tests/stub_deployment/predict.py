"""PLUMBING-TEST STUB (NOT a model). Mimics ONLY the public API of the real
predict.py (load_ensemble / predict_image / CLASS_NAMES / ...) so the backend
glue can be tested without PyTorch. Never ship or demo this."""
import numpy as np
from PIL import Image
CLASS_NAMES = ["Tea algal leaf spot","Brown Blight","Gray Blight","Helopeltis","Red spider","Green mirid bug","Healthy leaf"]
MODEL_NAMES = ["DenseNet121","EfficientNet-B0","ResNet50","TeaDGCNet-DenseNet121","TeaDGCNet-EfficientNetB0","TeaDGCNet-ResNet50"]
WEIGHTS = dict(zip(MODEL_NAMES, [0.1363,0.3361,0.0502,0.1429,0.1088,0.2257]))
DEVICE = "cpu"
LOADS = {"n": 0}
def load_ensemble():
    LOADS["n"] += 1
    return {n: object() for n in MODEL_NAMES}
def predict_image(image_path, models_dict=None):
    arr = np.asarray(Image.open(image_path).convert("RGB"), dtype=float)
    logits = np.array([arr[..., i % 3].mean() * (i + 1) % 7 for i in range(7)])
    p = np.exp(logits - logits.max()); p /= p.sum()
    k = int(p.argmax())
    return {"predicted_class": CLASS_NAMES[k], "class_index": k, "probability": float(p[k]),
            "probabilities": {c: float(v) for c, v in zip(CLASS_NAMES, p)},
            "individual_predictions": {n: {"class_index": k, "class_name": CLASS_NAMES[k], "probabilities": p.tolist()} for n in MODEL_NAMES}}
