export interface Article {
  id: number;
  title: string;
  summary: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
}

export interface ArticleDetail {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}
