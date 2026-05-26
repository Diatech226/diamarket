export function StatusBadge({ status }: { status: string }) {
  const tone = status === "active" || status === "paid" ? "bg-emerald-100 text-emerald-700" : status === "inactive" || status === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${tone}`}>{status}</span>;
}
