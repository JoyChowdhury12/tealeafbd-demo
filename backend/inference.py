"""Adapter around the EXISTING TeaLeafBD deployment package (predict.py).

Nothing here re-implements preprocessing, model definitions or soft voting.
It only

  1. imports `predict.py` from MODEL_ROOT,
  2. calls the package's own `load_ensemble()` ONCE at start-up and keeps the
     six models in memory,
  3. calls the package's own `predict_image(image, models_dict)` per request
     (the uploaded image is handed over as an in-memory file object, so no
     temporary files are written), and
  4. reshapes the result into the public API format.
"""
from __future__ import annotations

import importlib
import io
import logging
import sys
import threading
from typing import Any, Dict, List, Optional

import numpy as np
from PIL import Image

import config

log = logging.getLogger("tealeafbd.inference")


class InferenceError(RuntimeError):
    """A failure whose message is safe to show to the user."""


class ModelNotReady(InferenceError):
    pass


def as_file(image: Image.Image) -> io.BytesIO:
    """Lossless in-memory file for `Image.open(...)` inside predict.py / xai modules."""
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="PNG", compress_level=1)
    buf.seek(0)
    return buf


class EnsembleService:
    def __init__(self) -> None:
        self.ready = False
        self.error: Optional[str] = None
        self.device: Optional[str] = None
        self.classes: List[str] = list(config.EXPECTED_CLASSES)
        self.module: Any = None      # imported predict.py
        self.models: Dict[str, Any] = {}  # the six loaded models (kept in memory)
        self.lock = threading.Lock()  # one heavy job at a time (CPU/GPU safety)

    # ------------------------------------------------------------------ load
    def load(self) -> None:
        """Import the deployment package and load all six models once."""
        try:
            root = config.MODEL_ROOT
            if not (root / "predict.py").is_file():
                raise InferenceError("predict.py was not found. Check MODEL_ROOT.")
            if str(root) not in sys.path:
                sys.path.insert(0, str(root))

            self.module = importlib.import_module("predict")
            self.classes = list(self.module.CLASS_NAMES)
            if self.classes != config.EXPECTED_CLASSES:
                log.warning("classes.json order differs from the expected order: %s", self.classes)

            self.models = self.module.load_ensemble()  # six models, loaded ONCE
            self.device = str(self.module.DEVICE)
            self.ready = True
            self.error = None
            log.info("Ensemble ready on %s (%d models)", self.device, len(self.models))
        except Exception as exc:  # keep the API alive so /health can report it
            self.ready = False
            self.error = str(exc)
            log.exception("Model loading failed")

    # --------------------------------------------------------------- predict
    def _run(self, image: Image.Image) -> Dict[str, Any]:
        """Call the package's own predict_image (it applies torch.no_grad itself)."""
        if not self.ready:
            raise ModelNotReady("The model is not loaded. Please try again shortly.")
        return self.module.predict_image(as_file(image), self.models)

    def predict(self, image: Image.Image) -> Dict[str, Any]:
        with self.lock:
            raw = self._run(image)
        indiv = {
            name: (v["class_name"] if isinstance(v, dict) else str(v))
            for name, v in raw["individual_predictions"].items()
        }
        probs = {c: float(raw["probabilities"][c]) for c in self.classes}  # original class order
        return {
            "predicted_class": raw["predicted_class"],
            "class_index": int(raw["class_index"]),
            "probability": float(raw["probability"]),
            "probabilities": probs,
            "individual_predictions": indiv,
        }

    def probabilities(self, image: Image.Image) -> np.ndarray:
        """Ensemble probability vector (class order) for one PIL image.

        Used by the LIME / Occlusion / SHAP modules as their `predict_function`.
        Callers hold `self.lock`.
        """
        raw = self._run(image)
        return np.array([raw["probabilities"][c] for c in self.classes], dtype=np.float64)

    def probabilities_batch(self, arrays) -> np.ndarray:
        """Same, for a batch of HxWx3 arrays (LIME's `classifier_fn` format)."""
        out = []
        for arr in arrays:
            arr = np.clip(np.asarray(arr), 0, 255).astype(np.uint8)
            out.append(self.probabilities(Image.fromarray(arr).convert("RGB")))
        return np.asarray(out)


service = EnsembleService()
