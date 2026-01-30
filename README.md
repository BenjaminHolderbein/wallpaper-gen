# AI Wallpaper Generator

Generate stunning AI wallpapers using Stable Diffusion XL with Real-ESRGAN upscaling. Features a modern React UI with real-time progress tracking and a built-in gallery.

![Preview](https://img.shields.io/badge/Status-Beta-yellow)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-blue)
![CUDA](https://img.shields.io/badge/CUDA-12.4-green)

## Features

- 🎨 **AI-Powered Generation** - Stable Diffusion XL for high-quality base images
- 🔍 **AI Upscaling** - Real-ESRGAN for crisp, detailed wallpapers up to 5K
- 📱 **15 Device Presets** - iPhone, iPad, MacBook, and desktop resolutions
- ⚙️ **Full Control** - Adjust steps, guidance, seed, and negative prompts
- 🖼️ **Gallery Management** - Search, filter, and export your creations
- ⚡ **Real-time Progress** - WebSocket streaming for live generation updates
- 🎯 **GPU Accelerated** - Optimized for NVIDIA GPUs (also works on CPU)

## Quick Start

### Prerequisites

- Python 3.10-3.12
- Node.js 20+
- NVIDIA GPU with 8GB+ VRAM (recommended) or CPU

### Installation

```bash
# Clone the repository
git clone https://github.com/BenjaminHolderbein/wallpaper-gen.git
cd wallpaper-gen

# Install backend dependencies
poetry install

# Fix basicsr compatibility (one-time)
VENV_PATH=$(poetry env info --path)
sed -i.bak 's/functional_tensor/functional/' "$VENV_PATH/lib/python*/site-packages/basicsr/data/degradations.py"

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Running

**Terminal 1 - Backend:**
```bash
poetry run uvicorn api.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. Select a resolution preset or enter custom dimensions
2. Enter your prompt (e.g., "a serene mountain landscape at sunset, photorealistic")
3. Adjust settings (optional): steps, guidance scale, seed
4. Click "Generate Wallpaper"
5. Wait 20-40 seconds (GPU) or 5-15 minutes (CPU)
6. Download or view in gallery

## Documentation

- **[SETUP.md](SETUP.md)** - Complete setup guide with troubleshooting
- **[REACT_MIGRATION_PLAN.md](REACT_MIGRATION_PLAN.md)** - Migration roadmap and status
- **[PLAN.md](PLAN.md)** - Original implementation plan

## Architecture

**Backend (Python + FastAPI):**
- SDXL model for base generation (1024x1024)
- Real-ESRGAN for AI upscaling (up to 5K)
- WebSocket for real-time progress updates

**Frontend (React + TypeScript + Tailwind):**
- Modern dark-themed UI
- Real-time progress tracking
- Gallery with filters and pagination

## Performance

Based on NVIDIA RTX 4070 Ti (12GB VRAM):
- Model loading: 3-5s
- Base generation (30 steps): 5-6s
- Upscaling to 4K: 3-5s
- **Total: ~15-20 seconds per wallpaper**

CPU-only: ~6-17 minutes per wallpaper

## Device Presets

**Mobile:** iPhone 14 Pro Max, iPhone 14 Pro, iPhone 14, iPhone SE, Galaxy S23 Ultra
**Tablets:** iPad Pro 12.9", iPad Pro 11", iPad Air
**Desktops:** MacBook Pro (13"/14"/16"), 1080p, 1440p, 4K, 5K

## Technology Stack

**Backend:**
- Python 3.10+
- FastAPI (API framework)
- PyTorch 2.6+ with CUDA 12.4
- Diffusers (Stable Diffusion XL)
- Real-ESRGAN (AI upscaling)

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS

## Project Status

✅ Checkpoint 10 Complete: React UI fully functional
🔄 Next: Integration testing and bug fixes

## Requirements

**Minimum:**
- Python 3.10+
- Node.js 20+
- 8GB RAM
- 5GB free disk space

**Recommended:**
- Python 3.11
- Node.js 22
- 16GB+ RAM
- NVIDIA GPU with 8GB+ VRAM
- 10GB+ free disk space

## License

This project is for educational and personal use.

## Acknowledgments

- [Stable Diffusion XL](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) by Stability AI
- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) by Xinntao
- Built with [FastAPI](https://fastapi.tiangolo.com/) and [React](https://react.dev/)

## Contributing

This is a personal project, but feedback and suggestions are welcome via GitHub Issues.

---

**Need help?** See [SETUP.md](SETUP.md) for detailed setup instructions and troubleshooting.
