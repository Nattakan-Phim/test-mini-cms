from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine
from app.endpoints import auth
from app.endpoints.articles import admin_router, public_router

# Create all tables on startup (fallback — primary method is Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mini CMS API", version="1.0.0")

# Shared in-process store for rate limiting
app.state.login_attempts: dict = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(public_router)
app.include_router(admin_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
