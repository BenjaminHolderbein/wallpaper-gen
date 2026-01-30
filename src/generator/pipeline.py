import torch
from PIL import Image
from diffusers import StableDiffusionXLPipeline

from src.config.settings import DEFAULT_SETTINGS
from src.config.presets import calculate_base_resolution


def generate_base_image(
    pipe: StableDiffusionXLPipeline,
    prompt: str,
    target_width: int,
    target_height: int,
    negative_prompt: str | None = None,
    num_inference_steps: int | None = None,
    guidance_scale: float | None = None,
    seed: int | None = None,
    callback=None,
) -> Image.Image:
    """Generate a base image at aspect-matched resolution using SDXL.

    Args:
        pipe: Loaded SDXL pipeline.
        prompt: Text prompt for generation.
        target_width: Final desired width (used for aspect ratio calculation).
        target_height: Final desired height.
        negative_prompt: Things to avoid in the image.
        num_inference_steps: Number of denoising steps.
        guidance_scale: Classifier-free guidance scale.
        seed: Random seed for reproducibility. -1 or None for random.
        callback: Optional progress callback (step, timestep, latents).

    Returns:
        Generated PIL Image at base resolution.
    """
    negative_prompt = negative_prompt or DEFAULT_SETTINGS["negative_prompt"]
    num_inference_steps = num_inference_steps or DEFAULT_SETTINGS["num_inference_steps"]
    guidance_scale = guidance_scale or DEFAULT_SETTINGS["guidance_scale"]
    seed = seed if seed is not None else DEFAULT_SETTINGS["seed"]

    base_w, base_h = calculate_base_resolution(target_width, target_height)

    generator = None
    if seed >= 0:
        generator = torch.Generator(device="cuda").manual_seed(seed)

    result = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=base_w,
        height=base_h,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        generator=generator,
        callback_on_step_end=callback,
    )

    return result.images[0]
