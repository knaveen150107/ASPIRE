"""ASPIRE — AI Placement & Career Intelligence Platform FastAPI Application."""

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.connection import db_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("aspire")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager handling MongoDB connection pool startup and shutdown."""
    logger.info("Starting ASPIRE API Backend...")
    try:
        # Ping MongoDB Atlas cluster on startup
        if db_manager.ping():
            logger.info("✓ MongoDB Atlas cluster connected and verified.")
    except Exception as exc:
        logger.warning("MongoDB initial ping deferred or failed: %s", exc)

    yield

    logger.info("Shutting down ASPIRE API Backend...")
    db_manager.close()
    logger.info("MongoDB connection pool closed.")


TAGS_METADATA = [
    {"name": "System Health", "description": "Core cluster liveness and service health monitoring."},
    {"name": "Auth", "description": "User registration, authentication, JWT tokens, and identity management."},
    {"name": "Users", "description": "Administrative user management and recruiter account provisioning."},
    {"name": "Students", "description": "Student academic records, verified competencies, and skills."},
    {"name": "Jobs", "description": "Campus placement drives, eligibility evaluations, and applications."},
    {"name": "Assessments", "description": "Diagnostic test scoring and adaptive mock assessments."},
    {"name": "Roadmaps", "description": "Personalized learning curricula and milestones."},
    {"name": "Resumes", "description": "ATS resume builder and version management."},
]

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description=(
        "Production REST API for ASPIRE — AI-Powered Student Placement & Career Intelligence Platform.\n\n"
        "Provides services for user authentication, academic profiles, job discovery, eligibility evaluation, "
        "AI mock tests, skill-gap analysis, personalized learning roadmaps, and resume versioning."
    ),
    lifespan=lifespan,
    openapi_tags=TAGS_METADATA,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["System Health"])
def root_status() -> dict:
    """Root status endpoint."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs",
    }


@app.get("/health", tags=["System Health"])
def health_check() -> dict:
    """System and database connectivity healthcheck endpoint."""
    db_ok = False
    try:
        db_ok = db_manager.ping()
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "database_connected": db_ok,
        "api_version": settings.PROJECT_VERSION,
    }
