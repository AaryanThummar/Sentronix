import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, steg, dashboard, defense, app_defense, ai, red_team
from app.models import user, vulnerability, steg as steg_model

# Initialize DB tables (for SQLite ease of use without Alembic initially)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(steg.router, prefix="/api/v1/steg", tags=["Steganography"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(defense.router, prefix="/api/v1/defense", tags=["Defensive Tools"])
app.include_router(app_defense.router, prefix="/api/v1/defense/app", tags=["App & Code-Level Defense"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI Remediation"])
app.include_router(red_team.router, prefix="/api/v1/red-team", tags=["Red Team Simulator"])

# Mount compiled frontend SPA if available (for single-port, zero-docker execution)
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(dist_dir):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path in ["docs", "openapi.json", "redoc"]:
            return {"error": "Not Found"}
        target_file = os.path.join(dist_dir, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

