"""Generate REAL Grad-CAM hero images from the example (train/val) images.

Run AFTER scripts/make_examples.py, with the backend virtual-env active:
    python scripts/make_hero_gradcam.py

For every example image it runs the real six-model ensemble (predict.py) and the
real xai/gradcam.py, then writes frontend/public/examples/hero_*.jpg and hero.json.
The hero shows these static pictures; the chip states they are Grad-CAM outputs
of a dataset (train/val) image and which class the ensemble predicted.
"""
import json, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

import inference, xai_service            # noqa: E402  (loads backend/.env via config)
from inference import service            # noqa: E402

EX = ROOT / "frontend" / "public" / "examples"
items = json.loads((EX / "examples.json").read_text(encoding="utf-8"))

print("Loading the six models (this takes a minute)...")
service.load()
if not service.ready:
    sys.exit(f"Model failed to load: {service.error}")

out = []
for it in items:
    thumb = Image.open(EX / it["file"]).convert("RGB")
    pred = service.predict(thumb)
    small = thumb.resize((224, 224), Image.BILINEAR)
    with service.lock:
        panels = dict(xai_service._gradcam(small, pred["class_index"]))
    heat = panels["Grad-CAM Heatmap"].resize(thumb.size, Image.BICUBIC)   # real CAM, upscaled
    overlay = Image.blend(thumb, heat, 0.45)
    name = "hero_" + it["file"]
    overlay.save(EX / name, quality=90)
    out.append({"file": name, "label": it["label"], "predicted": pred["predicted_class"]})
    print(f"{it['file']}: dataset class = {it['label']} | ensemble predicted = {pred['predicted_class']}")

(EX / "hero.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
print(f"wrote {len(out)} Grad-CAM hero images")
