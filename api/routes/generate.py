import asyncio
from pathlib import Path

from fastapi import APIRouter, WebSocket

from src.generator.orchestrator import run_pipeline, PipelineStage
from api.schemas import GenerateRequest

router = APIRouter()

# Simple lock to prevent concurrent generations on a single GPU
_generation_lock = asyncio.Lock()

STAGE_WEIGHTS = {
    "loading_model": (0.0, 0.15),
    "generating": (0.15, 0.65),
    "unloading_model": (0.65, 0.70),
    "loading_upscaler": (0.70, 0.75),
    "upscaling": (0.75, 0.95),
    "saving": (0.95, 1.0),
}


@router.websocket("/ws/generate")
async def ws_generate(websocket: WebSocket):
    await websocket.accept()

    try:
        data = await websocket.receive_json()
        request = GenerateRequest(**data)
    except Exception as e:
        await websocket.send_json({"type": "error", "error": str(e)})
        await websocket.close()
        return

    if _generation_lock.locked():
        await websocket.send_json({
            "type": "error",
            "error": "A generation is already in progress. Please wait.",
        })
        await websocket.close()
        return

    async with _generation_lock:
        progress_queue: asyncio.Queue = asyncio.Queue()

        def on_progress(stage: PipelineStage, frac: float, msg: str):
            weights = STAGE_WEIGHTS.get(stage.value, (0.0, 0.0))
            overall = weights[0] + frac * (weights[1] - weights[0])
            progress_queue.put_nowait({
                "type": "progress",
                "stage": stage.value,
                "progress": round(min(overall, 1.0), 4),
                "message": msg,
            })

        loop = asyncio.get_event_loop()
        pipeline_task = loop.run_in_executor(
            None,
            lambda: run_pipeline(
                prompt=request.prompt,
                target_width=request.target_width,
                target_height=request.target_height,
                negative_prompt=request.negative_prompt,
                num_inference_steps=request.num_inference_steps,
                guidance_scale=request.guidance_scale,
                seed=request.seed if request.seed >= 0 else None,
                enable_upscaling=request.enable_upscaling,
                upscale_model=request.upscale_model,
                on_progress=on_progress,
            ),
        )

        # Stream progress while pipeline runs
        while not pipeline_task.done():
            try:
                msg = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
                await websocket.send_json(msg)
            except asyncio.TimeoutError:
                continue

        # Drain remaining progress messages
        while not progress_queue.empty():
            await websocket.send_json(progress_queue.get_nowait())

        result = pipeline_task.result()

        filename = Path(result.output_path).name if result.output_path else None
        await websocket.send_json({
            "type": "complete",
            "success": result.error is None,
            "image_url": f"/images/{filename}" if filename else None,
            "filename": filename,
            "seed_used": result.seed_used,
            "base_resolution": list(result.base_resolution) if result.base_resolution else None,
            "target_resolution": list(result.target_resolution) if result.target_resolution else None,
            "error": result.error,
        })

    await websocket.close()
