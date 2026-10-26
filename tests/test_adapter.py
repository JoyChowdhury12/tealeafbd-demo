"""Glue test: the adapter against a stub predict.py (no PyTorch needed)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
os.environ["MODEL_ROOT"] = os.path.join(HERE, "stub_deployment")
sys.path.insert(0, os.path.join(HERE, "..", "backend"))
from PIL import Image
import numpy as np
import config, inference
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
print("ADAPTER OK  model loads:", stub.LOADS["n"])
