"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

const tabs = ["Général", "Paiements", "Livraison", "Notifications"];

export default function SettingsPage() {
  const [tab, setTab] = useState(tabs[0]);
  const [saved, setSaved] = useState(false);
  return <div className="space-y-6"><PageHeader title="Paramètres" subtitle="Settings organisés par onglets avec sauvegarde dynamique" /><div className="flex gap-2">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-sm ${tab === t ? "bg-olive-700 text-white" : "bg-zinc-100 dark:bg-zinc-900"}`}>{t}</button>)}</div><div className="rounded-2xl border p-4 dark:border-zinc-800"><p className="mb-4 text-sm text-zinc-500">Section active: {tab}</p><div className="grid gap-3 md:grid-cols-2"><input className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Nom boutique" /><input className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Email support" /></div><button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1400); }} className="mt-4 rounded-xl bg-olive-700 px-4 py-2 text-white">Sauvegarder</button>{saved && <p className="mt-2 text-sm text-emerald-600">✅ Paramètres sauvegardés</p>}</div></div>;
}
