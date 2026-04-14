import { request } from "../client";
import type { AdminArticle, ArticlePayload } from "./types";

export function adminGetArticles(token: string) {
  return request<AdminArticle[]>("/api/admin/articles", {}, token);
}

export function adminGetArticle(id: number, token: string) {
  return request<AdminArticle>(`/api/admin/articles/${id}`, {}, token);
}

export function adminCreateArticle(data: ArticlePayload, token: string) {
  return request<AdminArticle>("/api/admin/articles", {
    method: "POST",
    body: JSON.stringify(data),
  }, token);
}

export function adminUpdateArticle(id: number, data: Partial<ArticlePayload>, token: string) {
  return request<AdminArticle>(`/api/admin/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, token);
}

export function adminDeleteArticle(id: number, token: string) {
  return request<void>(`/api/admin/articles/${id}`, { method: "DELETE" }, token);
}
