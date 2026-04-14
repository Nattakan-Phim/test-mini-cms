from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.auth import create_access_token, verify_password
from app.database.connection import get_db
from app.database.models import User
from app.schemas.auth import LoginRequest, Token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

MAX_ATTEMPTS = 5
WINDOW_SECONDS = 60


def _get_store(request: Request) -> dict:
    """Return the app-level failed-attempts store (shared within process)."""
    return request.app.state.login_attempts


def _check_rate_limit(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    store = _get_store(request)
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(seconds=WINDOW_SECONDS)

    store[ip] = [t for t in store.get(ip, []) if t > window_start]

    if len(store[ip]) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Try again in {WINDOW_SECONDS} seconds.",
        )


def _record_failure(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    store = _get_store(request)
    store.setdefault(ip, []).append(datetime.now(timezone.utc))


def _clear_failures(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    _get_store(request).pop(ip, None)


@router.post("/login", response_model=Token)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Authenticate and return a JWT access token.
    Rate limited: max 5 failed attempts per 60 seconds per IP.
    """
    _check_rate_limit(request)

    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        _record_failure(request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    _clear_failures(request)
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
