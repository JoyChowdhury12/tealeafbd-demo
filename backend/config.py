"""Backend configuration.

All filesystem locations live here (never in the React code) and are
overridable through environment variables or a `.env` file.
"""
from __future__ import annotations

import os
from pathlib import Path

# Local-development fallback ONLY. Set MODEL_ROOT in the environment (or in
# backend/.env) to the folder that contains predict.py, models/, ensemble/
# and classes.json.
_LOCAL_DEV_FALLBACK = str(Path.home() / "Desktop" / "tea leaf results" / "tea_leaf_centralized_research" / "TeaLeafBD_Deployment")


def _load_dotenv() -> None:
    env_file = Path(__file__).with_name(".env")
    if not env_file.is_file():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()

MODEL_ROOT = Path(os.environ.get("MODEL_ROOT", _LOCAL_DEV_FALLBACK))

# Browser origins allowed to call the API (comma separated).
CORS_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if o.strip()
]

MAX_UPLOAD_MB = float(os.environ.get("MAX_UPLOAD_MB", "10"))
MAX_UPLOAD_BYTES = int(MAX_UPLOAD_MB * 1024 * 1024)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Fallback class order (must match classes.json in the deployment package).
EXPECTED_CLASSES = [
    "Tea algal leaf spot",
    "Brown Blight",
    "Gray Blight",
    "Helopeltis",
    "Red spider",
    "Green mirid bug",
    "Healthy leaf",
]

# Display names of the six ensemble members (used to label per-model output).
MODEL_NAMES = [
    "DenseNet121",
    "EfficientNet-B0",
    "ResNet50",
    "TeaDGCNet-DenseNet121",
    "TeaDGCNet-EfficientNetB0",
    "TeaDGCNet-ResNet50",
]
