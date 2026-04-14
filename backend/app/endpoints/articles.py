from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.guards import require_auth, require_article, require_published_article
from app.database.connection import get_db
from app.database.models import Article, User
from app.schemas.articles import (
    ArticleCreate,
    ArticleDetailResponse,
    ArticlePublicResponse,
    ArticleResponse,
    ArticleUpdate,
)

# ── Public router (no auth) ───────────────────────────────────────────────────
public_router = APIRouter(prefix="/api/articles", tags=["Public Articles"])

# ── Admin router (JWT required on every route via router-level dependency) ────
admin_router = APIRouter(
    prefix="/api/admin/articles",
    tags=["Admin Articles"],
    dependencies=[Depends(require_auth)],   # ← applied to ALL routes below
)


# =============================================================================
# Public endpoints
# =============================================================================

@public_router.get("", response_model=List[ArticlePublicResponse])
def list_published_articles(db: Session = Depends(get_db)):
    """Return all published articles for the public homepage."""
    return (
        db.query(Article)
        .filter(Article.status == "published")
        .order_by(Article.created_at.desc())
        .all()
    )


@public_router.get("/{article_id}", response_model=ArticleDetailResponse)
def get_article(
    article: Article = Depends(require_published_article),
    db: Session = Depends(get_db),
):
    """Return a single published article and increment view_count."""
    article.view_count += 1
    db.commit()
    db.refresh(article)
    return article


@public_router.post("/{article_id}/like", response_model=ArticleDetailResponse)
def like_article(
    article: Article = Depends(require_published_article),
    db: Session = Depends(get_db),
):
    """Increment like_count for a published article."""
    article.like_count += 1
    db.commit()
    db.refresh(article)
    return article


# =============================================================================
# Admin endpoints  (all protected by router-level require_auth)
# =============================================================================

@admin_router.get("", response_model=List[ArticleResponse])
def admin_list_articles(db: Session = Depends(get_db)):
    """List all articles (any status)."""
    return db.query(Article).order_by(Article.created_at.desc()).all()


@admin_router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
def admin_create_article(body: ArticleCreate, db: Session = Depends(get_db)):
    """Create a new article."""
    article = Article(**body.model_dump())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@admin_router.get("/{article_id}", response_model=ArticleResponse)
def admin_get_article(article: Article = Depends(require_article)):
    """Get a single article by id (any status)."""
    return article


@admin_router.put("/{article_id}", response_model=ArticleResponse)
def admin_update_article(
    body: ArticleUpdate,
    article: Article = Depends(require_article),
    db: Session = Depends(get_db),
):
    """Update an article."""
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(article, field, value)
    db.commit()
    db.refresh(article)
    return article


@admin_router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_article(
    article: Article = Depends(require_article),
    db: Session = Depends(get_db),
):
    """Delete an article."""
    db.delete(article)
    db.commit()
