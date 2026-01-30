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
- [ ] Initialize Poetry project with pyproject.toml
- [ ] Set up project structure (directories and files)
- [ ] Create .gitignore file
- [ ] Add core dependencies:
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
- [ ] Configure Poetry for Python 3.10+

### Testing
- [ ] Verify Poetry installation and dependencies
- [ ] Test CUDA availability with `torch.cuda.is_available()`
- [ ] Verify all imports work correctly
- [ ] Check VRAM detection with `torch.cuda.get_device_properties(0)`

### Success Criteria
- All dependencies installed without errors
- CUDA detected and accessible
- Project structure created
- Can run `poetry install` successfully

---

## ✅ CHECKPOINT 2: Configuration & Presets
**Goal**: Implement configuration system with device presets

### Tasks
- [ ] Create device presets configuration (iPhone, MacBook, etc.)
- [ ] Create application settings (model paths, output directory, etc.)
- [ ] Add validation for resolution inputs
- [ ] Implement preset resolution calculator
- [ ] Create utils for file management

### Testing
- [ ] Test all device presets return correct resolutions
- [ ] Test custom resolution input validation
- [ ] Test aspect ratio calculations
- [ ] Verify output directory creation
- [ ] Test preset selection logic

### Success Criteria
- All presets defined and accessible
- Resolution validation works correctly
- Settings can be loaded and saved
- File paths resolve correctly

---

## ✅ CHECKPOINT 3: Base Image Generation (SDXL/Flux)
**Goal**: Implement AI model loading and base image generation

### Tasks
- [ ] Implement model loader (Stable Diffusion XL)
- [ ] Configure CUDA/GPU settings
- [ ] Add model caching and optimization (fp16, attention slicing)
- [ ] Implement pipeline wrapper for generation
- [ ] Add prompt processing
- [ ] Implement seed control for reproducibility

### Testing
- [ ] Test model downloads and caching
- [ ] Generate test image with simple prompt "a mountain landscape"
- [ ] Verify CUDA usage and VRAM consumption (<6GB)
- [ ] Test seed reproducibility (same seed = same image)
- [ ] Test negative prompts
- [ ] Measure generation time (should be 15-30 seconds)
- [ ] Test different guidance scales (5, 7.5, 10)

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
- [ ] Integrate Real-ESRGAN upscaler
- [ ] Implement automatic upscale factor calculation
- [ ] Add upscale model loading and caching
- [ ] Implement tiled upscaling for large images
- [ ] Add aspect ratio preservation

### Testing
- [ ] Test upscaling 1024x1024 → 4096x4096
- [ ] Test upscaling with different aspect ratios
- [ ] Verify upscaled image quality
- [ ] Measure upscaling time (should be 2-5 seconds)
- [ ] Test VRAM usage during upscaling (<4GB)
- [ ] Test upscale factors: 2x, 4x
- [ ] Compare quality with/without upscaling

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
- [ ] Add two-stage pipeline orchestration
- [ ] Implement resolution calculation logic
- [ ] Add pipeline state management
- [ ] Implement memory optimization (sequential loading)
- [ ] Add error handling and recovery

### Testing
- [ ] Test full pipeline: prompt → base image → upscaled output
- [ ] Test with iPhone 14 Pro Max preset (2796x1290)
- [ ] Test with 4K preset (3840x2160)
- [ ] Test with 5K preset (5120x2880)
- [ ] Measure total VRAM usage (should be <8GB peak)
- [ ] Measure end-to-end time
- [ ] Test error recovery (out of memory, invalid inputs)

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
- [ ] Create main app layout
- [ ] Add resolution selection (presets + custom input)
- [ ] Add prompt input fields (positive and negative)
- [ ] Implement generation button
- [ ] Add progress indicator for both stages
- [ ] Create image display area
- [ ] Add basic download functionality

### Testing
- [ ] Test UI responsiveness
- [ ] Test preset selection dropdown
- [ ] Test custom resolution inputs
- [ ] Test prompt text areas
- [ ] Verify generation button triggers pipeline
- [ ] Test progress indicators show correctly
- [ ] Test image display after generation
- [ ] Test download button functionality

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
- [ ] Add advanced settings sidebar (steps, guidance scale, seed)
- [ ] Add upscaling settings (enable/disable, model selection)
- [ ] Implement image comparison (base vs upscaled)
- [ ] Add file management utilities
- [ ] Implement save functionality with metadata
- [ ] Add generation history tracking

### Testing
- [ ] Test all sidebar controls
- [ ] Test disabling upscaling (base image only)
- [ ] Test random vs fixed seed
- [ ] Test different inference steps (20, 30, 50)
- [ ] Test guidance scale range (5-15)
- [ ] Verify metadata saved with images
- [ ] Test image comparison view

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
- [ ] Image processing utilities (resize, save, format conversion)
- [ ] Gallery view of previous generations
- [ ] Implement file naming convention
- [ ] Add batch export functionality
- [ ] Add image metadata display
- [ ] Implement gallery search/filter

### Testing
- [ ] Test gallery displays all generated images
- [ ] Test file naming is unique and descriptive
- [ ] Test metadata retrieval from saved images
- [ ] Test gallery pagination/scrolling
- [ ] Verify images load quickly in gallery
- [ ] Test filtering by resolution/date

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
