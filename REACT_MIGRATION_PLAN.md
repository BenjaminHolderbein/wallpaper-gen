# React Migration Plan - Streamlit to React + FastAPI

## Migration Overview
Migrating the AI Wallpaper Generator from Streamlit to a modern React + FastAPI architecture while preserving all existing Python backend logic.

**Backend**: Keep all existing `src/` code intact, add FastAPI wrapper layer
**Frontend**: Replace Streamlit UI with React + Vite + TypeScript + Tailwind (dark theme)
**Real-time**: WebSocket for generation progress streaming

---

## ✅ CHECKPOINT 1: Environment & Dependencies Setup
**Goal**: Update project dependencies for FastAPI and prepare environment

### Tasks
- [x] Add FastAPI dependencies to `pyproject.toml`
  - fastapi
  - uvicorn[standard]
  - websockets
- [x] Run `poetry lock` to update lock file
- [x] Run `poetry install --no-root` to install new dependencies
- [x] Verify installations (fastapi 0.128.0, uvicorn 0.40.0, websockets 16.0)

### Testing
- [x] Confirm Poetry can resolve dependencies without conflicts
- [x] Verify FastAPI and uvicorn are available in Poetry environment

### Success Criteria
- All dependencies installed successfully
- No version conflicts with existing packages (torch, diffusers, etc.)
- Ready to create FastAPI application

---

## ✅ CHECKPOINT 2: FastAPI Backend Layer - Structure & Schemas
**Goal**: Create FastAPI application structure and data schemas

### Tasks
- [x] Create `api/` directory structure
  - `api/main.py` - FastAPI app initialization
  - `api/schemas.py` - Pydantic models for request/response
  - `api/routes/` - Route modules
  - `api/__init__.py` - Package initialization
- [x] Define Pydantic schemas in `api/schemas.py`
  - GenerateRequest (prompt, resolution, settings)
  - ProgressUpdate (stage, fraction, message)
  - GenerateResponse (image URLs, metadata)
  - GalleryItem, GalleryResponse
  - ConfigResponse (presets, models)
- [x] Set up FastAPI app in `api/main.py`
  - CORS middleware configuration
  - Static file serving for `/images/`
  - Router registration placeholder

### Testing
- [x] Verify file structure created correctly
- [x] Check schema definitions are valid Pydantic models
- [x] Confirm FastAPI app can be imported

### Success Criteria
- Clean API structure in place
- Schemas match existing backend data structures
- FastAPI app initializes without errors

---

## ✅ CHECKPOINT 3: FastAPI Backend Layer - REST Endpoints
**Goal**: Implement REST API endpoints for config and gallery

### Tasks
- [x] Create `api/routes/config.py`
  - `GET /api/config/presets` - Return device presets from `src/config/presets.py`
  - `GET /api/config/models` - Return available upscaler models
  - `GET /api/config/validate` - Validate custom resolution (query params: w, h)
- [x] Create `api/routes/gallery.py`
  - `GET /api/gallery` - Get generation history with filters (search, resolution, pagination)
  - `GET /api/gallery/{filename}/metadata` - Get image metadata JSON
  - `DELETE /api/gallery/{filename}` - Delete image + sidecar JSON
  - `GET /api/gallery/export` - Batch export as ZIP (query param: filenames)
- [x] Register routes in `api/main.py`
- [x] Configure static file serving for `/images/{filename}` from `outputs/`

### Testing
- [x] Verify endpoints are registered in FastAPI app
- [ ] Start uvicorn: `poetry run uvicorn api.main:app --reload --port 8000`
- [ ] Test each endpoint with curl or browser:
  - `GET http://localhost:8000/api/config/presets`
  - `GET http://localhost:8000/api/gallery`
  - `GET http://localhost:8000/images/{existing-file}.png`

### Success Criteria
- All REST endpoints return expected data
- Static image serving works from `outputs/` directory
- CORS allows frontend to connect
- Error handling returns appropriate status codes

---

## ✅ CHECKPOINT 4: FastAPI Backend Layer - WebSocket Generation
**Goal**: Implement WebSocket endpoint for real-time generation with progress streaming

### Tasks
- [x] Create `api/routes/generate.py`
  - `WS /ws/generate` - WebSocket endpoint for generation
  - Accept GenerateRequest JSON from client
  - Create progress callback that queues updates
  - Call `run_pipeline()` from `src/generator/orchestrator.py`
  - Stream progress updates as JSON messages
  - Send final result with image paths
  - Handle errors and send error messages
