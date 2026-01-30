from pathlib import Path

# Project root directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# Output directory for generated wallpapers
OUTPUT_DIR = PROJECT_ROOT / "outputs"

# Model cache directory
MODEL_DIR = PROJECT_ROOT / "models"

# Default generation settings
DEFAULT_SETTINGS = {
    "model_id": "stabilityai/stable-diffusion-xl-base-1.0",
    "base_size": 1024,
    "num_inference_steps": 30,
    "guidance_scale": 7.5,
    "negative_prompt": "blurry, low quality, distorted, deformed, ugly, bad anatomy",
    "use_fp16": True,
    "enable_attention_slicing": True,
    "enable_upscaling": True,
    "upscale_model": "RealESRGAN_x4plus",
    "seed": -1,  # -1 means random
}


def ensure_directories() -> None:
    """Create required directories if they don't exist."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
