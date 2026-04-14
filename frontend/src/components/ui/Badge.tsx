interface BadgeProps {
  variant: "published" | "draft";
}

export default function Badge({ variant }: BadgeProps) {
  const styles = {
    published: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
    draft: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {variant}
    </span>
  );
}
