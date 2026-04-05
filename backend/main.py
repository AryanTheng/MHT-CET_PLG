from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.database import get_client, close_db
from app.routers import auth, students, colleges, export, ref_id


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verify DB connection
    try:
        get_client().admin.command("ping")
        print("✅  MongoDB connected")
    except Exception as e:
        print(f"❌  MongoDB connection failed: {e}")
    yield
    # Shutdown
    close_db()
    print("MongoDB connection closed")


app = FastAPI(
    title="MHTCET Preference List Generator API",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(colleges.router)
app.include_router(export.router)
app.include_router(ref_id.router)


@app.get("/health")
def health():
    return {"status": "ok"}
