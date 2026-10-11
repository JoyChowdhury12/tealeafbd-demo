"""Pydantic response models for the public API."""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel


class PredictionResponse(BaseModel):
    predicted_class: str
    class_index: int
    probability: float
    # Keyed by class name, in the ORIGINAL class order (classes.json).
    probabilities: Dict[str, float]
    individual_predictions: Dict[str, str]


class XaiPanel(BaseModel):
    label: str
    image: str  # data:image/png;base64,...


class ExplanationResponse(BaseModel):
    method: str
    title: str
    target_class: str
    class_index: int
    panels: List[XaiPanel]
    note: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    device: Optional[str] = None
    classes: List[str] = []
    detail: Optional[str] = None
