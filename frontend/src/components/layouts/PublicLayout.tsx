import Link from "next/link";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-indigo-600 transition-colors">
            <span className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
              M
            </span>
            <span className="text-sm tracking-tight">Mini CMS</span>
          </Link>
          <Link
            href="/login"
            className="text-xs font-medium text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-all"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-slate-400">
          <span>Mini CMS</span>
          <span>&copy; {new Date().getFullYear()}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
