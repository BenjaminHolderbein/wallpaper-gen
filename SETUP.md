# AI Wallpaper Generator - Setup Guide

Complete setup guide for getting the AI Wallpaper Generator running on a new machine.

---

## Prerequisites

### Required Software

1. **Python 3.10, 3.11, or 3.12**
   - Check version: `python3 --version`
   - Download from: https://www.python.org/downloads/

2. **Poetry** (Python dependency manager)
   - Install: `curl -sSL https://install.python-poetry.org | python3 -`
   - Verify: `poetry --version`
   - Docs: https://python-poetry.org/docs/#installation

3. **Node.js 20.19+ or 22+**
   - Check version: `node --version`
   - Download from: https://nodejs.org/ (LTS version)
   - Or via Homebrew (macOS): `brew install node@20`

4. **Git**
   - Check version: `git --version`
   - Download from: https://git-scm.com/downloads

### Hardware Requirements

- **GPU**: NVIDIA GPU with CUDA support (recommended: 8GB+ VRAM)
  - RTX 3060, 3070, 3080, 4070, 4080, 4090, etc.
  - **OR** CPU-only mode (slower, 10-20x longer generation time)

- **RAM**: 16GB minimum (32GB recommended)
- **Storage**: 10GB+ free space (for models and outputs)

### Optional: CUDA Toolkit

If you have an NVIDIA GPU and want GPU acceleration:
- **CUDA 12.4** (matches PyTorch version)
- Download from: https://developer.nvidia.com/cuda-downloads
- **Note**: The project will work without CUDA installed, falling back to CPU

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BenjaminHolderbein/wallpaper-gen.git
cd wallpaper-gen
```

### 2. Backend Setup (Python + FastAPI)

#### Install Python Dependencies

```bash
# Install all dependencies (PyTorch, FastAPI, diffusers, etc.)
poetry install
```

This will:
- Create a virtual environment
- Install PyTorch with CUDA 12.4 support
- Install all required packages (FastAPI, diffusers, Real-ESRGAN, etc.)

**First time**: This may take 5-10 minutes as it downloads PyTorch (~2GB) and other dependencies.

#### Fix basicsr Compatibility Issue

There's a known compatibility issue with `basicsr` and newer `torchvision` versions. Apply this fix:

```bash
# Find the virtualenv path
poetry env info --path
# Example output: /Users/username/Library/Caches/pypoetry/virtualenvs/wallpaper-gen-XXXXXXXX-py3.11

# Edit the degradations.py file (use the path from above)
# Replace: from torchvision.transforms.functional_tensor import rgb_to_grayscale
# With:    from torchvision.transforms.functional import rgb_to_grayscale
```

**Quick fix command** (macOS/Linux):
```bash
VENV_PATH=$(poetry env info --path)
sed -i.bak 's/from torchvision.transforms.functional_tensor import rgb_to_grayscale/from torchvision.transforms.functional import rgb_to_grayscale/' "$VENV_PATH/lib/python*/site-packages/basicsr/data/degradations.py"
```

**Manual fix** (Windows or if command fails):
1. Run `poetry env info --path` to get your virtualenv path
2. Navigate to `<venv-path>/lib/python3.XX/site-packages/basicsr/data/degradations.py`
3. Open in text editor
4. Line 8: Change `functional_tensor` to `functional`
5. Save file

#### Verify Backend Installation

```bash
# Test CUDA availability (if you have an NVIDIA GPU)
poetry run python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'CUDA device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"None\"}')"
```

Expected output (with NVIDIA GPU):
```
CUDA available: True
CUDA device: NVIDIA GeForce RTX 4070 Ti
```

Or (CPU-only):
```
CUDA available: False
CUDA device: None
```

### 3. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
cd ..
```

This installs React, Vite, Tailwind CSS, and all frontend dependencies.

---

## Running the Application

You need **two terminal windows** open simultaneously:

### Terminal 1: Backend (FastAPI Server)

```bash
# From project root
poetry run uvicorn api.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

The backend API is now running at `http://localhost:8000`

### Terminal 2: Frontend (React Dev Server)

```bash
# From project root
cd frontend
npm run dev
```

