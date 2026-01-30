"""Image processing utilities for the wallpaper generator."""

import io
from pathlib import Path

from PIL import Image


def create_thumbnail(image: Image.Image, max_size: tuple[int, int] = (512, 512)) -> Image.Image:
    """Create a thumbnail copy of the image, preserving aspect ratio."""
    thumb = image.copy()
    thumb.thumbnail(max_size, Image.LANCZOS)
    return thumb



def get_image_info(path: Path) -> dict:
    """Return basic info about an image file without fully loading it."""
    with Image.open(path) as img:
        return {
            "width": img.size[0],
            "height": img.size[1],
            "format": img.format,
            "mode": img.mode,
            "file_size_kb": path.stat().st_size / 1024,
        }


def resize_image(image: Image.Image, width: int, height: int) -> Image.Image:
    """Resize an image to exact dimensions using Lanczos resampling."""
    return image.resize((width, height), Image.LANCZOS)


def convert_format(input_path: Path, output_path: Path, quality: int = 95) -> Path:
    """Convert an image file to a different format (determined by output_path extension)."""
    with Image.open(input_path) as img:
        if img.mode == "RGBA" and output_path.suffix.lower() in (".jpg", ".jpeg"):
            img = img.convert("RGB")
        img.save(str(output_path), quality=quality)
    return output_path


def image_to_bytes(image: Image.Image, fmt: str = "PNG", quality: int = 95) -> bytes:
    """Convert a PIL Image to bytes in the specified format."""
    buf = io.BytesIO()
    if image.mode == "RGBA" and fmt.upper() in ("JPEG", "JPG"):
        image = image.convert("RGB")
    image.save(buf, format=fmt, quality=quality)
    return buf.getvalue()
