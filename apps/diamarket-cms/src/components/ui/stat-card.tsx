export function StatCard({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"><p className="text-sm text-zinc-500">{label}</p><p className="text-2xl font-bold text-olive-700">{value}</p></div>;
}