**Expected output:**
```
  VITE vX.X.X  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4. Open the Application

Open your browser to: **http://localhost:5173**

You should see the AI Wallpaper Generator UI with:
- Sidebar with resolution presets and settings
- Prompt input area
- Gallery section

---

## First Generation Test

1. **Select a resolution preset** (default: 4K UHD - 3840x2160)
2. **Enter a prompt**: `"a serene mountain landscape at sunset, photorealistic, highly detailed"`
3. **Click "Generate Wallpaper"**

**Expected behavior:**
- Progress bar appears showing generation stages
- First generation will download SDXL model (~7GB) - this happens automatically
- Generation takes 20-40 seconds (GPU) or 5-15 minutes (CPU)
- Generated wallpaper appears in the result area
- Image is saved to `outputs/` directory
- Gallery refreshes to show the new wallpaper

---

## Project Structure

```
wallpaper-gen/
├── api/                      # FastAPI backend
│   ├── main.py              # API entry point
│   ├── schemas.py           # Pydantic models
│   └── routes/              # API endpoints
│       ├── config.py        # Presets & settings
│       ├── gallery.py       # Gallery operations
│       └── generate.py      # WebSocket generation
│
├── src/                     # Core Python backend (unchanged from Streamlit)
│   ├── generator/           # AI model & pipeline
│   │   ├── model.py         # SDXL model loading
│   │   ├── pipeline.py      # Generation logic
│   │   ├── upscaler.py      # Real-ESRGAN upscaling
│   │   └── orchestrator.py  # Pipeline orchestration
│   ├── config/              # Configuration
│   │   ├── presets.py       # Device resolution presets
│   │   └── settings.py      # Default settings
│   └── utils/               # Utilities
│       ├── file_utils.py    # File management
│       └── image_utils.py   # Image processing
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── App.tsx          # Main app component
│   │   ├── components/      # UI components
│   │   ├── hooks/           # React hooks
│   │   ├── api/             # API client
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
├── outputs/                 # Generated wallpapers (auto-created)
├── models/                  # Cached model weights (auto-created)
├── pyproject.toml          # Python dependencies
└── SETUP.md                # This file
```

---

## Troubleshooting

### Backend Issues

#### "Command not found: uvicorn"
**Solution**: You're in the wrong virtual environment or Poetry isn't set up correctly.
```bash
# Deactivate any active venv
deactivate

# Reinstall dependencies
poetry install

# Try again
poetry run uvicorn api.main:app --reload --port 8000
```

#### "ModuleNotFoundError: No module named 'torchvision.transforms.functional_tensor'"
**Solution**: Apply the basicsr fix (see step 2 above in Backend Setup)

#### Backend crashes with "CUDA out of memory"
**Solutions**:
1. Close other GPU-intensive applications
2. Reduce resolution preset (try 1080p instead of 4K)
3. Disable upscaling temporarily
4. Restart the backend server

#### Models download slowly
**Solution**: Models are downloaded from Hugging Face on first use:
- SDXL base model: ~7GB (one-time download)
- Real-ESRGAN model: ~64MB (one-time download)
- Be patient on first generation

### Frontend Issues

#### "Vite requires Node.js version 20.19+ or 22.12+"
**Solution**: Upgrade Node.js
```bash
# macOS (Homebrew)
brew install node@20
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Or download from nodejs.org
```

#### "Cannot find module '@types/node'"
**Solution**:
```bash
cd frontend
npm install --save-dev @types/node
```

#### Sidebar shows "Loading..." forever
**Solution**: Backend is not running or not accessible
1. Check Terminal 1 - is the backend server running?
2. Check browser console (F12) for errors
3. Verify backend is at `http://localhost:8000`
4. Try accessing `http://localhost:8000/api/config/presets` directly

#### WebSocket connection fails
**Solution**: Check Vite proxy configuration
1. Ensure `frontend/vite.config.ts` has proxy for `/api` and `/ws`
2. Restart frontend dev server
3. Check backend logs for incoming WebSocket connections

### Generation Issues

#### Generation is very slow (10+ minutes)
**Cause**: Running on CPU instead of GPU
**Solution**:
- Verify CUDA is installed and GPU is detected
- Check: `poetry run python -c "import torch; print(torch.cuda.is_available())"`
- If False, install CUDA toolkit or accept slower CPU generation

#### Generated images are low quality
**Solutions**:
1. Increase inference steps (try 50-100)
2. Adjust guidance scale (try 7.5-12)
3. Improve your prompt (be more specific and descriptive)
4. Try different seeds
5. Ensure upscaling is enabled

#### Gallery doesn't update after generation
**Solution**: Refresh the page or check:
1. Generated files in `outputs/` directory
2. Backend logs for save errors
3. Browser console for frontend errors

---

## Configuration

### Device Presets

The app includes 15 built-in device presets:

