export interface AdminArticle {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  status: "draft" | "published";
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface ArticlePayload {
  title: string;
  summary?: string;
  content: string;
  status: "draft" | "published";
}
