"""Two-stage wallpaper generation pipeline orchestrator.

Combines SDXL base generation and Real-ESRGAN upscaling into a single
pipeline with state management, sequential model loading for memory
optimization, and error handling.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Callable

import torch
from PIL import Image

from src.config.settings import DEFAULT_SETTINGS, ensure_directories
from src.config.presets import calculate_base_resolution
from src.generator.model import load_sdxl_pipeline, unload_pipeline
from src.generator.pipeline import generate_base_image
from src.generator.upscaler import load_upscaler, upscale_image, unload_upscaler
from src.utils.file_utils import get_output_path, save_metadata


class PipelineStage(Enum):
    IDLE = "idle"
    LOADING_MODEL = "loading_model"
    GENERATING = "generating"
    UNLOADING_MODEL = "unloading_model"
    LOADING_UPSCALER = "loading_upscaler"
    UPSCALING = "upscaling"
    SAVING = "saving"
    COMPLETE = "complete"
    ERROR = "error"


@dataclass
class PipelineResult:
    """Result of a full pipeline run."""
    base_image: Image.Image | None = None
    upscaled_image: Image.Image | None = None
    output_path: str | None = None
    base_resolution: tuple[int, int] | None = None
    target_resolution: tuple[int, int] | None = None
    seed_used: int | None = None
    error: str | None = None


ProgressCallback = Callable[[PipelineStage, float, str], None]
"""Callback signature: (stage, progress 0-1, message)"""


def _default_progress(stage: PipelineStage, progress: float, message: str) -> None:
    pass


def run_pipeline(
    prompt: str,
    target_width: int,
    target_height: int,
    negative_prompt: str | None = None,
    num_inference_steps: int | None = None,
    guidance_scale: float | None = None,
    seed: int | None = None,
    enable_upscaling: bool | None = None,
    upscale_model: str | None = None,
    save_output: bool = True,
    on_progress: ProgressCallback | None = None,
) -> PipelineResult:
    """Run the full two-stage wallpaper generation pipeline.

    Stage 1: Generate a base image at aspect-matched resolution using SDXL.
    Stage 2: Upscale to the target resolution using Real-ESRGAN.

    Models are loaded and unloaded sequentially to minimize peak VRAM usage.

    Args:
        prompt: Text prompt for image generation.
        target_width: Desired output width in pixels.
        target_height: Desired output height in pixels.
        negative_prompt: Things to avoid in the generated image.
        num_inference_steps: Number of denoising steps.
        guidance_scale: Classifier-free guidance scale.
        seed: Random seed (-1 or None for random).
        enable_upscaling: Whether to run the upscaling stage. Defaults to settings.
        upscale_model: Name of the upscaler model (e.g. "RealESRGAN_x4plus").
        save_output: Whether to save the final image to disk.
        on_progress: Optional callback for progress updates.

    Returns:
        PipelineResult with generated images and metadata.
    """
    if enable_upscaling is None:
        enable_upscaling = DEFAULT_SETTINGS["enable_upscaling"]

    progress = on_progress or _default_progress
    result = PipelineResult(target_resolution=(target_width, target_height))
    base_w, base_h = calculate_base_resolution(target_width, target_height)
    result.base_resolution = (base_w, base_h)

    pipe = None
    upscaler = None

    try:
        # --- Stage 1: Base image generation ---
        progress(PipelineStage.LOADING_MODEL, 0.0, "Loading SDXL model...")
        pipe = load_sdxl_pipeline()
        progress(PipelineStage.LOADING_MODEL, 1.0, "Model loaded.")

        progress(PipelineStage.GENERATING, 0.0, f"Generating {base_w}x{base_h} base image...")

        # Wrap the diffusers callback to forward progress
        step_count = num_inference_steps or DEFAULT_SETTINGS["num_inference_steps"]

        def _step_callback(pipe_obj, step, timestep, callback_kwargs):
            frac = (step + 1) / step_count
            progress(PipelineStage.GENERATING, frac, f"Step {step + 1}/{step_count}")
            return callback_kwargs

        base_image = generate_base_image(
            pipe,
            prompt=prompt,
            target_width=target_width,
            target_height=target_height,
            negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            seed=seed,
            callback=_step_callback,
        )
        result.base_image = base_image

        # Capture actual seed used
        if seed is not None and seed >= 0:
            result.seed_used = seed
        else:
            result.seed_used = -1  # random

        progress(PipelineStage.GENERATING, 1.0, "Base image generated.")

        # Free VRAM before upscaling
        progress(PipelineStage.UNLOADING_MODEL, 0.0, "Freeing generation model VRAM...")
        unload_pipeline(pipe)
        pipe = None
        progress(PipelineStage.UNLOADING_MODEL, 1.0, "VRAM freed.")

        # --- Stage 2: Upscaling ---
        if enable_upscaling:
            progress(PipelineStage.LOADING_UPSCALER, 0.0, "Loading upscaler...")
            upscaler = load_upscaler(model_name=upscale_model or DEFAULT_SETTINGS["upscale_model"])
            progress(PipelineStage.LOADING_UPSCALER, 1.0, "Upscaler loaded.")

            progress(PipelineStage.UPSCALING, 0.0, f"Upscaling to {target_width}x{target_height}...")
            upscaled = upscale_image(upscaler, base_image, target_width, target_height)
            result.upscaled_image = upscaled
            progress(PipelineStage.UPSCALING, 1.0, "Upscaling complete.")

            # Free upscaler VRAM
            unload_upscaler(upscaler)
            upscaler = None
        else:
            # No upscaling — resize base image to target with Lanczos
            result.upscaled_image = base_image.resize(
                (target_width, target_height), Image.LANCZOS
            )

        # --- Save output ---
        final_image = result.upscaled_image
        if save_output:
            progress(PipelineStage.SAVING, 0.0, "Saving wallpaper...")
            ensure_directories()
            output_path = get_output_path(prompt, target_width, target_height)
            final_image.save(str(output_path), quality=95)
            result.output_path = str(output_path)
            save_metadata(output_path, {
                "prompt": prompt,
                "negative_prompt": negative_prompt or "",
                "seed": result.seed_used,
                "num_inference_steps": num_inference_steps or DEFAULT_SETTINGS["num_inference_steps"],
                "guidance_scale": guidance_scale or DEFAULT_SETTINGS["guidance_scale"],
                "base_resolution": list(result.base_resolution),
                "target_resolution": [target_width, target_height],
                "enable_upscaling": enable_upscaling,
                "upscale_model": upscale_model or DEFAULT_SETTINGS["upscale_model"],
            })
            progress(PipelineStage.SAVING, 1.0, f"Saved to {output_path.name}")

        progress(PipelineStage.COMPLETE, 1.0, "Pipeline complete.")
        return result

    except torch.cuda.OutOfMemoryError:
        result.error = "Out of GPU memory. Try a smaller resolution or close other GPU applications."
        progress(PipelineStage.ERROR, 0.0, result.error)
        return result
    except Exception as e:
        result.error = str(e)
        progress(PipelineStage.ERROR, 0.0, f"Pipeline error: {e}")
        return result
    finally:
        # Ensure GPU memory is always freed
        if pipe is not None:
            try:
                unload_pipeline(pipe)
            except Exception:
                pass
        if upscaler is not None:
            try:
                unload_upscaler(upscaler)
            except Exception:
                pass
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
