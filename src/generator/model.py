import torch
from diffusers import StableDiffusionXLPipeline
from pathlib import Path

from src.config.settings import MODEL_DIR, DEFAULT_SETTINGS


def load_sdxl_pipeline(
    model_id: str | None = None,
    use_fp16: bool | None = None,
    enable_attention_slicing: bool | None = None,
) -> StableDiffusionXLPipeline:
    """Load and configure the Stable Diffusion XL pipeline on GPU."""
    model_id = model_id or DEFAULT_SETTINGS["model_id"]
    use_fp16 = use_fp16 if use_fp16 is not None else DEFAULT_SETTINGS["use_fp16"]
    enable_attention_slicing = (
        enable_attention_slicing
        if enable_attention_slicing is not None
        else DEFAULT_SETTINGS["enable_attention_slicing"]
    )

    dtype = torch.float16 if use_fp16 else torch.float32

    pipe = StableDiffusionXLPipeline.from_pretrained(
        model_id,
        torch_dtype=dtype,
        cache_dir=str(MODEL_DIR),
        use_safetensors=True,
    )
    pipe = pipe.to("cuda")

    if enable_attention_slicing:
        pipe.enable_attention_slicing()

    pipe.enable_vae_tiling()

    return pipe


def unload_pipeline(pipe: StableDiffusionXLPipeline) -> None:
    """Unload pipeline and free GPU memory."""
    del pipe
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
