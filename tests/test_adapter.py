"""Glue test with a stub predict.py and the REAL xai/occlusion.py from the user's package."""
import os, sys, types, shutil, pathlib
HERE = os.path.dirname(os.path.abspath(__file__))
os.environ["MODEL_ROOT"] = os.path.join(HERE, "stub_deployment")
sys.path.insert(0, os.path.join(HERE, "..", "backend"))
# occlusion.py imports `preprocessing` (needs torchvision); stub that import only.
sys.modules["preprocessing"] = types.ModuleType("preprocessing"); sys.modules["preprocessing"].inference_transform = None
real_xai = os.environ.get("REAL_PACKAGE")   # optional: path of the real deployment package
if real_xai:
    shutil.copytree(os.path.join(real_xai, "xai"), os.path.join(HERE, "stub_deployment", "xai"), dirs_exist_ok=True)
from PIL import Image
import numpy as np
import config, inference, xai_service
s = inference.service
s.load(); assert s.ready, s.error
img = Image.fromarray((np.random.RandomState(1).rand(120, 90, 3) * 255).astype("uint8"))
r1 = s.predict(img); r2 = s.predict(img)
import predict as stub
assert stub.LOADS["n"] == 1, "models must load once"
assert list(r1["probabilities"]) == config.EXPECTED_CLASSES
assert abs(sum(r1["probabilities"].values()) - 1) < 1e-6
assert len(r1["individual_predictions"]) == 6 and all(isinstance(v, str) for v in r1["individual_predictions"].values())
assert r1 == r2
print("predict OK:", r1["predicted_class"], round(r1["probability"], 3))
if real_xai:
    e = xai_service.explain("occlusion", img, r1["class_index"])
    assert [p["label"] for p in e["panels"]] == ["Original", "Occlusion Map", "Occlusion Overlay"]
    assert all(p["image"].startswith("data:image/png;base64,") for p in e["panels"])
    print("occlusion (real xai/occlusion.py) OK, target:", e["target_class"])
print("ADAPTER OK  model loads:", stub.LOADS["n"])
