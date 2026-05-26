"use client";

import { useMemo, useState } from "react";

type TableRow = {
  id: string;
  cells: React.ReactNode[];
  searchableText?: string;
};

export function DataTable({
  headers,
  rows,
  searchPlaceholder = "Rechercher...",
  enableBulkActions = true,
}: {
  headers: string[];
  rows: TableRow[] | React.ReactNode[][];
  searchPlaceholder?: string;
  enableBulkActions?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const pageSize = 8;

  const normalizedRows: TableRow[] = useMemo(() => rows.map((row, idx) => Array.isArray(row) ? ({ id: String(idx), cells: row, searchableText: row.map((c) => String(c)).join(" ") }) : row), [rows]);

  const filteredRows = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return normalizedRows.filter((row) => {
      const text = (row.searchableText ?? "").toLowerCase();
      return normalized ? text.includes(normalized) : true;
    });
  }, [query, normalizedRows]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const exportCsv = () => {
    const csvRows = [headers.join(",")];
    filteredRows.forEach((row) => {
      csvRows.push(row.cells.map((cell) => String(cell).replace(/,/g, " ")).join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "diamarket-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!normalizedRows.length) return <div className="rounded-2xl border border-dashed p-10 text-sm text-zinc-500">Aucune donnée disponible.</div>;

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={searchPlaceholder} className="w-full max-w-sm rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm outline-none ring-olive-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900" />
        <div className="flex gap-2">
          {enableBulkActions && <button className="rounded-lg border px-3 py-2 text-xs">Bulk archive ({selected.length})</button>}
          <button onClick={exportCsv} className="rounded-lg bg-olive-700 px-3 py-2 text-xs text-white">Export CSV</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead><tr>{enableBulkActions && <th className="px-3 py-2" />} {headers.map((h) => <th key={h} className="px-4 py-2 text-left font-medium text-zinc-500">{h}</th>)}</tr></thead>
          <tbody>{currentRows.map((row) => <tr key={row.id} className="border-t border-zinc-100 dark:border-zinc-800">{enableBulkActions && <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} /></td>}{row.cells.map((c, j) => <td key={j} className="px-4 py-3">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <p>{filteredRows.length} résultats</p>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</button>
          <span>Page {page}/{pageCount}</span>
          <button disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Suivant</button>
        </div>
      </div>
    </div>
  );
}
