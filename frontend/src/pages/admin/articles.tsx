import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { AdminArticle, ArticlePayload } from "@/services/admin/types";
import {
  adminCreateArticle,
  adminDeleteArticle,
  adminGetArticle,
  adminGetArticles,
  adminUpdateArticle,
} from "@/services/admin/adminService";

type Mode = "list" | "create" | "edit";
const emptyForm: ArticlePayload = { title: "", summary: "", content: "", status: "draft" };

interface Props {
  initialArticles: AdminArticle[];
  accessToken: string;
}

export default function AdminArticlesPage({ initialArticles, accessToken }: Props) {
  const [articles, setArticles] = useState<AdminArticle[]>(initialArticles);
  const [mode, setMode] = useState<Mode>("list");
  const [form, setForm] = useState<ArticlePayload>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft").length;

  async function fetchArticles() {
    const data = await adminGetArticles(accessToken);
    setArticles(data);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditId(null);
    setError("");
    setMode("create");
  }

  async function openEdit(id: number) {
    try {
      const article = await adminGetArticle(id, accessToken);
      setForm({
        title: article.title,
        summary: article.summary ?? "",
        content: article.content,
        status: article.status,
      });
      setEditId(id);
      setError("");
      setMode("edit");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load article");
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "create") await adminCreateArticle(form, accessToken);
      else if (mode === "edit" && editId !== null) await adminUpdateArticle(editId, form, accessToken);
      await fetchArticles();
      setMode("list");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setLoading(true);
    try {
      await adminDeleteArticle(id, accessToken);
      await fetchArticles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete article");
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  }

  // ── Form view ────────────────────────────────────────────────────────────────
  if (mode === "create" || mode === "edit") {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setMode("list")}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {mode === "create" ? "New Article" : "Edit Article"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === "create" ? "Fill in the details below to create a new article." : "Update the fields you want to change."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g. Getting Started with Next.js"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Summary
                  <span className="ml-1.5 text-xs font-normal text-slate-400">optional</span>
                </label>
                <input
                  type="text"
                  value={form.summary ?? ""}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="A short description shown on the listing page"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  rows={12}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y font-mono"
                  placeholder="Write your article content here..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="flex gap-2.5">
                  {(["draft", "published"] as const).map((s) => (
                    <label
                      key={s}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm font-medium select-none ${
                        form.status === s
                          ? s === "published"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm"
                            : "border-amber-300 bg-amber-50 text-amber-700 shadow-sm"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name="status"
                        value={s}
                        checked={form.status === s}
                        onChange={() => setForm({ ...form, status: s })}
                      />
                      <span className={`w-2 h-2 rounded-full ${
                        form.status === s
                          ? s === "published" ? "bg-emerald-500" : "bg-amber-500"
                          : "bg-slate-300"
                      }`} />
                      {s === "published" ? "Published" : "Draft"}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-6 mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Footer actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2.5">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : mode === "create" ? "Create Article" : "Save Changes"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setMode("list")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Articles</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your content</p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: articles.length, color: "text-slate-900" },
          { label: "Published", value: published, color: "text-emerald-600" },
          { label: "Drafts", value: drafts, color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
            <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Likes</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4 max-w-xs">
                  <p className="font-medium text-slate-900 truncate">{a.title}</p>
                  {a.summary && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{a.summary}</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={a.status} />
                </td>
                <td className="px-5 py-4 text-right text-slate-500 tabular-nums">{a.view_count.toLocaleString()}</td>
                <td className="px-5 py-4 text-right text-slate-500 tabular-nums">{a.like_count.toLocaleString()}</td>
                <td className="px-5 py-4 text-right text-xs text-slate-400 tabular-nums">
                  {new Date(a.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a.id)}>
                      Edit
                    </Button>
                    {deleteConfirm === a.id ? (
                      <>
                        <Button variant="danger" size="sm" disabled={loading} onClick={() => handleDelete(a.id)}>
                          Confirm
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(a.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-500">No articles yet</p>
                  <p className="text-xs text-slate-400 mt-1 mb-3">Create your first article to get started.</p>
                  <Button size="sm" onClick={openCreate}>New Article</Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (!session) return { redirect: { destination: "/login", permanent: false } };

  const accessToken = (session as any).accessToken as string;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/articles`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const initialArticles: AdminArticle[] = res.ok ? await res.json() : [];
    return { props: { initialArticles, accessToken } };
  } catch {
    return { props: { initialArticles: [], accessToken } };
  }
};
