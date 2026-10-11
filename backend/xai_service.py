"""Live explainability using the deployment package's xai/*.py modules.

Imported lazily and only when the user asks for that method, so start-up and
/predict stay fast. Every explanation is computed from the uploaded image and
the REAL ensemble: nothing is pre-rendered or hard-coded.

All methods work on the 224x224 resized image, which is exactly the first step
of the package's own preprocessing (`Resize((224, 224))`), so the explained
prediction matches /predict.

Module contracts (from the deployment package):
  gradcam.generate_gradcam(model, model_name, image_path, class_index, device) -> {"cam", ...}
  gradcam.overlay_gradcam(image, cam)                                         -> uint8 RGB
  occlusion.generate_occlusion(predict_fn(PIL)->probs, image_path, target_class) -> {"occlusion_map", ...}
  lime_explainer.explain_lime(predict_fn(batch)->probs, image_path)           -> {"visualization", ...}
  shap_explainer.explain_shap(predict_fn(PIL)->probs, image_path)             -> {"shap_values", ...}
"""
from __future__ import annotations

import base64
import importlib
import io
from typing import Any, Callable, Dict, List, Optional, Tuple

import numpy as np
from PIL import Image

import config
from inference import InferenceError, as_file, service

SIZE = (224, 224)

TITLES = {
    "gradcam": "Grad-CAM Explanation",
    "lime": "LIME Explanation",
    "occlusion": "Occlusion Explanation",
    "shap": "SHAP Explanation",
}

Panels = List[Tuple[str, Image.Image]]


def available_methods() -> Tuple[str, ...]:
    return config.XAI_METHODS


def _png(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def _jet(map01: np.ndarray) -> Image.Image:
    import matplotlib

    rgb = (matplotlib.colormaps["jet"](np.clip(map01, 0, 1))[..., :3] * 255).astype(np.uint8)
    return Image.fromarray(rgb)


def _blend(base: Image.Image, heat: Image.Image, alpha: float = 0.45) -> Image.Image:
    return Image.blend(base.convert("RGB"), heat.convert("RGB"), alpha)


def _import(name: str):
    try:
        return importlib.import_module(name)
    except ImportError as exc:
        raise InferenceError(
            f"The explainer needs a missing package ({exc.name}). Install the deployment requirements (see README)."
        ) from exc


# ------------------------------------------------------------------ methods
def _gradcam(img: Image.Image, class_index: int) -> Panels:
    import torch

    gc = _import("xai.gradcam")
    pkg = service.module
    cam_sum = np.zeros(SIZE[::-1], dtype=np.float64)
    weight_sum = 0.0
    # Grad-CAM is defined per network, so the six CAMs are combined with the
    # ensemble's own frozen weights (target = the ensemble's predicted class).
    with torch.enable_grad():
        for name in pkg.MODEL_NAMES:
            out = gc.generate_gradcam(service.models[name], name, as_file(img), class_index=class_index)
            w = float(pkg.WEIGHTS[name])
            cam_sum += w * np.asarray(out["cam"], dtype=np.float64)
            weight_sum += w
    cam = cam_sum / weight_sum
    cam -= cam.min()
    if cam.max() > 0:
        cam /= cam.max()
    overlay = Image.fromarray(gc.overlay_gradcam(img, cam))
    return [("Original", img), ("Grad-CAM Heatmap", _jet(cam)), ("Grad-CAM Overlay", overlay)]


def _occlusion(img: Image.Image, class_index: int) -> Panels:
    oc = _import("xai.occlusion")
    res = oc.generate_occlusion(service.probabilities, as_file(img), target_class=class_index)
    m = np.asarray(res["occlusion_map"], dtype=np.float64)
    heat = _jet(m)
    return [("Original", img), ("Occlusion Map", heat), ("Occlusion Overlay", _blend(img, heat))]


def _lime(img: Image.Image, class_index: int) -> Panels:
    lm = _import("xai.lime_explainer")
    res = lm.explain_lime(service.probabilities_batch, as_file(img))
    vis = np.asarray(res["visualization"])
    vis = (vis * 255).astype(np.uint8) if vis.dtype != np.uint8 and vis.max() <= 1.0 else vis.astype(np.uint8)
    return [("Original", img), ("LIME Superpixels", Image.fromarray(vis))]


def _shap_batched(sh, img: Image.Image) -> Dict[str, Any]:
    """Same call as xai/shap_explainer.explain_shap (same settings, same predictor
    wrapper) but the image is passed as a batch of one. Newer SHAP versions require
    a batch dimension and otherwise raise `DimensionError`."""
    import shap

    arr = np.asarray(img.convert("RGB"), dtype=np.uint8)
    predict = sh.create_shap_predictor(service.probabilities)
    masker = shap.maskers.Image("blur(32,32)", arr.shape)
    explainer = shap.Explainer(predict, masker)
    values = explainer(arr[np.newaxis, ...], max_evals=100, batch_size=8)
    probs = predict([arr])[0]
    return {"shap_values": values, "predicted_class": int(np.argmax(probs)), "probabilities": probs}


def _shap(img: Image.Image, class_index: int) -> Panels:
    sh = _import("xai.shap_explainer")
    try:
        res = sh.explain_shap(service.probabilities, as_file(img))
    except Exception as exc:
        if type(exc).__name__ != "DimensionError":
            raise
        res = _shap_batched(sh, img)  # SHAP version expects a batch dimension

    values = np.asarray(res["shap_values"].values)  # (1, H, W, 3, n_classes) or (H, W, 3, n_classes)
    if values.ndim == 5:
        values = values[0]
    cls = int(res.get("predicted_class", class_index))
    attr = values[..., cls].sum(axis=-1)  # signed attribution per pixel
    limit = float(np.abs(attr).max()) or 1.0
    import matplotlib

    heat = Image.fromarray((matplotlib.colormaps["bwr"]((attr / limit + 1) / 2)[..., :3] * 255).astype(np.uint8))
    heat = heat.resize(img.size)
    return [("Original", img), ("SHAP Attribution (red = supports)", heat), ("SHAP Overlay", _blend(img, heat, 0.5))]


_METHODS: Dict[str, Callable[[Image.Image, int], Panels]] = {
    "gradcam": _gradcam,
    "lime": _lime,
    "occlusion": _occlusion,
    "shap": _shap,
}


# ---------------------------------------------------------------- public API
def explain(method: str, image: Image.Image, class_index: Optional[int] = None) -> Dict[str, Any]:
    if method not in _METHODS:
        raise InferenceError("Unknown explanation method.")
    if not service.ready:
        raise InferenceError("The model is not loaded. Please try again shortly.")

    img = image.convert("RGB").resize(SIZE, Image.BILINEAR)  # same as the package's Resize((224, 224))

    with service.lock:  # one heavy job at a time
        if class_index is None or not 0 <= class_index < len(service.classes):
            class_index = int(np.argmax(service.probabilities(img)))  # the REAL ensemble prediction
        panels = _METHODS[method](img, class_index)

    return {
        "method": method,
        "title": TITLES[method],
        "target_class": service.classes[class_index],
        "class_index": class_index,
        "panels": [{"label": label, "image": _png(p)} for label, p in panels],
    }
