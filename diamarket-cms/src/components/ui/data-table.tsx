export function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <div className="rounded-lg border border-dashed p-6 text-sm text-zinc-500">Aucune donnée disponible.</div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <table className="min-w-full text-sm">
        <thead><tr>{headers.map((h) => <th key={h} className="px-4 py-3 text-left text-zinc-500">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">{row.map((c, j) => <td key={j} className="px-4 py-3">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
