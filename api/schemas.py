from pydantic import BaseModel


class GenerateRequest(BaseModel):
    prompt: str
    target_width: int = 3840
    target_height: int = 2160
    negative_prompt: str | None = None
    num_inference_steps: int = 30
    guidance_scale: float = 7.5
    seed: int = -1
    enable_upscaling: bool = True
    upscale_model: str = "RealESRGAN_x4plus"


class GenerateProgress(BaseModel):
    type: str = "progress"
    stage: str
    progress: float
    message: str


class GenerateComplete(BaseModel):
    type: str = "complete"
    success: bool
    image_url: str | None = None
    filename: str | None = None
    seed_used: int | None = None
    base_resolution: list[int] | None = None
    target_resolution: list[int] | None = None
    error: str | None = None


class GalleryItem(BaseModel):
    filename: str
    image_url: str
    prompt: str | None = None
    negative_prompt: str | None = None
    seed: int | None = None
    num_inference_steps: int | None = None
    guidance_scale: float | None = None
    base_resolution: list[int] | None = None
    target_resolution: list[int] | None = None
    enable_upscaling: bool | None = None
    upscale_model: str | None = None
    timestamp: str | None = None


class GalleryResponse(BaseModel):
    items: list[GalleryItem]
    total: int
    page: int
    per_page: int
    total_pages: int


class ValidationResponse(BaseModel):
    valid: bool
    error: str
