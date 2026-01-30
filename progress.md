Got it — here’s the **fixed, fully-contained code block** so nothing leaks out after that header:

````md
# wallpaper-gen — Streamlit → React + FastAPI migration handoff (local RTX 4070 Ti)

## Repo / environment
- Repo path: `c:\Users\benja\OneDrive\Documents\Personal Projects\wallpaper-gen`
- Runs locally on one machine (RTX 4070 Ti)
- Goal: migrate Streamlit UI to **React + FastAPI** without letting the Streamlit start point constrain the new product UI/UX.

---

## Starting point (what must stay)
Backend Python code is cleanly separated and must remain intact:
- `src/generator/` — SDXL model loading, pipeline, upscaler, orchestrator
- `src/utils/` — gallery/history, file/image helpers
- `src/config/` — presets, defaults, validation

Streamlit UI was previously in:
- `src/app.py` (to be retired after React parity)

---

## Key backend API surface (existing Python to wrap)
- `run_pipeline(prompt, target_width, target_height, negative_prompt, num_inference_steps, guidance_scale, seed, enable_upscaling, upscale_model, save_output, on_progress) -> PipelineResult`
- `get_generation_history() -> list[dict]` (path, filename, prompt, resolution, timestamp, etc.)
- `filter_history(history, search, resolution_filter) -> list[dict]`
- `delete_output(image_path) -> None` (deletes PNG + sidecar JSON)
- `batch_export_zip(image_paths) -> bytes` (ZIP)
- `load_metadata(image_path) -> dict`
- Config/constants:
  - `DEFAULT_SETTINGS`
  - `DEVICE_PRESETS` (15 presets across Mobile/Tablet/Laptop)
  - `UPSCALER_MODELS` (`RealESRGAN_x2plus`, `RealESRGAN_x4plus`)
  - `validate_resolution()`, `calculate_base_resolution()`

Progress callback shape:
- `on_progress(stage, fraction, message)` continuously during generation

---

## Prior commit (baseline)
- Streamlit “full implementation” commit:
  - `eb9833f` — “Add full project implementation: SDXL generation, upscaling, Streamlit UI …”
- Migration began after that (new FastAPI + frontend folders added).

---

## Architecture choices (decided)
- Frontend: **React + Vite + TypeScript + Tailwind**, **dark theme only**
- Backend API: **FastAPI** wrapper around existing `src/` code
- Real-time generation progress: **WebSocket** streaming

---

## Target project structure
```text
wallpaper-gen/
  src/           # KEEP - existing backend logic
  api/           # NEW - FastAPI layer
  frontend/      # NEW - React app (Vite)
  outputs/       # generated images + JSON sidecars
  models/        # model weights cache
  pyproject.toml
````

---

## Work already completed (IMPORTANT)

### 1) Python deps updated

* Edited `pyproject.toml` to add:

  * `fastapi`, `uvicorn[standard]`, `websockets`
* Ran:

  * `poetry lock`
  * `poetry install --no-root`
* Noted installed versions included:

  * `fastapi 0.128.0`, `uvicorn 0.40.0`, `websockets 16.0`
  * pydantic updated as part of lock resolve

### 2) FastAPI layer created (files written)

Created:

* `api/`
* `api/routes/`

Files written:

* `api/main.py`
* `api/schemas.py`
* `api/routes/config.py`
* `api/routes/gallery.py`
* `api/routes/generate.py`
* `api/__init__.py`, `api/routes/__init__.py`

Endpoint intent/design:

* REST:

  * `GET /api/config/presets`
  * `GET /api/config/validate?w=&h=`
  * `GET /api/gallery?search=&resolution=&page=&per_page=`
  * `DELETE /api/gallery/{filename}`
  * `GET /api/gallery/export?filenames=...`
* Static:

  * `/images/{filename}` served from `outputs/`
* WebSocket:

  * `/ws/generate` (client sends request JSON; server streams progress + final result)

### 3) React app scaffolded + Tailwind installed

Ran:

* `npm create vite@latest frontend -- --template react-ts`
* `npm install`
* `npm install -D tailwindcss @tailwindcss/vite`

Updated:

* `frontend/vite.config.ts` — proxy `/api` and `/images` → `http://localhost:8000`
* `frontend/index.html` — dark theme baseline

Wrote core frontend files:

* `frontend/src/index.css` (Tailwind directives + dark styles)
* `frontend/src/main.tsx`
* `frontend/src/types/index.ts`
* `frontend/src/api/client.ts`
* `frontend/src/hooks/useGenerate.ts`
* `frontend/src/hooks/useGallery.ts`

Wrote components:

* `Sidebar.tsx` — presets/custom res + sliders + tooltips
* `PromptForm.tsx`
* `ProgressBar.tsx`
* `ResultDisplay.tsx`
* `ImageComparison.tsx`
* `Gallery.tsx`
* `GalleryFilters.tsx`
* `GalleryCard.tsx`
* `Pagination.tsx`
* `ImageViewer.tsx`

Note:

* There was a brief “Write failed” when writing `index.css/main.tsx/types`, but it was immediately corrected and the files were successfully written afterward.

---

## Where the session ended

* FastAPI layer + React scaffolding + hooks/components exist.
* Next work is primarily **wiring `App.tsx`**, running backend + frontend, and fixing any integration bugs (URLs, WS, file serving, typing).
* Streamlit `src/app.py` not deleted yet.

---

## Next steps (to finish in the next session)

1. **Wire `frontend/src/App.tsx`**

   * Layout: sidebar + main
   * Connect hooks (`useGenerate`, `useGallery`)
   * Show progress/result/gallery and modal viewer

2. **Start FastAPI and verify endpoints**

   * `poetry run uvicorn api.main:app --reload --port 8000`
   * Validate:

     * `GET /api/config/presets`
     * `GET /api/gallery`
     * `/images/{filename}` loads existing outputs

3. **Start frontend**

   * `cd frontend && npm run dev`

4. **Fix integration issues**

   * CORS / proxy config correctness
   * Image URL construction
   * WebSocket URL (dev server vs backend)
   * Ensure gallery delete/export endpoints match filenames
   * Ensure WS progress streaming is thread-safe (callback → queue → async sender)

5. **Retire Streamlit**

   * Delete/stop using `src/app.py` after parity is confirmed

6. **Commit the migration**

   * After a full smoke test (generate → progress → result → gallery → delete/export)

---

## One-line status

Backend FastAPI + frontend (Vite/React/Tailwind) scaffolding is done; remaining work is **App wiring + running both servers + debugging integration**, then removing Streamlit.

```
```
