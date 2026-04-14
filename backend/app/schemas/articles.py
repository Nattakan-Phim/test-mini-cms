from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, field_validator


class ArticleCreate(BaseModel):
    title: str
    summary: Optional[str] = None
    content: str
    status: Literal["draft", "published"] = "draft"

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("title must not be empty")
        return v

    @field_validator("content")
    @classmethod
    def content_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("content must not be empty")
        return v


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    status: Optional[Literal["draft", "published"]] = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("title must not be empty")
        return v

    @field_validator("content")
    @classmethod
    def content_must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("content must not be empty")
        return v


class ArticleResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str]
    content: str
    status: str
    view_count: int
    like_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ArticlePublicResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str]
    view_count: int
    like_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ArticleDetailResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str]
    content: str
    view_count: int
    like_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
