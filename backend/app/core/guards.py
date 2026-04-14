"""
Guards (FastAPI dependencies) for endpoint protection.

Usage:
  - require_auth   → verifies JWT, returns current User
  - public_only    → ensures the article is published before proceeding

Apply at router level to protect all routes in a group:
  router = APIRouter(dependencies=[Depends(require_auth)])

Or per-endpoint:
  def my_view(..., _: User = Depends(require_auth)):
"""

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.connection import get_db
from app.database.models import Article, User

# ── Token extraction ──────────────────────────────────────────────────────────

def _extract_token(request: Request) -> str:
    """Pull Bearer token from Authorization header."""
    auth: str = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth[len("Bearer "):]


# ── Auth guard ────────────────────────────────────────────────────────────────

def require_auth(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """
    Guard: JWT must be valid and user must exist in DB.
    Raises 401 on any failure.
    """
    token = _extract_token(request)
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str | None = payload.get("sub")
        if not username:
            raise exc
    except JWTError:
        raise exc

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise exc
    return user


# ── Published article guard ───────────────────────────────────────────────────

def require_published_article(
    article_id: int,
    db: Session = Depends(get_db),
) -> Article:
    """
    Guard: article must exist and be published.
    Raises 404 if not found or not published.
    """
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.status == "published",
    ).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


# ── Admin article guard ───────────────────────────────────────────────────────

def require_article(
    article_id: int,
    db: Session = Depends(get_db),
) -> Article:
    """
    Guard: article must exist (any status). For admin use.
    Raises 404 if not found.
    """
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article