- [x] Implement thread-safe progress callback
  - Use asyncio queue to bridge sync callback → async websocket
  - Map PipelineStage enum to progress updates
- [x] Register WebSocket route in `api/main.py`

### Testing
- [ ] Start FastAPI server
- [ ] Test WebSocket connection with client tool (e.g., wscat)
- [ ] Send generation request JSON
- [ ] Verify progress updates stream correctly
- [ ] Confirm final result includes image paths
- [ ] Test error handling (invalid prompt, OOM)

### Success Criteria
- WebSocket accepts connections and JSON requests
- Progress updates stream in real-time during generation
- Final result includes base and upscaled image paths
- Errors are caught and sent to client
- Connection closes cleanly after generation

---

## ✅ CHECKPOINT 5: React Frontend - Project Scaffolding
**Goal**: Set up React project with TypeScript, Vite, and Tailwind

### Tasks
- [x] Create React app with Vite: `npm create vite@latest frontend -- --template react-ts`
- [x] Install dependencies: `cd frontend && npm install`
- [x] Install Tailwind: `npm install -D tailwindcss @tailwindcss/vite`
- [x] Configure Tailwind in `vite.config.ts`
- [x] Set up Vite proxy for API and images
  - `/api` → `http://localhost:8000`
  - `/images` → `http://localhost:8000`
- [x] Create `frontend/src/index.css` with Tailwind directives and dark theme styles
- [x] Update `frontend/index.html` with dark theme baseline
- [x] Create `frontend/src/main.tsx` entry point

### Testing
- [x] Run `npm run dev` to start dev server
- [x] Verify Tailwind styles are applied
- [x] Check dark theme renders correctly
- [ ] Test proxy configuration (API requests forward to backend)

### Success Criteria
- React app runs on development server
- Tailwind CSS working with dark theme
- Vite proxy configured for API calls
- Clean build with no TypeScript errors

---

## ✅ CHECKPOINT 6: React Frontend - Types & API Client
**Goal**: Define TypeScript types and create API client utilities

### Tasks
- [x] Create `frontend/src/types/index.ts`
  - Device presets interface
  - Generation settings interface
  - Gallery item interface
  - Progress update interface
  - API response types
- [x] Create `frontend/src/api/client.ts`
  - REST API functions (fetchPresets, fetchGallery, deleteImage, exportImages)
  - Error handling utilities
  - Base URL configuration

### Testing
- [x] Verify TypeScript compilation
- [x] Check type definitions match backend schemas
- [ ] Test API client functions with mock data

### Success Criteria
- All types defined and exported
- API client functions properly typed
- No TypeScript errors
- Types match backend Pydantic schemas

---

## ✅ CHECKPOINT 7: React Frontend - Custom Hooks
**Goal**: Create React hooks for generation and gallery state management

### Tasks
- [x] Create `frontend/src/hooks/useGenerate.ts`
  - WebSocket connection management
  - Send generation request
  - Receive progress updates
  - Handle generation results
  - Error handling
  - Connection lifecycle (connect, disconnect, reconnect)
- [x] Create `frontend/src/hooks/useGallery.ts`
  - Fetch gallery items with filters
  - Pagination state
  - Delete image
  - Export images as ZIP
  - Refresh gallery after generation

### Testing
- [ ] Test useGenerate hook with mock WebSocket
- [ ] Test useGallery hook with mock API responses
- [ ] Verify state updates correctly
- [ ] Check error handling paths

### Success Criteria
- Hooks manage state correctly
- WebSocket connection lifecycle handled
- Gallery filters and pagination work
- Error states properly managed
- TypeScript types all correct

---

## ✅ CHECKPOINT 8: React Frontend - UI Components (Part 1: Generation)
**Goal**: Build components for the generation workflow

### Tasks
- [x] Create `frontend/src/components/Sidebar.tsx`
  - Resolution mode toggle (preset vs custom)
  - Device preset dropdown (15 presets)
  - Custom width/height inputs with validation
  - Settings sliders (steps, guidance scale)
  - Seed input (random or fixed)
  - Upscaling toggle and model selection
  - Tooltips for settings
- [x] Create `frontend/src/components/PromptForm.tsx`
  - Prompt textarea
  - Negative prompt input
  - Generate button (disabled during generation)
  - Form validation
