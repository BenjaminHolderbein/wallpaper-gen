import numpy as np
import torch
from PIL import Image
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer

from src.config.settings import MODEL_DIR
from src.config.presets import calculate_upscale_factor


UPSCALER_MODELS = {
    "RealESRGAN_x4plus": {
        "scale": 4,
        "num_block": 23,
        "url": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
        "description": "General-purpose 4x upscaler (best quality)",
    },
    "RealESRGAN_x2plus": {
        "scale": 2,
        "num_block": 23,
        "url": "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth",
        "description": "General-purpose 2x upscaler (faster)",
    },
}


def load_upscaler(
    model_name: str = "RealESRGAN_x4plus", tile: int = 0, half: bool = True
) -> RealESRGANer:
    """Load RealESRGAN upscaler.

    Args:
        model_name: Name of the upscaler model to load.
        tile: Tile size for processing large images. 0 = no tiling.
        half: Use fp16 for lower VRAM usage.
    """
    if model_name not in UPSCALER_MODELS:
        raise ValueError(f"Unknown upscaler model: {model_name}. Choose from {list(UPSCALER_MODELS)}")

    info = UPSCALER_MODELS[model_name]
    native_scale = info["scale"]

    model = RRDBNet(
        num_in_ch=3, num_out_ch=3, num_feat=64, num_block=info["num_block"],
        num_grow_ch=32, scale=native_scale,
    )
    model_url = info["url"]
    model_path = MODEL_DIR / f"{model_name}.pth"

    # Download weights if not present
    if not model_path.exists():
        from basicsr.utils.download_util import load_file_from_url
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        load_file_from_url(model_url, model_dir=str(MODEL_DIR), file_name=f"{model_name}.pth")

    upscaler = RealESRGANer(
        scale=native_scale,
        model_path=str(model_path),
        dni_weight=None,
        model=model,
        tile=tile,
        tile_pad=10,
        pre_pad=0,
        half=half,
        gpu_id=0,
    )

    return upscaler


def upscale_image(
    upscaler: RealESRGANer,
    image: Image.Image,
    target_width: int,
    target_height: int,
) -> Image.Image:
    """Upscale a PIL image to the target resolution using Real-ESRGAN.

    The image is upscaled by the model's native factor (4x), then resized
    to the exact target resolution.
    """
    # Convert PIL to BGR numpy (OpenCV format expected by RealESRGAN)
    img_rgb = np.array(image)
    img_bgr = img_rgb[:, :, ::-1]

    output_bgr, _ = upscaler.enhance(img_bgr, outscale=upscaler.scale)

    # Convert back to PIL RGB
    output_rgb = output_bgr[:, :, ::-1]
    result = Image.fromarray(output_rgb)

    # Resize to exact target resolution
    if result.size != (target_width, target_height):
        result = result.resize((target_width, target_height), Image.LANCZOS)

    return result


def unload_upscaler(upscaler: RealESRGANer) -> None:
    """Free GPU memory used by the upscaler."""
    del upscaler
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
