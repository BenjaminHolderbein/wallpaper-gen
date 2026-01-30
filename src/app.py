"""Streamlit UI for AI Wallpaper Generator."""

import io
import os
import sys
from datetime import datetime

# Ensure project root is on sys.path so `src.*` imports work when run via streamlit
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import streamlit as st  # noqa: E402

from src.config.presets import (  # noqa: E402
    DEVICE_PRESETS,
    get_preset_display_options,
    parse_preset_display_option,
    validate_resolution,
    calculate_base_resolution,
)
from src.config.settings import DEFAULT_SETTINGS  # noqa: E402
from src.generator.orchestrator import run_pipeline, PipelineStage, PipelineResult  # noqa: E402
from src.generator.upscaler import UPSCALER_MODELS  # noqa: E402
from src.utils.file_utils import (  # noqa: E402
    get_generation_history,
    load_metadata,
    filter_history,
    batch_export_zip,
    delete_output,
    list_outputs,
)


st.set_page_config(page_title="AI Wallpaper Generator", layout="wide")
st.markdown(
    """<style>
    .gallery-grid [data-testid="stImage"] img { max-height: 300px; width: auto; object-fit: contain; }
    </style>""",
    unsafe_allow_html=True,
)
st.title("AI Wallpaper Generator")

# --- Sidebar: Resolution & Settings ---
with st.sidebar:
    st.header("Resolution")

    resolution_mode = st.radio(
        "Mode", ["Device Preset", "Custom Resolution"], horizontal=True
    )

    if resolution_mode == "Device Preset":
        preset_options = get_preset_display_options()
        selected = st.selectbox("Device", preset_options, index=preset_options.index("4K (UHD) (3840x2160)"))
        preset = parse_preset_display_option(selected)
        target_width = preset.width
        target_height = preset.height
    else:
        col1, col2 = st.columns(2)
        with col1:
            target_width = st.number_input("Width", min_value=64, max_value=8192, value=1920, step=8)
        with col2:
            target_height = st.number_input("Height", min_value=64, max_value=8192, value=1080, step=8)

        valid, err = validate_resolution(target_width, target_height)
        if not valid:
            st.error(err)

    base_w, base_h = calculate_base_resolution(target_width, target_height)
    st.caption(f"Target: {target_width}x{target_height} | Base: {base_w}x{base_h}")

    st.divider()
    st.header("Settings")

    num_steps = st.slider("Inference Steps", 10, 100, DEFAULT_SETTINGS["num_inference_steps"], help="Number of denoising steps. More steps generally produce higher quality but take longer.")
    guidance = st.slider("Guidance Scale", 1.0, 20.0, DEFAULT_SETTINGS["guidance_scale"], step=0.5, help="How closely the image follows the prompt. Higher values are more literal, lower values are more creative.")
    seed = st.number_input("Seed (-1 = random)", min_value=-1, max_value=2**31, value=-1, help="Fixed seed for reproducible results. Set to -1 for a random seed each time.")
    enable_upscaling = st.checkbox("Enable AI Upscaling", value=True, help="Use Real-ESRGAN to upscale the base image to your target resolution.")

    upscale_model = DEFAULT_SETTINGS["upscale_model"]
    if enable_upscaling:
        model_options = list(UPSCALER_MODELS.keys())
        upscale_model = st.selectbox(
            "Upscaler Model",
            model_options,
            index=model_options.index(DEFAULT_SETTINGS["upscale_model"]),
            help=UPSCALER_MODELS[model_options[0]]["description"],
        )

# --- Main Area: Prompt & Generation ---
prompt = st.text_area("Prompt", placeholder="Describe the wallpaper you want to generate...")
negative_prompt = st.text_input(
    "Negative Prompt",
    value=DEFAULT_SETTINGS["negative_prompt"],
    help="Describes what you don't want in the image. The model will try to avoid these concepts during generation.",
)

generate_clicked = st.button("Generate Wallpaper", type="primary", use_container_width=True)

if generate_clicked:
    if not prompt.strip():
        st.error("Please enter a prompt.")
    else:
        progress_bar = st.progress(0.0)
        status_text = st.empty()

        # Map pipeline stages to overall progress ranges
        stage_weights = {
            PipelineStage.LOADING_MODEL: (0.0, 0.15),
            PipelineStage.GENERATING: (0.15, 0.65),
            PipelineStage.UNLOADING_MODEL: (0.65, 0.70),
            PipelineStage.LOADING_UPSCALER: (0.70, 0.75),
            PipelineStage.UPSCALING: (0.75, 0.95),
            PipelineStage.SAVING: (0.95, 1.0),
        }

        def on_progress(stage: PipelineStage, frac: float, msg: str):
            if stage in stage_weights:
                lo, hi = stage_weights[stage]
                overall = lo + frac * (hi - lo)
                progress_bar.progress(min(overall, 1.0))
            status_text.text(msg)

        with st.spinner("Generating..."):
            result: PipelineResult = run_pipeline(
                prompt=prompt.strip(),
                target_width=target_width,
                target_height=target_height,
                negative_prompt=negative_prompt or None,
                num_inference_steps=num_steps,
                guidance_scale=guidance,
                seed=seed if seed >= 0 else None,
                enable_upscaling=enable_upscaling,
                upscale_model=upscale_model,
                save_output=True,
                on_progress=on_progress,
            )

        progress_bar.empty()
        status_text.empty()

        if result.error:
            st.error(f"Generation failed: {result.error}")
        else:
            st.success(f"Wallpaper generated! Seed: {result.seed_used}")

            # Display result
            display_image = result.upscaled_image or result.base_image
            st.image(display_image, caption=f"{display_image.size[0]}x{display_image.size[1]}", use_container_width=True)

            # Show base vs upscaled if upscaling was used
            if enable_upscaling and result.base_image and result.upscaled_image:
                with st.expander("Compare Base vs Upscaled"):
                    col1, col2 = st.columns(2)
                    with col1:
                        st.caption(f"Base ({result.base_image.size[0]}x{result.base_image.size[1]})")
                        st.image(result.base_image, use_container_width=True)
                    with col2:
                        st.caption(f"Upscaled ({result.upscaled_image.size[0]}x{result.upscaled_image.size[1]})")
                        st.image(result.upscaled_image, use_container_width=True)

            # Download button
            buf = io.BytesIO()
            display_image.save(buf, format="PNG")
            st.download_button(
                label="Download Wallpaper",
                data=buf.getvalue(),
                file_name=f"wallpaper_{target_width}x{target_height}.png",
                mime="image/png",
                use_container_width=True,
            )

            if result.output_path:
                st.caption(f"Saved to: {result.output_path}")

