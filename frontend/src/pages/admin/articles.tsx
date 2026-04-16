import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/layouts/AdminLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Textarea, ErrorAlert } from "@/components/ui/InputField";
import { articleSchema, ArticleFormValues } from "@/lib/schemas";
import { AdminArticle } from "@/services/admin/types";
import {
  adminCreateArticle,
  adminDeleteArticle,
  adminGetArticle,
  adminGetArticles,
  adminUpdateArticle,
} from "@/services/admin/adminService";

type Mode = "list" | "create" | "edit";

interface Props {
  initialArticles: AdminArticle[];
  accessToken: string;
}

export default function AdminArticlesPage({ initialArticles, accessToken }: Props) {
  const [articles, setArticles] = useState<AdminArticle[]>(initialArticles);
  const [mode, setMode] = useState<Mode>("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [serverError, setServerError] = useState("");
  const [listError, setListError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft").length;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: { title: "", summary: "", content: "", status: "draft" },
  });

  const currentStatus = watch("status");

  async function fetchArticles() {
    const data = await adminGetArticles(accessToken);
    setArticles(data);
  }

  function openCreate() {
    reset({ title: "", summary: "", content: "", status: "draft" });
    setEditId(null);
    setServerError("");
    setMode("create");
  }

  async function openEdit(id: number) {
    try {
      const article = await adminGetArticle(id, accessToken);
      reset({
        title: article.title,
        summary: article.summary ?? "",
        content: article.content,
        status: article.status,
      });
      setEditId(id);
      setServerError("");
      setMode("edit");
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : "Failed to load article");
    }
  }

  function handleCancel() {
    reset();
    setServerError("");
    setMode("list");
  }

  async function onSubmit(values: ArticleFormValues) {
    setServerError("");
    try {
      if (mode === "create") {
        await adminCreateArticle(values, accessToken);
      } else if (mode === "edit" && editId !== null) {
        await adminUpdateArticle(editId, values, accessToken);
      }
      await fetchArticles();
      setMode("list");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Failed to save article");
    }
  }

  async function handleDelete(id: number) {
    setDeleteLoading(true);
    try {
      await adminDeleteArticle(id, accessToken);
      await fetchArticles();
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : "Failed to delete article");
    } finally {
      setDeleteLoading(false);
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
              onClick={handleCancel}
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
                {mode === "create"
                  ? "Fill in the details below to create a new article."
                  : "Update the fields you want to change."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-5">
              <Input
                label="Title"
                required
                placeholder="e.g. Getting Started with Next.js"
                error={errors.title?.message}
                {...register("title")}
              />

              <Input
                label="Summary"
                hint="(optional)"
                placeholder="A short description shown on the listing page"
                error={errors.summary?.message}
                {...register("summary")}
              />

              <Textarea
                label="Content"
                required
                rows={12}
                placeholder="Write your article content here..."
                error={errors.content?.message}
                className="font-mono"
                {...register("content")}
              />

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="flex gap-2.5">
                  {(["draft", "published"] as const).map((s) => (
                    <label
                      key={s}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm font-medium select-none ${
                        currentStatus === s
                          ? s === "published"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm"
                            : "border-amber-300 bg-amber-50 text-amber-700 shadow-sm"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value={s}
                        checked={currentStatus === s}
                        onChange={() => setValue("status", s)}
                      />
                      <span
                        className={`w-2 h-2 rounded-full ${
                          currentStatus === s
                            ? s === "published"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                            : "bg-slate-300"
                        }`}
                      />
                      {s === "published" ? "Published" : "Draft"}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {serverError && (
              <div className="mx-6 mb-4">
                <ErrorAlert message={serverError} />
              </div>
            )}

            {/* Footer actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2.5">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Article" : "Save Changes"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
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

      {listError && (
        <div className="mb-4">
          <ErrorAlert message={listError} />
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
                        <Button variant="danger" size="sm" disabled={deleteLoading} onClick={() => handleDelete(a.id)}>
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
