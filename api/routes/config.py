from fastapi import APIRouter, Query

from src.config.presets import DEVICE_PRESETS, calculate_base_resolution, validate_resolution
from src.config.settings import DEFAULT_SETTINGS
from src.generator.upscaler import UPSCALER_MODELS
from api.schemas import ValidationResponse

router = APIRouter()


@router.get("/presets")
def get_presets():
    presets = {}
    for category, devices in DEVICE_PRESETS.items():
        presets[category] = [
            {"name": d.name, "width": d.width, "height": d.height}
            for d in devices
        ]
    return {
        "presets": presets,
        "upscaler_models": {
            name: {"scale": m["scale"], "description": m["description"]}
            for name, m in UPSCALER_MODELS.items()
        },
        "default_settings": {
            k: v for k, v in DEFAULT_SETTINGS.items()
            if k not in ("model_id", "use_fp16", "enable_attention_slicing", "base_size")
        },
    }


@router.get("/validate")
def validate(w: int = Query(...), h: int = Query(...)) -> ValidationResponse:
    valid, err = validate_resolution(w, h)
    return ValidationResponse(valid=valid, error=err)


@router.get("/base-resolution")
def base_resolution(w: int = Query(...), h: int = Query(...)):
    base_w, base_h = calculate_base_resolution(w, h)
    return {"base_width": base_w, "base_height": base_h}