# --- Gallery ---
st.divider()
st.header("Gallery")

history = get_generation_history()
if not history:
    st.info("No wallpapers generated yet. Create your first one above!")
else:
    # Search and filter controls
    filter_col1, filter_col2 = st.columns([3, 1])
    with filter_col1:
        search_query = st.text_input(
            "Search prompts", placeholder="Filter by keyword...", label_visibility="collapsed"
        )
    with filter_col2:
        # Build unique resolution options from history
        resolutions = sorted({
            f"{e['target_resolution'][0]}x{e['target_resolution'][1]}"
            for e in history if e.get("target_resolution")
        })
        res_options = ["All resolutions"] + resolutions
        res_selection = st.selectbox("Resolution", res_options, label_visibility="collapsed")

    filtered = filter_history(
        history,
        search=search_query,
        resolution_filter="" if res_selection == "All resolutions" else res_selection,
    )

    st.caption(f"Showing {len(filtered)} of {len(history)} wallpapers")

    # Batch export
    if filtered:
        from pathlib import Path as _Path
        export_paths = [_Path(e["path"]) for e in filtered]
        zip_data = batch_export_zip(export_paths)
        st.download_button(
            "Export all as ZIP",
            data=zip_data,
            file_name="wallpapers.zip",
            mime="application/zip",
        )

    # Pagination
    ITEMS_PER_PAGE = 9
    total_pages = max(1, (len(filtered) + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE)
    page = st.number_input("Page", min_value=1, max_value=total_pages, value=1, label_visibility="collapsed") if total_pages > 1 else 1
    page_start = (page - 1) * ITEMS_PER_PAGE
    page_items = filtered[page_start : page_start + ITEMS_PER_PAGE]

    def _format_time_ago(timestamp_str: str) -> str:
        """Format a timestamp as relative time or absolute date."""
        try:
            ts = datetime.fromisoformat(timestamp_str)
        except (ValueError, TypeError):
            return ""
        delta = datetime.now() - ts
        seconds = int(delta.total_seconds())
        if seconds < 60:
            return "just now"
        minutes = seconds // 60
        if minutes < 60:
            return f"{minutes}min ago"
        hours = minutes // 60
        if hours < 24:
            return f"{hours}h ago"
        days = hours // 24
        if days < 7:
            return f"{days}d ago"
        return ts.strftime("%-m/%-d/%y") if os.name != "nt" else ts.strftime("%#m/%#d/%y")

    # Grid display
    st.markdown('<div class="gallery-grid">', unsafe_allow_html=True)
    for i in range(0, len(page_items), 3):
        cols = st.columns(3)
        for j, col in enumerate(cols):
            idx = i + j
            if idx >= len(page_items):
                break
            entry = page_items[idx]
            with col:
                st.image(entry["path"], use_container_width=True)
                prompt_text = entry.get("prompt", "")
                prompt_col, view_col, del_col = st.columns([5, 1, 1])
                with prompt_col:
                    if prompt_text:
                        st.markdown(f"**{prompt_text[:80]}**")
                with view_col:
                    if st.button(":material/open_in_full:", key=f"view_{entry['filename']}", help="View full size"):
                        st.session_state["view_image"] = entry["path"]
                with del_col:
                    if st.button(":material/delete:", key=f"del_{entry['filename']}", help="Delete"):
                        delete_output(_Path(entry["path"]))
                        st.rerun()
                # Resolution and timestamp line
                info_parts = []
                resolution = entry.get("target_resolution")
                if resolution:
                    info_parts.append(f"{resolution[0]}x{resolution[1]}")
                time_ago = _format_time_ago(entry.get("timestamp", ""))
                if time_ago:
                    info_parts.append(time_ago)
                with prompt_col:
                    if info_parts:
                        st.caption(" · ".join(info_parts))

    st.markdown('</div>', unsafe_allow_html=True)

    if total_pages > 1:
        st.caption(f"Page {page} of {total_pages}")

    # Full-size image viewer
    if "view_image" in st.session_state and st.session_state["view_image"]:
        view_path = st.session_state["view_image"]
        st.divider()
        col_close, _ = st.columns([1, 8])
        with col_close:
            if st.button("Close", key="close_viewer"):
                del st.session_state["view_image"]
                st.rerun()
        st.image(view_path)
