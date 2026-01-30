# AI Wallpaper Generator - Implementation Plan

## Project Overview
Build a Python-based AI wallpaper generation pipeline with Streamlit interface, CUDA support for RTX 4070Ti, and Poetry dependency management.

## Technology Stack
- **AI Model**: Stable Diffusion XL or Flux (base generation at 1024x1024)
- **Upscaling**: Real-ESRGAN (AI upscaling to target resolution)
- **UI Framework**: Streamlit
- **GPU Acceleration**: CUDA (PyTorch with CUDA support)
- **Dependency Management**: Poetry
- **Image Processing**: Pillow, diffusers library, realesrgan

## Features
1. **Resolution Selection**
   - Custom resolution input (width x height)
   - Device presets:
     - iPhone 14 Pro Max: 2796x1290
     - 13" MacBook Pro: 2560x1600
     - Additional common presets (4K, 1080p, etc.)

2. **Generation Parameters**
   - Text prompt input
   - Negative prompt
   - Guidance scale
   - Number of inference steps
   - Seed control (for reproducibility)

3. **Two-Stage Pipeline**
   - **Stage 1**: Generate base image at optimal resolution (1024x1024)
   - **Stage 2**: AI upscale to target resolution using Real-ESRGAN
   - Automatic calculation of required upscale factor
   - Progress tracking for both stages

4. **Output Management**
   - Save generated wallpapers
   - Gallery view of previous generations
   - Download functionality

## Project Structure
```
wallpaper-gen/
├── pyproject.toml              # Poetry configuration
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore file
├── src/
│   ├── __init__.py
│   ├── app.py                  # Streamlit main application
│   ├── generator/
│   │   ├── __init__.py
│   │   ├── model.py            # AI model initialization and management
│   │   ├── pipeline.py         # Generation pipeline logic
│   │   └── upscaler.py         # Real-ESRGAN upscaling logic
│   ├── config/
│   │   ├── __init__.py
│   │   ├── presets.py          # Device resolution presets
│   │   └── settings.py         # Application settings
│   └── utils/
│       ├── __init__.py
│       ├── image_utils.py      # Image processing utilities
│       └── file_utils.py       # File management utilities
├── outputs/                    # Generated wallpapers directory
└── models/                     # Downloaded model cache
```

## Implementation Checkpoints

---

## ✅ CHECKPOINT 1: Project Foundation & Dependencies
**Goal**: Set up the project structure and install all dependencies

### Tasks
- [x] Create PLAN.md file
- [x] Initialize Poetry project with pyproject.toml
- [x] Set up project structure (directories and files)
- [x] Create .gitignore file
- [x] Add core dependencies:
  - streamlit
  - torch (with CUDA support)
  - torchvision
  - diffusers
  - transformers
  - accelerate
  - Pillow
  - safetensors
  - realesrgan (AI upscaling)
  - basicsr (Real-ESRGAN dependency)
  - facexlib (Real-ESRGAN dependency)
  - gfpgan (optional, for face enhancement)
- [x] Configure Poetry for Python 3.10+

### Testing
- [x] Verify Poetry installation and dependencies
- [x] Test CUDA availability with `torch.cuda.is_available()`
- [x] Verify all imports work correctly
- [x] Check VRAM detection with `torch.cuda.get_device_properties(0)`

### Notes
- PyTorch 2.6.0+cu124 installed via explicit PyTorch source (CUDA 12.4)
- GPU: NVIDIA GeForce RTX 4070 Ti (12.0 GB VRAM)
- Patched `basicsr/data/degradations.py`: replaced `torchvision.transforms.functional_tensor` with `torchvision.transforms.functional` (known compat issue with newer torchvision)

### Success Criteria
- All dependencies installed without errors
- CUDA detected and accessible
- Project structure created
- Can run `poetry install` successfully

---

## ✅ CHECKPOINT 2: Configuration & Presets
**Goal**: Implement configuration system with device presets

### Tasks
- [x] Create device presets configuration (iPhone, MacBook, etc.)
- [x] Create application settings (model paths, output directory, etc.)
- [x] Add validation for resolution inputs
- [x] Implement preset resolution calculator
- [x] Create utils for file management

### Testing
- [x] Test all device presets return correct resolutions
- [x] Test custom resolution input validation
- [x] Test aspect ratio calculations
- [x] Verify output directory creation
- [x] Test preset selection logic