**Mobile:**
- iPhone 14 Pro Max: 2796x1290
- iPhone 14 Pro: 2556x1179
- iPhone 14: 2532x1170
- iPhone SE: 1334x750
- Samsung Galaxy S23 Ultra: 3088x1440

**Tablets:**
- iPad Pro 12.9": 2732x2048
- iPad Pro 11": 2388x1668
- iPad Air: 2360x1640

**Desktops:**
- 13" MacBook Pro: 2560x1600
- 14" MacBook Pro: 3024x1964
- 16" MacBook Pro: 3456x2234
- 1080p (Full HD): 1920x1080
- 1440p (2K): 2560x1440
- 4K (UHD): 3840x2160
- 5K: 5120x2880

### Default Settings

**Generation:**
- Inference Steps: 30 (range: 10-100)
- Guidance Scale: 7.5 (range: 1.0-20.0)
- Seed: -1 (random)

**Upscaling:**
- Enabled by default
- Model: RealESRGAN_x4plus (4x upscaling)
- Alternative: RealESRGAN_x2plus (2x upscaling, faster)

**Negative Prompt (default):**
```
blurry, low quality, distorted, deformed, ugly, bad anatomy
```

---

## Performance Benchmarks

Based on NVIDIA RTX 4070 Ti (12GB VRAM):

| Stage | Time | VRAM Usage |
|-------|------|------------|
| Model Loading | 3-5s | 6.5GB |
| Base Generation (1024x576, 30 steps) | 5-6s | 6.5GB |
| Upscaling (to 4K) | 3-5s | 5GB peak |
| **Total (4K wallpaper)** | **~15-20s** | **~7GB peak** |

**CPU Performance** (no GPU):
- Model Loading: 5-10s
- Base Generation: 5-15 minutes
- Upscaling: 1-2 minutes
- **Total**: ~6-17 minutes per wallpaper

---

## Tips for Best Results

### Prompt Engineering

**Good prompts are:**
- Specific and descriptive
- Include style keywords (photorealistic, artistic, abstract, etc.)
- Mention quality (highly detailed, 4k, professional, etc.)
- Describe lighting, colors, mood

**Examples:**

✅ **Good:**
```
"a serene mountain landscape at golden hour, dramatic clouds, photorealistic,
highly detailed, professional photography, 8k"
```

❌ **Bad:**
```
"mountain"
```

✅ **Good:**
```
"cyberpunk city at night, neon lights, rain-soaked streets, futuristic
architecture, cinematic lighting, blade runner style"
```

❌ **Bad:**
```
"city lights"
```

### Settings Recommendations

**For speed** (quick previews):
- Steps: 20-25
- Disable upscaling
- Lower resolution preset

**For quality** (final wallpapers):
- Steps: 40-50
- Enable upscaling with x4plus
- Max resolution preset
- Guidance: 7.5-10

**For experimentation:**
- Use fixed seed (copy from previous generation)
- Adjust guidance scale to see variations
- Try different negative prompts

---

## Updating the Application

### Pull Latest Changes

```bash
cd wallpaper-gen
git pull origin main
```

### Update Backend Dependencies

```bash
poetry install
```

### Update Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Restart Servers

Stop both servers (CTRL+C) and restart them following the "Running the Application" section.

---

## Uninstallation

### Remove the Project

```bash
# Delete project directory
rm -rf wallpaper-gen
```

### Clean Up Poetry Virtual Environments

```bash
# List Poetry environments
poetry env list

# Remove specific environment
poetry env remove <env-name>

# Or remove all Poetry cache
rm -rf ~/Library/Caches/pypoetry  # macOS
rm -rf ~/.cache/pypoetry          # Linux
```

### Remove Model Cache

Models are cached in the project directory:
```bash
rm -rf wallpaper-gen/models
```

---

## Additional Resources

- **PLAN.md** - Original Streamlit implementation plan
- **REACT_MIGRATION_PLAN.md** - React migration roadmap
- **Stable Diffusion XL Docs**: https://huggingface.co/docs/diffusers/using-diffusers/sdxl
- **Real-ESRGAN**: https://github.com/xinntao/Real-ESRGAN
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console (F12 → Console tab)
2. Check backend logs (Terminal 1)
3. Check frontend logs (Terminal 2)
4. Verify all prerequisites are installed correctly
5. Try restarting both servers

For persistent issues, check the GitHub Issues page or create a new issue with:
- Your operating system
- Python version (`python3 --version`)
- Node.js version (`node --version`)
- GPU model (if applicable)
- Error messages and logs
