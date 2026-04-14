import { GetServerSideProps } from "next";
import { useState } from "react";
import Link from "next/link";
import PublicLayout from "@/components/layouts/PublicLayout";
import { ArticleDetail } from "@/services/articles/types";
import { likeArticle } from "@/services/articles/articleService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  article: ArticleDetail | null;
}

export default function ArticleDetailPage({ article }: Props) {
  const [likeCount, setLikeCount] = useState(article?.like_count ?? 0);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!article) {
    return (
      <PublicLayout>
        <div className="text-center py-32">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-700 mb-2">Article not found</h1>
          <p className="text-sm text-slate-400 mb-5">This article may have been removed or unpublished.</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to homepage
          </Link>
        </div>
      </PublicLayout>
    );
  }

  async function handleLike() {
    if (liked || liking) return;
    setLiking(true);
    try {
      const updated = await likeArticle(article!.id);
      setLikeCount(updated.like_count);
      setLiked(true);
    } finally {
      setLiking(false);
    }
  }

  return (
    <PublicLayout>
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All articles
      </Link>

      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 leading-snug mb-3">
            {article.title}
          </h1>
          {article.summary && (
            <p className="text-base text-slate-500 leading-relaxed mb-5">
              {article.summary}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(article.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-slate-200">·</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.view_count.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {likeCount.toLocaleString()} likes
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="text-slate-700 leading-relaxed text-[15px] whitespace-pre-wrap">
            {article.content}
          </div>
        </div>

        {/* Like action */}
        <div className="px-8 pb-8">
          <div className="border-t border-slate-100 pt-6 flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={liked || liking}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all disabled:cursor-not-allowed ${
                liked
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform ${liked ? "scale-110" : ""}`}
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {liked ? `Liked · ${likeCount.toLocaleString()}` : `Like · ${likeCount.toLocaleString()}`}
            </button>
            {liked && (
              <span className="text-sm text-slate-400">Thanks for reading!</span>
            )}
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = Number(params?.id);
  if (isNaN(id)) return { props: { article: null } };
  try {
    const res = await fetch(`${API_URL}/api/articles/${id}`);
    if (!res.ok) return { props: { article: null } };
    const article: ArticleDetail = await res.json();
    return { props: { article } };
  } catch {
    return { props: { article: null } };
  }
};