### Success Criteria
- All presets defined and accessible
- Resolution validation works correctly
- Settings can be loaded and saved
- File paths resolve correctly

---

## ✅ CHECKPOINT 3: Base Image Generation (SDXL/Flux)
**Goal**: Implement AI model loading and base image generation

### Tasks
- [x] Implement model loader (Stable Diffusion XL)
- [x] Configure CUDA/GPU settings
- [x] Add model caching and optimization (fp16, attention slicing)
- [x] Implement pipeline wrapper for generation
- [x] Add prompt processing
- [x] Implement seed control for reproducibility

### Testing
- [x] Test model downloads and caching
- [x] Generate test image with simple prompt "a mountain landscape"
- [x] Verify CUDA usage and VRAM consumption (~6.57GB)
- [x] Test seed reproducibility (same seed = same image)
- [x] Test negative prompts
- [x] Measure generation time (~5-6 seconds for 30 steps)
- [ ] Test different guidance scales (5, 7.5, 10)

### Notes
- VRAM usage: 6.57 GB with model loaded (fp16)
- Generation speed: ~5-6 it/s on RTX 4070 Ti, ~5-6 sec for 30 steps at 1024x576
- Seed reproducibility confirmed (identical output with same seed)
- Base resolution auto-calculated from target aspect ratio (e.g. 4K → 1024x576)

### Success Criteria
- Model loads successfully on GPU
- Can generate 1024x1024 images
- VRAM usage within expected range
- Consistent output with same seed
- Generation completes without errors

---

## ✅ CHECKPOINT 4: AI Upscaling Integration
**Goal**: Implement Real-ESRGAN upscaling pipeline

### Tasks
- [x] Integrate Real-ESRGAN upscaler
- [x] Implement automatic upscale factor calculation
- [x] Add upscale model loading and caching
- [x] Implement tiled upscaling for large images
- [x] Add aspect ratio preservation

### Testing
- [x] Test upscaling 1024x576 → 3840x2160 (4K)
- [x] Test upscaling with different aspect ratios (iPhone 2796x1290)
- [x] Verify upscaled image quality
- [x] Measure upscaling time
- [x] Test VRAM usage during upscaling (peak 4.94 GB)
- [x] Test upscale factors: 4x with Lanczos resize to exact target
- [ ] Compare quality with/without upscaling

### Notes
- Upscaler VRAM: 0.03 GB loaded, 4.94 GB peak during upscaling
- Model weights auto-downloaded on first use (63.9 MB)
- Uses 4x native upscale then Lanczos resize to exact target resolution

### Success Criteria
- Upscaler loads and runs on GPU
- Can upscale to 4K and beyond
- Quality improvement visible
- No artifacts or distortions
- Memory efficient (works within 12GB VRAM)

---

## ✅ CHECKPOINT 5: Two-Stage Pipeline Orchestration
**Goal**: Combine generation and upscaling into unified pipeline

### Tasks
- [x] Add two-stage pipeline orchestration (orchestrator.py)
- [x] Implement resolution calculation logic (reuses presets.py)
- [x] Add pipeline state management (PipelineStage enum + PipelineResult dataclass)
- [x] Implement memory optimization (sequential loading: unload SDXL before loading upscaler)
- [x] Add error handling and recovery (OOM catch, finally block for cleanup)

### Testing
- [x] Test full pipeline: prompt → base image → upscaled output
- [x] Test with iPhone 14 Pro Max preset (2796x1290) — base 1024x472 → 2796x1290
- [x] Test with 4K preset (3840x2160) — base 1024x576 → 3840x2160
- [ ] Test with 5K preset (5120x2880)
- [ ] Measure total VRAM usage (should be <8GB peak)
- [ ] Measure end-to-end time
- [ ] Test error recovery (out of memory, invalid inputs)

### Notes
- Orchestrator in `src/generator/orchestrator.py` with `run_pipeline()` as main entry point
- PipelineStage enum tracks: idle → loading_model → generating → unloading_model → loading_upscaler → upscaling → saving → complete
- PipelineResult dataclass holds base_image, upscaled_image, output_path, resolutions, seed, error
- Progress callback `(stage, fraction, message)` for UI integration
- SDXL unloaded before upscaler loaded to minimize peak VRAM
- OOM errors caught with user-friendly message; finally block always frees GPU memory
- All 3 tests passed: no-upscaling, 4K with upscaling, iPhone preset

### Success Criteria
- Pipeline runs end-to-end successfully
- All presets work correctly
- VRAM usage optimized
- Error handling works
- Output quality meets expectations

