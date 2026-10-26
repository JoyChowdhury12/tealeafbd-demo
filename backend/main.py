"""TeaLeafBD API.

    uvicorn main:app --reload --port 8000

Models are loaded exactly once, in the lifespan start-up hook, and kept in
memory for the lifetime of the process.
"""
from __future__ import annotations

import io
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from PIL import Image, UnidentifiedImageError

import config
from inference import InferenceError, ModelNotReady, service
from schemas import HealthResponse, PredictionResponse

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("tealeafbd.api")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Load the six frozen models ONCE. A failure does not crash the API:
    # /health and /predict report it in a friendly way instead.
    await run_in_threadpool(service.load)
    yield


app = FastAPI(title="TeaLeafBD API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


async def _read_image(file: Optional[UploadFile]) -> Image.Image:
    """Validate the upload and decode it in memory (nothing is written to disk)."""
    if file is None or not file.filename:
        raise HTTPException(400, "No image uploaded. Please choose a leaf image.")
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in config.ALLOWED_EXTENSIONS or (file.content_type or "") not in config.ALLOWED_CONTENT_TYPES:
        raise HTTPException(415, "Unsupported file type. Please upload a JPG, JPEG, PNG or WEBP image.")
    data = await file.read(config.MAX_UPLOAD_BYTES + 1)
    if len(data) > config.MAX_UPLOAD_BYTES:
        raise HTTPException(413, f"Image is too large. The limit is {config.MAX_UPLOAD_MB:g} MB.")
    if not data:
        raise HTTPException(400, "The uploaded file is empty.")
    try:
        with Image.open(io.BytesIO(data)) as probe:
            probe.verify()
        img = Image.open(io.BytesIO(data))
        img.load()
        return img.convert("RGB")
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError):
        raise HTTPException(400, "This image could not be read. The file may be corrupted.")


def _friendly(exc: Exception) -> HTTPException:
    """Map internal failures to short messages that never leak paths."""
    if isinstance(exc, ModelNotReady):
        return HTTPException(503, "The model is not available right now. Please try again shortly.")
    if isinstance(exc, InferenceError):
        return HTTPException(500, str(exc))
    text = str(exc).lower()
    if "out of memory" in text:
        return HTTPException(507, "The server ran out of GPU memory. Please try again in a moment.")
    log.exception("Unexpected failure")
    return HTTPException(500, "Prediction failed. Please try another image.")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if service.ready else "unavailable",
        models_loaded=service.ready,
        device=service.device,
        classes=service.classes,
        detail=None if service.ready else "Model failed to load. See server logs.",
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(None)) -> PredictionResponse:
    image = await _read_image(file)
    try:
        result = await run_in_threadpool(service.predict, image)
    except HTTPException:
        raise
    except Exception as exc:
        raise _friendly(exc)
    return PredictionResponse(**result)
