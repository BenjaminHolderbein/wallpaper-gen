import io
import json
import zipfile
from datetime import datetime
from pathlib import Path

from src.config.settings import OUTPUT_DIR, ensure_directories


def get_output_path(prompt: str, width: int, height: int, ext: str = "png") -> Path:
    """Generate a unique output file path based on prompt and resolution."""
    ensure_directories()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Sanitize prompt for filename
    safe_prompt = "".join(c if c.isalnum() or c in " -_" else "" for c in prompt)
    safe_prompt = safe_prompt.strip().replace(" ", "_")[:50]
    filename = f"{timestamp}_{safe_prompt}_{width}x{height}.{ext}"
    return OUTPUT_DIR / filename


def list_outputs(ext: str = "png") -> list[Path]:
    """List all generated wallpapers in the output directory."""
    ensure_directories()
    return sorted(OUTPUT_DIR.glob(f"*.{ext}"), key=lambda p: p.stat().st_mtime, reverse=True)


def _metadata_path(image_path: Path) -> Path:
    """Return the JSON sidecar path for an image."""
    return image_path.with_suffix(".json")


def save_metadata(image_path: Path, metadata: dict) -> None:
    """Save generation metadata as a JSON sidecar file alongside the image."""
    meta = {**metadata, "timestamp": datetime.now().isoformat()}
    _metadata_path(image_path).write_text(json.dumps(meta, indent=2), encoding="utf-8")


def load_metadata(image_path: Path) -> dict | None:
    """Load metadata for a generated image. Returns None if no sidecar exists."""
    mp = _metadata_path(image_path)
    if mp.exists():
        return json.loads(mp.read_text(encoding="utf-8"))
    return None


def get_generation_history() -> list[dict]:
    """Return a list of all past generations with their metadata, newest first."""
    history = []
    for img_path in list_outputs():
        entry = {"path": str(img_path), "filename": img_path.name}
        meta = load_metadata(img_path)
        if meta:
            entry.update(meta)
        else:
            # Fallback: extract what we can from the filename
            entry["timestamp"] = datetime.fromtimestamp(img_path.stat().st_mtime).isoformat()
        history.append(entry)
    return history


def delete_output(image_path: Path) -> None:
    """Delete an output image and its metadata sidecar."""
    image_path.unlink(missing_ok=True)
    _metadata_path(image_path).unlink(missing_ok=True)


def filter_history(
    history: list[dict],
    search: str = "",
    resolution_filter: str = "",
) -> list[dict]:
    """Filter generation history by prompt text and/or resolution string (e.g. '3840x2160')."""
    results = history
    if search:
        search_lower = search.lower()
        results = [
            e for e in results
            if search_lower in e.get("prompt", "").lower()
            or search_lower in e.get("filename", "").lower()
        ]
    if resolution_filter:
        results = [
            e for e in results
            if e.get("target_resolution")
            and f"{e['target_resolution'][0]}x{e['target_resolution'][1]}" == resolution_filter
        ]
    return results


def batch_export_zip(image_paths: list[Path]) -> bytes:
    """Create an in-memory ZIP archive containing the given images."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in image_paths:
            if path.exists():
                zf.write(path, path.name)
    return buf.getvalue()