---

## ✅ CHECKPOINT 6: Streamlit UI - Basic Interface
**Goal**: Create functional Streamlit interface with core features

### Tasks
- [x] Create main app layout (wide layout, sidebar + main area)
- [x] Add resolution selection (preset dropdown + custom width/height with validation)
- [x] Add prompt input fields (text area + negative prompt input)
- [x] Implement generation button (primary, full-width)
- [x] Add progress indicator (progress bar + status text mapped across pipeline stages)
- [x] Create image display area (full-width + base vs upscaled comparison expander)
- [x] Add download functionality (PNG download button)

### Testing
- [x] Streamlit app launches successfully
- [x] All 15 device presets appear in dropdown
- [x] Custom resolution mode with validation works
- [x] Syntax and import checks pass

### Notes
- Sidebar: resolution mode toggle, device presets (4K default), settings (steps, guidance, seed, upscaling)
- Progress bar maps pipeline stages to weighted ranges for smooth UX
- Base vs upscaled comparison in expander
- Run with: `poetry run streamlit run src/app.py`

### Success Criteria
- UI is intuitive and responsive
- All controls work correctly
- Progress feedback is clear
- Generated images display properly
- Downloads work in browser

---

## ✅ CHECKPOINT 7: Advanced Features & Settings
**Goal**: Add advanced controls and settings sidebar

### Tasks
- [x] Add advanced settings sidebar (steps, guidance scale, seed)
- [x] Add upscaling settings (enable/disable, model selection)
- [x] Implement image comparison (base vs upscaled)
- [x] Add file management utilities
- [x] Implement save functionality with metadata
- [x] Add generation history tracking

### Notes
- Sidebar: steps slider (10-100), guidance scale (1.0-20.0), seed input, upscaling toggle + model dropdown
- Upscaler models: RealESRGAN_x4plus (4x, best quality), RealESRGAN_x2plus (2x, faster)
- JSON sidecar metadata saved alongside each PNG (prompt, seed, steps, guidance, resolution, timestamp)
- Generation history displayed as 3-column grid at bottom of main page with expandable details
- Image comparison in expander showing base vs upscaled side-by-side
- File utils: save/load metadata, get_generation_history(), delete_output()
- Image utils: create_thumbnail(), get_image_info()

### Testing
- [x] Test all sidebar controls
- [ ] Test disabling upscaling (base image only)
- [ ] Test random vs fixed seed
- [ ] Test different inference steps (20, 30, 50)
- [ ] Test guidance scale range (5-15)
- [x] Verify metadata saved with images
- [x] Test image comparison view

### Success Criteria
- All advanced settings functional
- Settings affect output as expected
- Image metadata preserved
- History tracking works
- UI remains intuitive

---

## ✅ CHECKPOINT 8: Gallery & Output Management
**Goal**: Implement gallery view and output management

### Tasks
- [x] Image processing utilities (resize, save, format conversion)
- [x] Gallery view of previous generations
- [x] Implement file naming convention
- [x] Add batch export functionality
- [x] Add image metadata display
- [x] Implement gallery search/filter

### Notes
- image_utils.py: resize_image(), convert_format(), image_to_bytes(), create_thumbnail(), get_image_info()
- file_utils.py: filter_history() (by prompt keyword + resolution), batch_export_zip() (ZIP download)
- Gallery: 3-column grid with search bar, resolution dropdown filter, pagination (9 per page)
- Each gallery item has expandable details (JSON metadata) and delete button
- Batch export downloads all filtered results as a ZIP file
- File naming: YYYYMMDD_HHMMSS_sanitized-prompt_WxH.png (unique, descriptive)

### Testing
- [x] Test gallery displays all generated images
- [x] Test file naming is unique and descriptive
- [x] Test metadata retrieval from saved images
- [x] Test gallery pagination/scrolling
- [x] Verify images load quickly in gallery
- [x] Test filtering by resolution/date

### Success Criteria
- Gallery loads efficiently
- Can view previous generations
- Metadata accessible
- File management robust
- No duplicate filenames

---

## ✅ CHECKPOINT 9: Performance Optimization & Testing
**Goal**: Optimize performance and test all features

### Tasks
- [ ] Test CUDA functionality with RTX 4070Ti
- [ ] Test base generation + upscaling pipeline
- [ ] Optimize memory usage for high-resolution generation
- [ ] Test all device presets with upscaling
- [ ] Performance tuning (inference speed)
- [ ] Verify upscaling quality at different resolutions
- [ ] Add memory cleanup between generations

