# TeaLeafBD: Tea Leaf Disease Classification Using a 6-Model Weighted Ensemble

A research demo website (React + Vite + Tailwind) with a FastAPI backend that runs the **existing, frozen**
TeaLeafBD deployment package (`predict.py` and six `.pth` models). Nothing is retrained or re-implemented.

```bash
git clone https://github.com/JoyChowdhury12/tealeafbd-demo.git
```

## 1. Overview
- Dataset: TeaLeafBD v4, 7 classes
- Model: 6-model weighted soft-voting ensemble (DenseNet121, EfficientNet-B0, ResNet50, TeaDGCNet-DenseNet121, TeaDGCNet-EfficientNetB0, TeaDGCNet-ResNet50)
- Live demo: upload a leaf image and get the ensemble's class, its probability, all class probabilities and the per-model votes.
- The explanation methods used in the study (Grad-CAM, LIME, occlusion, SHAP) are not part of this web demo. They are in the paper and in the code package on Zenodo (section 13).

## 2. Architecture
```
Browser (React)  --/api/predict-->  FastAPI (main.py)
                                      |  inference.py (adapter, models loaded ONCE at start-up)
                                      v
                       <MODEL_ROOT>/predict.py  -> preprocessing -> 6 models -> weighted soft voting
```
Uploads are decoded in memory. No local paths or checkpoint paths are returned by the API.

## 3. Folder structure
```
TeaLeafBD_Web/
├── backend/   main.py  config.py  schemas.py  inference.py  requirements.txt  .env.example
├── frontend/  src/{App.jsx, api.js, config/site.js, components/*}  public/examples/  package.json ...
├── scripts/   make_examples.py      # builds the "Try an Example" gallery (train/val images only)
├── tests/     test_adapter.py + stub_deployment/   # plumbing test only; the stub is NOT a model
└── README.md
```

## 4. Install the backend
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate        # Windows (Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt
pip install torch torchvision                    # or: pip install -r "<MODEL_ROOT>/requirements.txt"
copy .env.example .env      # then edit MODEL_ROOT
```

## 5. Configure the model path
Set `MODEL_ROOT` in `backend/.env` (or as an environment variable) to the folder that contains
`predict.py`, `models/`, `ensemble/` and `classes.json`:
```
MODEL_ROOT=C:\path\to\TeaLeafBD_Deployment
```
The code package and the six `.pth` files are available from Zenodo (section 13). Unzip the code package, create a folder
named `models` next to `predict.py`, and put the six `.pth` files in it without renaming them. The `.pth` files are
referenced in place, never copied. The fallback in `config.py` (Desktop/tea leaf results/tea_leaf_centralized_research/TeaLeafBD_Deployment)
is for local development only; set MODEL_ROOT for any other location.

The backend uses the package's real API: `predict.load_ensemble()` (called once at start-up),
`predict.predict_image(image, models_dict)` and `CLASS_NAMES`. Open `http://127.0.0.1:8000/health` after start-up:
`models_loaded: true` means all six models loaded.

## 6. Start FastAPI
```bash
cd backend
uvicorn main:app --reload --port 8000
```
(Models load once at start-up. With `--reload` they reload when code changes; for a stable demo drop `--reload`.)
Endpoints: `GET /health` and `POST /predict` (multipart field `file`).

## 7. Start React
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173  (proxies /api -> http://127.0.0.1:8000)
```
Different backend address: set `VITE_BACKEND_URL` (dev proxy) or `VITE_API_URL` (build).

## 8. Example gallery
```bash
python scripts/make_examples.py --manifest "<train_manifest.csv>" "<val_manifest.csv>" --per-class 1
```
Rows whose `split` is `test` are ignored. Thumbnails go to `frontend/public/examples/`. Clicking an example only loads the image; the prediction is computed by the backend when you press Submit.

## 9. How prediction works
Upload → FastAPI validates (JPG/JPEG/PNG/WEBP, ≤ `MAX_UPLOAD_MB`, default 10 MB) → `predict.py` preprocessing → six frozen models → weighted soft voting → class probabilities. The UI sorts the bars high→low for display while the API keeps the original class order.

## 10. Classes (index order)
0 Tea algal leaf spot · 1 Brown Blight · 2 Gray Blight · 3 Helopeltis · 4 Red spider · 5 Green mirid bug · 6 Healthy leaf

## 11. Research metrics (fixed, from the finished study)
Validation Macro-F1 96.02% · Test Accuracy 94.71% · Macro Precision 94.11% · Macro Recall 93.61% · Macro F1 93.82% · Balanced Accuracy 93.61%.
Ensemble weights: DenseNet121 0.1363, EfficientNet-B0 0.3361, ResNet50 0.0502, TeaDGCNet-DenseNet121 0.1429, TeaDGCNet-EfficientNetB0 0.1088, TeaDGCNet-ResNet50 0.2257.
Live demo probabilities are never taken from these numbers; they always come from the backend.

## 12. Deployment
- Backend: `uvicorn main:app --host 0.0.0.0 --port 8000` behind a reverse proxy (HTTPS); set `MODEL_ROOT` and `CORS_ORIGINS=https://your-site`. GPU is used automatically if CUDA is available.
- Frontend: `npm run build` → serve `frontend/dist/` with any static host; set `VITE_API_URL=https://api.your-site` at build time (or route `/api` to the backend).
- Edit authors, GitHub and paper links in `frontend/src/config/site.js`.

## 13. Trained models, code and data split
The six trained checkpoints, the inference code (including the explanation modules used in the study) and the train/validation/test
split manifest are archived on Zenodo: https://doi.org/10.5281/zenodo.23303246

The images are not included. They come from the teaLeafBD dataset: https://doi.org/10.17632/744vznw5k2.4

## 14. Relation to the paper and limitations
This demo accompanies the manuscript on the six-model ensemble. One difference from the paper's analysis:
- **Probabilities are not calibrated.** The demo shows the raw weighted soft-voting probabilities. The paper's temperature scaling (T = 0.596) and its validation-chosen review thresholds are not applied here.

The models were trained and tested on photographs of single detached leaves on a white background. Results on leaves in the field, or under other lighting, were not tested. This is a research demonstration, not a diagnostic tool, and uncertain cases should be checked by an expert.

## Plumbing test (no PyTorch needed)
`python tests/test_adapter.py` checks the adapter against a tiny stub of `predict.py` (models load once, class order, probabilities sum to 1). The stub is not a model and is only for testing.

## License
MIT. See `LICENSE`.