- [x] Create `frontend/src/components/ProgressBar.tsx`
  - Progress bar with percentage
  - Current stage message
  - Animated during generation
  - Maps pipeline stages to progress ranges
- [x] Create `frontend/src/components/ResultDisplay.tsx`
  - Display generated image (full width)
  - Show generation metadata (resolution, seed, time)
  - Download button
  - Error display if generation fails

### Testing
- [ ] Test each component in isolation
- [ ] Verify form validation works
- [ ] Check progress bar animation
- [ ] Test responsive layout
- [ ] Verify dark theme styling

### Success Criteria
- All generation UI components render correctly
- Form inputs validated properly
- Progress updates smoothly
- Dark theme consistent across components
- Responsive design works

---

## ✅ CHECKPOINT 9: React Frontend - UI Components (Part 2: Gallery)
**Goal**: Build components for gallery and image viewing

### Tasks
- [x] Create `frontend/src/components/ImageComparison.tsx`
  - Side-by-side base vs upscaled view
  - Expandable section
  - Responsive layout
- [x] Create `frontend/src/components/GalleryFilters.tsx`
  - Search input (filter by prompt)
  - Resolution dropdown filter
  - Clear filters button
- [x] Create `frontend/src/components/GalleryCard.tsx`
  - Image thumbnail
  - Metadata preview (prompt, resolution, date)
  - Expandable details (full metadata JSON)
  - Delete button
  - Click to view full size
- [x] Create `frontend/src/components/Gallery.tsx`
  - 3-column grid layout
  - Load and display gallery items
  - Empty state (no images)
  - Loading state
- [x] Create `frontend/src/components/Pagination.tsx`
  - Page navigation (prev/next)
  - Page numbers
  - Items per page selector
- [x] Create `frontend/src/components/ImageViewer.tsx`
  - Modal for full-size image view
  - Close button and ESC key handler
  - Navigation between images
  - Download button

### Testing
- [ ] Test gallery grid layout with varying items
- [ ] Verify filters update gallery correctly
- [ ] Test pagination navigation
- [ ] Check image viewer modal behavior
- [ ] Test delete confirmation and gallery refresh

### Success Criteria
- Gallery displays all images correctly
- Filters and pagination work smoothly
- Image viewer provides good UX
- Delete functionality works
- Dark theme consistent

---

## 🔄 CHECKPOINT 10: React Frontend - Main App Integration
**Goal**: Wire all components together in App.tsx and complete the UI

### Tasks
- [ ] Create/update `frontend/src/App.tsx`
  - Main layout: sidebar + content area
  - Import and connect all components
  - Wire useGenerate hook to Sidebar + PromptForm + ProgressBar + ResultDisplay
  - Wire useGallery hook to Gallery + GalleryFilters + Pagination
  - Connect ImageViewer modal for gallery item clicks
  - Handle state coordination (refresh gallery after generation)
  - Error boundary for graceful error handling
- [ ] Implement layout responsiveness
  - Sidebar collapses on mobile
  - Gallery grid adapts to screen size
  - Touch-friendly controls
- [ ] Add loading states and skeleton screens
- [ ] Polish animations and transitions

### Testing
- [ ] Test full generation workflow end-to-end
- [ ] Test gallery filtering and pagination
- [ ] Verify image viewer works from gallery
- [ ] Test responsive design on various screen sizes
- [ ] Test error scenarios (network errors, generation failures)

### Success Criteria
- Complete app functions end-to-end
- All components properly integrated
- State management works correctly
- Responsive design on all screen sizes
- Smooth user experience

---

## 🔄 CHECKPOINT 11: Integration Testing & Bug Fixes
**Goal**: Run both servers together and fix integration issues

### Tasks
- [ ] Start FastAPI backend: `poetry run uvicorn api.main:app --reload --port 8000`
- [ ] Start React frontend: `cd frontend && npm run dev`
- [ ] Test full generation workflow
  - Enter prompt and settings
  - Click generate
  - Verify WebSocket connects
  - Confirm progress updates stream
  - Check generated image displays
  - Test download button
- [ ] Test gallery features
  - Load gallery items
  - Filter by search term
  - Filter by resolution
  - Navigate pages
  - View image in modal
  - Delete image
  - Export multiple images
- [ ] Fix integration bugs
  - CORS issues
  - WebSocket connection URL (handle dev server proxy)
  - Image URL construction (`/images/{filename}`)
  - File path mismatches (filename vs full path)
  - Progress callback thread safety
  - Error handling and user feedback