### Testing
- [ ] Full test suite with all device presets
- [ ] Stress test: Generate 10 images consecutively
- [ ] Memory leak test: Monitor VRAM over time
- [ ] Performance benchmark: Measure avg generation time
- [ ] Quality test: Visual inspection of all resolutions
- [ ] Edge cases: Very large resolutions, unusual aspect ratios
- [ ] Error handling: Invalid prompts, OOM scenarios

### Success Criteria
- All presets generate successfully
- No memory leaks
- Performance within expected ranges
- Quality consistent across resolutions
- Graceful error handling

---

## ✅ CHECKPOINT 10: Documentation & Final Polish
**Goal**: Complete documentation and finalize project

### Tasks
- [ ] Create comprehensive README.md
- [ ] Add usage instructions
- [ ] Document configuration options
- [ ] Add troubleshooting guide
- [ ] Create example prompts guide
- [ ] Add requirements.txt for reference
- [ ] Final code cleanup and comments

### Testing
- [ ] Follow README from scratch (fresh install)
- [ ] Verify all examples work
- [ ] Test troubleshooting steps
- [ ] Review all documentation for clarity
- [ ] Final user acceptance testing

### Success Criteria
- README is clear and complete
- Setup instructions work
- Examples are helpful
- Code is well-documented
- Project is production-ready

## Device Presets to Implement

### Mobile Devices
- iPhone 14 Pro Max: 2796x1290
- iPhone 14 Pro: 2556x1179
- iPhone 14: 2532x1170
- iPhone SE: 1334x750
- Samsung Galaxy S23 Ultra: 3088x1440

### Tablets
- iPad Pro 12.9": 2732x2048
- iPad Pro 11": 2388x1668
- iPad Air: 2360x1640

### Laptops/Desktops
- 13" MacBook Pro: 2560x1600
- 14" MacBook Pro: 3024x1964
- 16" MacBook Pro: 3456x2234
- 1080p (Full HD): 1920x1080
- 1440p (2K): 2560x1440
- 4K (UHD): 3840x2160
- 5K: 5120x2880

## Model Selection

### Base Generation Model
**Recommended**: FLUX.1-dev or Stable Diffusion XL
- Generates base images at 1024x1024
- Good CUDA optimization
- Community support and documentation

### Upscaling Model
**Real-ESRGAN x4plus**
- 4x upscaling capability (1024→4096)
- CUDA optimized for fast inference
- Excellent quality for general images
- Pre-trained weights readily available

## Performance Considerations
- Use fp16 precision for memory efficiency
- Enable attention slicing for high resolutions
- Implement tiled VAE for very large images
- Cache model weights for faster subsequent generations
- Real-ESRGAN runs on GPU for fast upscaling (2-5 seconds)
- Sequential pipeline: generation → upscaling (minimizes VRAM peaks)

## Estimated GPU Requirements
- **Base Generation**: 4-6GB VRAM (1024x1024 with SDXL)
- **Upscaling**: 2-4GB VRAM (Real-ESRGAN)
- **Total Peak VRAM**: 6-8GB (models loaded sequentially)
- RTX 4070Ti (12GB VRAM) has plenty of headroom
- **Generation time**:
  - Base image: 15-30 seconds (depending on steps)
  - Upscaling: 2-5 seconds (1024→4096)
  - **Total**: ~20-35 seconds for 4K wallpaper

## Pipeline Workflow

```
User Input (Prompt + Target Resolution)
         ↓
[Calculate Base Resolution & Upscale Factor]
         ↓
[Stage 1: Generate Base Image (1024x1024)]
         ↓
[Stage 2: AI Upscale to Target Resolution]
         ↓
[Save & Display Final Wallpaper]
```

**Example**: 4K (3840x2160) generation
1. Generate 1024x1024 base image
2. Calculate aspect ratio adjustment (16:9)
3. Generate 1920x1080 base (matches aspect ratio)
4. Upscale 2x with Real-ESRGAN → 3840x2160

## Future Enhancements (Optional)
- Batch generation
- Style presets (photorealistic, artistic, abstract, etc.)
- Multiple upscaling models (RealESRGAN-anime, BSRGAN, etc.)
- LoRA model support
- Image-to-image generation
- Inpainting for aspect ratio adjustment
- Face enhancement for portrait wallpapers
