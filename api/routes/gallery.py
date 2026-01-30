import math
from pathlib import Path

from fastapi import APIRouter, Query, Response
from fastapi.responses import JSONResponse

from src.config.settings import OUTPUT_DIR
from src.utils.file_utils import (
    get_generation_history,
    filter_history,
    delete_output,
    batch_export_zip,
)
from api.schemas import GalleryItem, GalleryResponse

router = APIRouter()


def _to_gallery_item(entry: dict) -> GalleryItem:
    filename = entry["filename"]
    return GalleryItem(
        filename=filename,
        image_url=f"/images/{filename}",
        prompt=entry.get("prompt"),
        negative_prompt=entry.get("negative_prompt"),
        seed=entry.get("seed"),
        num_inference_steps=entry.get("num_inference_steps"),
        guidance_scale=entry.get("guidance_scale"),
        base_resolution=entry.get("base_resolution"),
        target_resolution=entry.get("target_resolution"),
        enable_upscaling=entry.get("enable_upscaling"),
        upscale_model=entry.get("upscale_model"),
        timestamp=entry.get("timestamp"),
    )


@router.get("")
def list_gallery(
    search: str = "",
    resolution: str = "",
    page: int = Query(1, ge=1),
    per_page: int = Query(9, ge=1, le=50),
) -> GalleryResponse:
    history = get_generation_history()
    filtered = filter_history(history, search=search, resolution_filter=resolution)
    total = len(filtered)
    total_pages = max(1, math.ceil(total / per_page))
    start = (page - 1) * per_page
    page_items = filtered[start : start + per_page]
    return GalleryResponse(
        items=[_to_gallery_item(e) for e in page_items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.get("/resolutions")
def list_resolutions():
    history = get_generation_history()
    resolutions = set()
    for entry in history:
        res = entry.get("target_resolution")
        if res:
            resolutions.add(f"{res[0]}x{res[1]}")
    return sorted(resolutions)


@router.delete("/{filename}")
def delete_image(filename: str):
    image_path = OUTPUT_DIR / filename
    if not image_path.exists():
        return JSONResponse(status_code=404, content={"error": "Not found"})
    delete_output(image_path)
    return Response(status_code=204)


@router.get("/export")
def export_zip(filenames: str = Query(...)):
    names = [n.strip() for n in filenames.split(",") if n.strip()]
    paths = [OUTPUT_DIR / name for name in names]
    zip_bytes = batch_export_zip(paths)
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=wallpapers.zip"},
    )
