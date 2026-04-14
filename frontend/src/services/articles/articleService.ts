import { request } from "../client";
import type { Article, ArticleDetail } from "./types";

export function getPublishedArticles() {
  return request<Article[]>("/api/articles");
}

export function getArticle(id: number) {
  return request<ArticleDetail>(`/api/articles/${id}`);
}

export function likeArticle(id: number) {
  return request<ArticleDetail>(`/api/articles/${id}/like`, { method: "POST" });
}
