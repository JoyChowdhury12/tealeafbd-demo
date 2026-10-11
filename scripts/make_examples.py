"""Build the 'Try an Example' gallery from TRAIN / VALIDATION images only.

Usage:
    python scripts/make_examples.py --manifest <train_manifest.csv> <validation_manifest.csv> --per-class 1

Manifest columns: path, class, group_id, split, label. Rows whose split looks like
'test' are ALWAYS skipped. Classes are matched by the numeric `label` (0-6) when it
is valid, otherwise by the class name (case/number-prefix insensitive).
Thumbnails go to frontend/public/examples; no predictions are stored.
"""
import argparse, csv, json, random, re, sys
from collections import Counter
from pathlib import Path
from PIL import Image

CLASSES = ["Tea algal leaf spot", "Brown Blight", "Gray Blight", "Helopeltis",
           "Red spider", "Green mirid bug", "Healthy leaf"]

def norm(s):
    s = re.sub(r"^\s*\d+\s*[.)_-]\s*", "", str(s or ""))      # drop "1. " prefix
    return re.sub(r"[^a-z]", "", s.lower())

NORM = {norm(c): i for i, c in enumerate(CLASSES)}

def class_index(row):
    try:
        k = int(float(str(row.get("label", "")).strip()))
        if 0 <= k < len(CLASSES):
            return k
    except ValueError:
        pass
    n = norm(row.get("class", ""))
    if n in NORM:
        return NORM[n]
    for key, i in NORM.items():
        if key and (key in n or n in key) and n:
            return i
    return None

def split_ok(split):
    s = str(split or "").strip().lower()
    if "test" in s:
        return False
    return "train" in s or s.startswith("val") or s == "valid"

ap = argparse.ArgumentParser()
ap.add_argument("--manifest", required=True, nargs="+")
ap.add_argument("--per-class", type=int, default=1)
ap.add_argument("--seed", type=int, default=7)
ap.add_argument("--size", type=int, default=640)
ap.add_argument("--require-agreement", action="store_true",
                help="run the real ensemble and keep only images where ALL six models predict the dataset class")
ap.add_argument("--max-tries", type=int, default=40, help="candidates to test per class with --require-agreement")
ap.add_argument("--dataset-root", help="search here by file name if a manifest path no longer exists")
args = ap.parse_args()

out = Path(__file__).resolve().parents[1] / "frontend" / "public" / "examples"
out.mkdir(parents=True, exist_ok=True)
for old in list(out.glob("*.jpg")) + [out / "hero.json"]:
    if old.exists():
        old.unlink()

index = {}
if args.dataset_root:
    for f in Path(args.dataset_root).rglob("*"):
        if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            index.setdefault(f.name.lower(), f)

def resolve(p):
    q = Path(p)
    if q.is_file():
        return q
    return index.get(Path(str(p).replace("\\", "/")).name.lower())

by_class = {i: [] for i in range(len(CLASSES))}
seen_splits, seen_classes, total, skipped_test = Counter(), Counter(), 0, 0
for m in args.manifest:
    with open(m, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            total += 1
            seen_splits[row.get("split")] += 1
            seen_classes[row.get("class")] += 1
            if not split_ok(row.get("split")):
                skipped_test += 1
                continue
            k = class_index(row)
            if k is not None:
                by_class[k].append(row["path"])

print(f"rows read: {total}; skipped (test or unknown split): {skipped_test}")
print("split values found:", dict(seen_splits))
print("class values found:", dict(list(seen_classes.items())[:10]))

service = None
if args.require_agreement:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
    from inference import service            # uses MODEL_ROOT from backend/.env
    print("Loading the six models (this takes a minute)...")
    service.load()
    if not service.ready:
        sys.exit(f"Model failed to load: {service.error}")

def all_models_agree(src, cls):
    pred = service.predict(Image.open(src).convert("RGB"))
    votes = set(pred["individual_predictions"].values())
    return pred["predicted_class"] == cls and votes == {cls}

rng = random.Random(args.seed)
items = []
for idx, cls in enumerate(CLASSES):
    paths = by_class[idx]
    rng.shuffle(paths)
    k, missing, tried = 0, 0, 0
    for p in paths:
        if k >= args.per_class:
            break
        src = resolve(p)
        if src is None:
            missing += 1
            continue
        if args.require_agreement:
            if tried >= args.max_tries:
                break
            tried += 1
            if not all_models_agree(src, cls):
                continue
        name = f"{idx}_{k}.jpg"
        k += 1
        im = Image.open(src).convert("RGB")
        im.thumbnail((args.size, args.size))
        im.save(out / name, quality=88)
        items.append({"file": name, "label": cls})   # dataset class, not a model output
    if k == 0:
        print(f"warning: no usable image for '{cls}' (candidates: {len(paths)}, files not found: {missing}, tested: {tried}). Try --dataset-root or a larger --max-tries.")
    elif args.require_agreement:
        print(f"{cls}: found after testing {tried} image(s)")

(out / "examples.json").write_text(json.dumps(items, indent=2), encoding="utf-8")
print(f"wrote {len(items)} examples to {out}")
