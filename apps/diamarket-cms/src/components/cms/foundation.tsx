import type { ReactNode } from "react";
export function DashboardCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) { return <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm"><p className="text-sm text-zinc-500">{label}</p><div className="mt-2 text-3xl font-semibold text-zinc-950">{value}</div>{hint && <p className="mt-2 text-xs text-emerald-700">{hint}</p>}</div>; }
export function StatusBadge({ status }: { status?: string }) { const s = status ?? "draft"; return <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold capitalize text-zinc-700">{s.replaceAll("_", " ")}</span>; }
export function SearchFilterBar({ placeholder = "Rechercher" }: { placeholder?: string }) { return <div className="flex flex-col gap-3 rounded-3xl border bg-white p-4 sm:flex-row"><input className="flex-1 rounded-2xl border px-4 py-2" placeholder={placeholder} /><button className="rounded-2xl bg-zinc-950 px-4 py-2 text-white">Filtrer</button></div>; }
export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) { return <div className="overflow-hidden rounded-3xl border bg-white"><table className="w-full text-sm"><thead className="bg-zinc-50 text-left text-zinc-500"><tr>{columns.map(c => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}</tr></thead><tbody>{rows.length ? rows.map((r,i) => <tr key={i} className="border-t">{r.map((c,j) => <td key={j} className="px-4 py-3">{c}</td>)}</tr>) : <tr><td className="px-4 py-10 text-center text-zinc-500" colSpan={columns.length}>Aucune donnée</td></tr>}</tbody></table></div>; }
export function FormSection({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-3xl border bg-white p-5"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 grid gap-4">{children}</div></section>; }
export function EmptyState({ title, description }: { title: string; description?: string }) { return <div className="rounded-3xl border border-dashed bg-white p-10 text-center"><h3 className="font-semibold">{title}</h3>{description && <p className="mt-2 text-sm text-zinc-500">{description}</p>}</div>; }
export function LoadingState() { return <div className="rounded-3xl border bg-white p-8 text-zinc-500">Chargement…</div>; }
export function ErrorState({ message }: { message: string }) { return <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">{message}</div>; }
export function ConfirmDialog({ title }: { title: string }) { return <div className="rounded-3xl border bg-white p-5"><strong>{title}</strong><p className="mt-2 text-sm text-zinc-500">Confirmation requise avant action destructive.</p></div>; }
export const MediaPicker = EmptyState;
export const BrandColorPicker = EmptyState;
export const FontPicker = EmptyState;
export const StorefrontPreview = EmptyState;
export const BlockEditor = EmptyState;
export const VendorProfileCard = EmptyState;
export const PayoutSummary = DashboardCard;
export const AuditLogTimeline = EmptyState;