- [ ] Performance testing
  - Test with multiple consecutive generations
  - Verify no memory leaks
  - Check gallery loads efficiently with many images

### Testing
- [ ] Generate wallpaper for each device preset
- [ ] Test custom resolutions
- [ ] Test with/without upscaling
- [ ] Test error cases (invalid prompts, OOM)
- [ ] Test on different browsers
- [ ] Test concurrent generations (should queue or error)

### Success Criteria
- Backend and frontend communicate correctly
- No CORS or proxy issues
- WebSocket streaming works reliably
- All gallery operations work
- Images load and display correctly
- Performance acceptable for local use
- Errors handled gracefully with user feedback

---

## 🔄 CHECKPOINT 12: Feature Parity & Polish
**Goal**: Ensure React UI has complete feature parity with Streamlit version

### Features to Verify
- [ ] All 15 device presets working
- [ ] Custom resolution with validation
- [ ] Generation parameters (steps, guidance, seed)
- [ ] Negative prompts
- [ ] Upscaling toggle and model selection
- [ ] Progress tracking with stage indicators
- [ ] Base vs upscaled image comparison
- [ ] Image metadata display
- [ ] Gallery with search and filters
- [ ] Pagination
- [ ] Image download (individual)
- [ ] Batch export (ZIP)
- [ ] Delete images with confirmation

### UI/UX Improvements (beyond Streamlit)
- [ ] Better progress visualization
- [ ] Smooth animations and transitions
- [ ] Keyboard shortcuts (ESC to close modal, etc.)
- [ ] Better mobile responsiveness
- [ ] Image zoom in viewer
- [ ] Copy prompt from gallery item
- [ ] Generation history with stats
- [ ] Settings persistence (localStorage)

### Testing
- [ ] Side-by-side comparison with Streamlit version
- [ ] User acceptance testing
- [ ] Accessibility testing (keyboard navigation, ARIA labels)

### Success Criteria
- All Streamlit features replicated
- UI/UX improved over Streamlit
- No regressions in functionality
- Performance equal or better than Streamlit

---

## 🔄 CHECKPOINT 13: Streamlit Retirement & Documentation
**Goal**: Remove Streamlit dependency and update documentation

### Tasks
- [ ] Verify React app has complete parity
- [ ] Archive `src/app.py` (rename to `src/app_streamlit_legacy.py` or move to `archive/`)
- [ ] Remove Streamlit from `pyproject.toml` dependencies
- [ ] Update `poetry lock` and `poetry install`
- [ ] Update `README.md`
  - Replace Streamlit instructions with React + FastAPI
  - Document new setup process
  - Add architecture diagram
  - Update screenshots (replace Streamlit with React UI)
  - Document API endpoints
  - Add troubleshooting section
- [ ] Create `DEVELOPMENT.md`
  - Local development setup
  - Running backend and frontend separately
  - API documentation
  - Component documentation
  - Contributing guidelines
- [ ] Update `.gitignore`
  - Add `frontend/node_modules`
  - Add `frontend/dist`
  - Add `frontend/.vite`

### Testing
- [ ] Fresh install test (clone repo, follow README)
- [ ] Verify all documentation is accurate
- [ ] Test that removed Streamlit doesn't break anything

### Success Criteria
- Streamlit completely removed
- Documentation updated and accurate
- Fresh install works following new README
- No broken links or outdated instructions

---

## 🔄 CHECKPOINT 14: Production Readiness & Deployment
**Goal**: Prepare for production deployment (optional, for future)

### Tasks
- [ ] Frontend production build
  - `cd frontend && npm run build`
  - Verify build outputs to `frontend/dist`
  - Test production build locally
- [ ] FastAPI production configuration
  - Environment variables for configuration
  - Static file serving of React build
  - Proper logging configuration
  - Security headers
- [ ] Create startup script
  - Single command to start both backend and frontend
  - Consider using Docker or process manager
- [ ] Add health check endpoints
  - `GET /health` - Backend health
  - `GET /api/health` - API health
- [ ] Performance optimization
  - Enable gzip compression
  - Add caching headers for static assets
  - Optimize image serving
- [ ] Security hardening
  - Validate all inputs
  - Rate limiting on generation endpoint
  - File upload validation (if added)
  - HTTPS configuration guidance

### Testing
- [ ] Test production build
- [ ] Load testing (if deploying publicly)
- [ ] Security audit
- [ ] Browser compatibility testing

