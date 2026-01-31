# AI Wallpaper Generator

Generate high-resolution AI wallpapers using Stable Diffusion XL with Real-ESRGAN upscaling. Built with a FastAPI backend and React frontend.

## Features

- **SDXL image generation** with configurable inference steps, guidance scale, and seed
- **Real-ESRGAN upscaling** (2x or 4x) to reach target resolutions up to 5K
- **15 device presets** (iPhone, iPad, MacBook, desktop monitors) or custom resolution
- **Gallery** with search, filtering, prompt copying, full-screen viewer, and batch export
- **WebSocket progress** streaming with real-time status updates
- **One-command setup** via `start.ps1`

## Quick Start

### Prerequisites

- Python 3.10-3.12
- [uv](https://github.com/astral-sh/uv) (recommended for Python deps; use `python -m uv` if not on PATH)
- Node.js 20.19+ or 22+
- NVIDIA GPU with CUDA (optional, falls back to CPU)

### Run

```powershell
# First time (or if execution policy blocks it):
powershell -ExecutionPolicy Bypass -File .\start.ps1

# After allowing local scripts:
.\start.ps1
```

This installs all dependencies, patches known issues, ensures CUDA PyTorch, and launches both servers. Open **http://localhost:5173**.

### Options

```powershell
.\start.ps1 -SkipInstall     # Skip dependency checks, just launch servers
.\start.ps1 -BackendOnly     # Only start the API server (port 8000)
.\start.ps1 -FrontendOnly    # Only start the dev server (port 5173)
```

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| AI Model | Stable Diffusion XL (diffusers)         |
| Upscaler | Real-ESRGAN (4x / 2x)                  |
| Backend  | FastAPI + WebSockets + Uvicorn          |
| Frontend | React + TypeScript + Vite + Tailwind CSS|
| Icons    | Lucide React                            |
| Package  | uv (Python) + npm (JS)                  |

## Project Structure

```
wallpaper-gen/
├── api/                  # FastAPI backend
│   ├── main.py           # API entry point
│   ├── schemas.py        # Pydantic models
│   └── routes/           # Endpoints (config, gallery, generate)
├── src/                  # Core Python modules
│   ├── generator/        # SDXL model, pipeline, upscaler, orchestrator
│   ├── config/           # Presets and default settings
│   └── utils/            # File and image utilities
├── frontend/             # React frontend
│   ├── src/
│   │   ├── App.tsx       # Main app component
│   │   ├── components/   # UI components
│   │   ├── hooks/        # React hooks (useGenerate, useGallery)
│   │   ├── api/          # API client (REST + WebSocket)
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── outputs/              # Generated wallpapers (auto-created)
├── models/               # Cached model weights (auto-created)
├── start.ps1             # One-command setup & run script
├── pyproject.toml        # Python dependencies
└── SETUP.md              # Detailed setup & troubleshooting guide
```

## Documentation

See [SETUP.md](SETUP.md) for detailed installation, troubleshooting, configuration, performance benchmarks, and prompt engineering tips.

## Model Licenses

This project downloads and uses third-party models:

- Stable Diffusion XL (stabilityai/stable-diffusion-xl-base-1.0) from Hugging Face
- Real-ESRGAN (RealESRGAN_x4plus / RealESRGAN_x2plus)

Please review and comply with the license and usage terms for those models.
