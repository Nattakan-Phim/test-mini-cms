import { GetServerSideProps } from "next";
import Link from "next/link";
import PublicLayout from "@/components/layouts/PublicLayout";
import { Article } from "@/services/articles/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Props {
  articles: Article[];
}

export default function HomePage({ articles }: Props) {
  return (
    <PublicLayout>
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-1.5 tracking-tight">
          Latest Articles
        </h1>
        <p className="text-slate-500">
          {articles.length > 0
            ? `${articles.length} article${articles.length > 1 ? "s" : ""} published`
            : "No articles yet"}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-24 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-medium text-slate-500">No articles published yet.</p>
          <p className="text-sm mt-1">Check back later!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.id}`}
              className="group block bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1 truncate">
                    {article.title}
                  </h2>
                  {article.summary && (
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span>
                      {new Date(article.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-slate-200">·</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {article.view_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      {article.like_count.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-slate-300 group-hover:text-indigo-400 transition-colors mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PublicLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch(`${API_URL}/api/articles`);
    const articles: Article[] = res.ok ? await res.json() : [];
    return { props: { articles } };
  } catch {
    return { props: { articles: [] } };
  }
};