### Success Criteria
- Production-ready build available
- Security best practices implemented
- Performance optimized
- Clear deployment documentation

---

## 🔄 CHECKPOINT 15: Final Testing & Migration Complete
**Goal**: Comprehensive testing and project sign-off

### Final Testing Checklist
- [ ] Generate wallpaper for all 15 device presets
- [ ] Test custom resolutions (various aspect ratios)
- [ ] Test all inference steps settings (10, 30, 50, 100)
- [ ] Test guidance scale range (1.0 to 20.0)
- [ ] Test seed reproducibility (same seed = same image)
- [ ] Test with and without upscaling
- [ ] Test both upscaler models (x2plus, x4plus)
- [ ] Generate 10 consecutive images (stress test)
- [ ] Test gallery with 50+ images
- [ ] Test all filters and search
- [ ] Test pagination
- [ ] Test delete functionality
- [ ] Test batch export
- [ ] Test error handling (network errors, invalid inputs)
- [ ] Test browser compatibility (Chrome, Firefox, Safari)
- [ ] Test responsive design (desktop, tablet, mobile)

### Documentation Review
- [ ] README.md complete and accurate
- [ ] Code comments and docstrings added
- [ ] API endpoints documented
- [ ] Component documentation complete
- [ ] Troubleshooting guide helpful

### Performance Benchmarks
- [ ] Base generation time: ~5-6 seconds (1024x576, 30 steps)
- [ ] Upscaling time: ~3-5 seconds (1024→4K)
- [ ] Gallery load time: <1 second (50 images)
- [ ] WebSocket latency: <100ms
- [ ] Frontend initial load: <2 seconds

### Success Criteria
- All tests pass
- Documentation complete
- Performance meets benchmarks
- No known bugs
- Migration complete and signed off

---

## Current Status Summary

### ✅ Completed (Checkpoints 1-9)
- Python dependencies updated (FastAPI, uvicorn, websockets)
- FastAPI backend layer fully created (schemas, routes, WebSocket)
- React project scaffolded with Vite + TypeScript + Tailwind
- All TypeScript types and API client created
- Custom hooks (useGenerate, useGallery) implemented
- All UI components created (Sidebar, PromptForm, ProgressBar, ResultDisplay, Gallery components)

### 🔄 In Progress (Checkpoint 10)
- **Next immediate task**: Wire `App.tsx` to connect all components and hooks
- Main layout and state coordination needed

### ⏳ Remaining (Checkpoints 11-15)
- Integration testing and bug fixes
- Feature parity verification
- Streamlit retirement
- Documentation updates
- Production readiness (optional)
- Final comprehensive testing

---

## Quick Start Commands (After App.tsx Complete)

### Terminal 1 - Backend
```bash
poetry run uvicorn api.main:app --reload --port 8000
```

### Terminal 2 - Frontend
```bash
cd frontend && npm run dev
```

Then open browser to frontend dev server (usually `http://localhost:5173`)

---

## Estimated Time to Complete
- **Checkpoint 10** (App.tsx wiring): 1-2 hours
- **Checkpoint 11** (Integration testing & fixes): 2-4 hours
- **Checkpoint 12** (Feature parity & polish): 2-3 hours
- **Checkpoint 13** (Streamlit retirement & docs): 1-2 hours
- **Checkpoint 14** (Production readiness): 2-4 hours (optional)
- **Checkpoint 15** (Final testing): 1-2 hours

**Total remaining**: ~9-17 hours of focused work

---

## Key Files Reference

### Backend
- `api/main.py` - FastAPI app entry point
- `api/schemas.py` - Pydantic models
- `api/routes/config.py` - Config endpoints
- `api/routes/gallery.py` - Gallery endpoints
- `api/routes/generate.py` - WebSocket generation
- `src/generator/orchestrator.py` - Core pipeline (unchanged)

### Frontend
- `frontend/src/App.tsx` - Main app (NEXT TO COMPLETE)
- `frontend/src/hooks/useGenerate.ts` - Generation state
- `frontend/src/hooks/useGallery.ts` - Gallery state
- `frontend/src/api/client.ts` - API client functions
- `frontend/src/types/index.ts` - TypeScript types
- `frontend/src/components/` - All UI components

### Configuration
- `frontend/vite.config.ts` - Vite config with proxy
- `frontend/src/index.css` - Tailwind + dark theme styles
- `pyproject.toml` - Python dependencies
- `package.json` - Node dependencies
