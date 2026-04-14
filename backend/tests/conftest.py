"""
Shared fixtures for all tests.

Uses SQLite in-memory database — no Docker / PostgreSQL required.
Each test gets a clean database via function-scoped fixtures.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.auth import hash_password
from app.database.connection import Base, get_db
from app.database.models import Article, User
from app.main import app

# ── In-memory SQLite engine (shared connection so tables persist across threads) ─

SQLITE_URL = "sqlite://"

engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def reset_db():
    """Re-create all tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Yield a fresh DB session for direct data setup in tests."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db):
    """
    TestClient with the DB dependency overridden to use SQLite.
    Also resets login_attempts so rate-limit state doesn't bleed between tests.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    app.state.login_attempts = {}

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


# ── Seed helpers ───────────────────────────────────────────────────────────────

@pytest.fixture()
def admin_user(db):
    """Create and return an admin user."""
    user = User(username="admin", hashed_password=hash_password("admin1234"))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def auth_token(client, admin_user):
    """Log in as admin and return the JWT access token."""
    res = client.post("/api/auth/login", json={"username": "admin", "password": "admin1234"})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.fixture()
def auth_headers(auth_token):
    """Return Authorization header dict ready for requests."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture()
def published_article(db):
    """Create and return a published article."""
    article = Article(
        title="Published Article",
        summary="A summary",
        content="Published content",
        status="published",
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@pytest.fixture()
def draft_article(db):
    """Create and return a draft article."""
    article = Article(
        title="Draft Article",
        summary="Draft summary",
        content="Draft content",
        status="draft",
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article
