import Link from "next/link";
import type { ReactNode } from "react";

export function ExportButton({ href = "#", label = "Export CSV" }: { href?: string; label?: string }) {
  return <a href={href} className="admin-btn admin-btn-secondary text-xs" download>{label}</a>;
}

export function AnalyticsCard({ label, value, trend, tone = "olive" }: { label: string; value: ReactNode; trend?: string; tone?: "olive" | "blue" | "amber" | "rose" }) {
  const tones = { olive: "bg-olive-50 text-olive-800 dark:bg-olive-950/30 dark:text-olive-200", blue: "bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200", amber: "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200", rose: "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200" };
  return <article className="admin-card"><p className="text-sm text-zinc-500">{label}</p><div className="mt-3 flex items-end justify-between gap-3"><strong className="text-2xl text-zinc-950 dark:text-white">{value}</strong>{trend && <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{trend}</span>}</div></article>;
}

export function MetricGrid({ children }: { children: ReactNode }) { return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>; }

export function AnalyticsChart({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="admin-card"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><span className="text-xs text-zinc-500">Vue mensuelle</span></div><div className="flex h-56 items-end gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">{data.map((item) => <div key={item.label} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-xl bg-olive-600/80" style={{ height: `${Math.max((item.value / max) * 100, 6)}%` }} title={`${item.label}: ${item.value}`} /><span className="text-[10px] text-zinc-500">{item.label}</span></div>)}</div></section>;
}

export function AuditLogTable({ rows, onSelect }: { rows: any[]; onSelect?: (row: any) => void }) {
  return <div className="admin-card overflow-hidden p-0"><table className="w-full text-sm"><thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900"><tr><th className="p-3">Date</th><th className="p-3">Utilisateur</th><th className="p-3">Action</th><th className="p-3">Module</th><th className="p-3">IP / Device</th></tr></thead><tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">{rows.map((row) => <tr key={row._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900" onClick={() => onSelect?.(row)}><td className="p-3">{row.createdAt ? new Date(row.createdAt).toLocaleString("fr-FR") : "—"}</td><td className="p-3">{typeof row.actorId === "object" ? row.actorId?.name || row.actorId?.email : "Système"}</td><td className="p-3"><span className="rounded-full bg-olive-50 px-2 py-1 text-xs font-semibold text-olive-800 dark:bg-olive-950/30 dark:text-olive-200">{row.action}</span></td><td className="p-3">{row.resource}</td><td className="p-3 text-zinc-500">{row.metadata?.ip || row.metadata?.device || "Non disponible"}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="p-6 text-sm text-zinc-500">Aucun événement ne correspond aux filtres.</p>}</div>;
}

export function AuditLogDetailDrawer({ log }: { log?: any }) { if (!log) return null; return <aside className="admin-card fixed bottom-4 right-4 top-4 z-30 w-[min(440px,calc(100vw-2rem))] overflow-auto shadow-2xl"><h2 className="text-xl font-bold">Détail événement</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-zinc-500">Action</dt><dd className="font-semibold">{log.action}</dd></div><div><dt className="text-zinc-500">Module</dt><dd>{log.resource}</dd></div><div><dt className="text-zinc-500">Ancienne / nouvelle valeur</dt><dd><pre className="mt-2 rounded-xl bg-zinc-950 p-3 text-xs text-white">{JSON.stringify(log.metadata ?? {}, null, 2)}</pre></dd></div></dl></aside>; }

export function UserRoleEditor({ roles }: { roles: string[] }) { return <div className="admin-card"><h2 className="text-lg font-semibold">Éditeur de rôle</h2><div className="mt-4 grid gap-2 md:grid-cols-2">{roles.map((role) => <label key={role} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"><span className="font-medium">{role}</span><input type="radio" name="role" /></label>)}</div><button className="admin-btn admin-btn-primary mt-4">Créer admin / manager / support</button></div>; }

export function PermissionMatrix({ permissions, roles }: { permissions: string[]; roles: string[] }) { return <div className="admin-card overflow-auto"><h2 className="mb-4 text-lg font-semibold">Matrice de permissions</h2><table className="w-full text-sm"><thead><tr><th className="p-2 text-left">Permission</th>{roles.map((role) => <th key={role} className="p-2 text-left">{role}</th>)}</tr></thead><tbody>{permissions.map((permission) => <tr key={permission} className="border-t border-zinc-100 dark:border-zinc-800"><td className="p-2 font-medium">{permission}</td>{roles.map((role) => <td key={role} className="p-2"><input type="checkbox" defaultChecked={["super_admin", "admin"].includes(role)} /></td>)}</tr>)}</tbody></table></div>; }

export function SettingsSection({ title, children, href }: { title: string; children: ReactNode; href?: string }) { return <section className="admin-card"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2>{href && <Link href={href} className="text-sm font-semibold text-olive-700">Ouvrir</Link>}</div>{children}</section>; }

export function FeatureFlagToggle({ label, enabled = false }: { label: string; enabled?: boolean }) { return <label className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"><span>{label}</span><input type="checkbox" defaultChecked={enabled} /></label>; }
export function IntegrationStatusCard({ name, status }: { name: string; status: "ok" | "warning" | "down" }) { const cls = status === "ok" ? "bg-emerald-50 text-emerald-700" : status === "warning" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"; return <article className="admin-card"><p className="text-sm text-zinc-500">{name}</p><strong className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm ${cls}`}>{status}</strong></article>; }
export function SystemHealthCard({ label, value }: { label: string; value: ReactNode }) { return <article className="admin-card"><p className="text-sm text-zinc-500">{label}</p><strong className="mt-2 block text-xl">{value}</strong></article>; }
