from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.config.settings import OUTPUT_DIR, ensure_directories
from api.routes import config, gallery, generate

ensure_directories()

app = FastAPI(title="AI Wallpaper Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory=str(OUTPUT_DIR)), name="images")

app.include_router(config.router, prefix="/api/config", tags=["config"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["gallery"])
app.include_router(generate.router, tags=["generate"])
