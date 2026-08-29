from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, steg, dashboard, defense, app_defense
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

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
