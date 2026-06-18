"use client";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { cmsService } from "@/services/cms-service";

const STATUSES = ["pending","created","picked_up","in_transit","out_for_delivery","delivered","failed","returned","cancelled"];

type ShippingZone = { id: string; name: string; countries: string[]; cities: string[]; baseFee: number; perKgFee: number; estimatedDaysMin: number; estimatedDaysMax: number; active: boolean };
type ShippingConfig = { provider: string; currency: string; demoMode: boolean; origin: { country: string; city: string }; zones: ShippingZone[]; serviceLevels: string[] };
const emptyConfig: ShippingConfig = { provider: "diaexpress", currency: "XOF", demoMode: false, origin: { country: "Burkina Faso", city: "Ouagadougou" }, zones: [], serviceLevels: ["standard"] };
const money = (amount: number, currency = "XOF") => new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount || 0));
const csv = (items: string[]) => items.join(", ");
const split = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export default function Page() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [config, setConfig] = useState<ShippingConfig>(emptyConfig);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [shipmentRows, shippingConfig] = await Promise.all([cmsService.getShipping({ status, tracking }), cmsService.getShippingConfig()]);
      setShipments(shipmentRows);
      setConfig((shippingConfig as any).data ?? shippingConfig ?? emptyConfig);
    } catch (e) { setError(e instanceof Error ? e.message : "Chargement DiaExpress impossible"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => shipments.filter((item) => (!status || item.status === status) && (!tracking || String(item.trackingNumber || "").toLowerCase().includes(tracking.toLowerCase()))), [shipments, status, tracking]);
  const sync = async (shipment: any) => { try { await cmsService.syncShipment(String(shipment.order?._id ?? shipment.order)); setMessage("Tracking synchronisé."); await load(); } catch(e) { setError(e instanceof Error ? e.message : "Synchronisation impossible"); } };
  const saveConfig = async () => { setSaving(true); setError(""); try { const saved = await cmsService.updateShippingConfig(config); setConfig((saved as any).data ?? saved as any); setMessage("Configuration livraison enregistrée."); } catch(e) { setError(e instanceof Error ? e.message : "Configuration invalide"); } finally { setSaving(false); } };
  const patchZone = (index: number, patch: Partial<ShippingZone>) => setConfig((current) => ({ ...current, zones: current.zones.map((zone, i) => i === index ? { ...zone, ...patch } : zone) }));

  return <div className="space-y-6"><PageHeader title="Livraison / DiaExpress" subtitle="Zones, tarifs, délais, expéditions, tracking et synchronisation provider" />
    {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded-xl bg-blue-500/10 p-3 text-sm text-blue-800">{message}</p>}
    <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"><div className="flex flex-wrap items-end gap-3"><label className="text-sm">Statut<select className="mt-1 block rounded-md border p-2" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">Tous</option>{STATUSES.map((item)=><option key={item} value={item}>{item}</option>)}</select></label><label className="text-sm">Tracking<input className="mt-1 block rounded-md border p-2" value={tracking} onChange={(e)=>setTracking(e.target.value)} placeholder="DX-..." /></label><button onClick={load} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">Filtrer</button></div></section>
    <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"><h2 className="font-semibold">Expéditions</h2>{loading ? <p className="mt-4 text-sm text-zinc-500">Chargement des expéditions…</p> : filtered.length ? <div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-zinc-500"><th className="py-2">Tracking</th><th>Commande</th><th>Statut</th><th>Livraison estimée</th><th>Dernier événement</th><th>Actions</th></tr></thead><tbody>{filtered.map((item)=><tr key={item._id} className="border-t"><td className="py-3 font-mono">{item.trackingNumber ?? "—"}</td><td>{item.order?._id ?? item.order}</td><td><StatusBadge status={item.status ?? "pending"} /></td><td>{item.estimatedDeliveryDate ? new Date(item.estimatedDeliveryDate).toLocaleDateString("fr-FR") : "—"}</td><td>{item.history?.at(-1)?.message ?? item.history?.at(-1)?.status ?? "—"}</td><td className="space-x-2"><button onClick={()=>setSelected(item)} className="rounded border px-3 py-1">Détail</button><button onClick={()=>sync(item)} className="rounded border px-3 py-1">Synchroniser</button></td></tr>)}</tbody></table></div> : <p className="mt-4 rounded-xl border p-4 text-sm text-zinc-500">Aucune expédition ne correspond aux filtres.</p>}</section>
    {selected && <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"><div className="flex justify-between"><h2 className="font-semibold">Détail expédition {selected.trackingNumber}</h2><button onClick={()=>setSelected(null)} className="rounded border px-3 py-1 text-sm">Fermer</button></div><div className="mt-3 grid gap-4 text-sm md:grid-cols-3"><p>Provider : {selected.provider}</p><p>Statut : {selected.status}</p><p>Provider ID : {selected.providerShipmentId ?? "—"}</p></div><div className="mt-4 space-y-2 text-sm"><h3 className="font-medium">Timeline</h3>{selected.history?.length ? selected.history.map((event: any, index: number)=><p key={index}>• {event.occurredAt ? new Date(event.occurredAt).toLocaleString("fr-FR") : "—"} — {event.status} — {event.message ?? event.source}</p>) : <p className="text-zinc-500">Aucun événement.</p>}</div></section>}
    <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"><h2 className="font-semibold">Configuration zones, tarifs et délais</h2><div className="mt-4 grid gap-3 md:grid-cols-4"><label className="text-sm">Provider<input className="mt-1 w-full rounded border p-2" value="diaexpress" disabled /></label><label className="text-sm">Devise<input className="mt-1 w-full rounded border p-2" value={config.currency} onChange={(e)=>setConfig({...config,currency:e.target.value.toUpperCase()})} /></label><label className="text-sm">Pays origine<input className="mt-1 w-full rounded border p-2" value={config.origin.country} onChange={(e)=>setConfig({...config,origin:{...config.origin,country:e.target.value}})} /></label><label className="text-sm">Ville origine<input className="mt-1 w-full rounded border p-2" value={config.origin.city} onChange={(e)=>setConfig({...config,origin:{...config.origin,city:e.target.value}})} /></label></div><div className="mt-4 space-y-3">{config.zones.map((zone, index)=><div key={`${zone.id}-${index}`} className="rounded-xl border p-3"><div className="grid gap-3 md:grid-cols-6"><input className="rounded border p-2" value={zone.name} onChange={(e)=>patchZone(index,{name:e.target.value})} placeholder="Zone" /><input className="rounded border p-2" value={csv(zone.countries)} onChange={(e)=>patchZone(index,{countries:split(e.target.value)})} placeholder="Pays" /><input className="rounded border p-2" value={csv(zone.cities)} onChange={(e)=>patchZone(index,{cities:split(e.target.value)})} placeholder="Villes" /><input className="rounded border p-2" type="number" value={zone.baseFee} onChange={(e)=>patchZone(index,{baseFee:Number(e.target.value)})} placeholder="Tarif base" /><input className="rounded border p-2" type="number" value={zone.perKgFee} onChange={(e)=>patchZone(index,{perKgFee:Number(e.target.value)})} placeholder="Par kg" /><input className="rounded border p-2" value={`${zone.estimatedDaysMin}-${zone.estimatedDaysMax} jours · ${money(zone.baseFee, config.currency)}`} disabled /></div></div>)}</div><div className="mt-4 flex gap-2"><button onClick={()=>setConfig({...config,zones:[...config.zones,{id:`zone-${Date.now()}`,name:"Nouvelle zone",countries:[],cities:[],baseFee:0,perKgFee:0,estimatedDaysMin:1,estimatedDaysMax:3,active:true}]})} className="rounded border px-4 py-2 text-sm">Ajouter une zone</button><button disabled={saving} onClick={saveConfig} className="rounded bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? "Enregistrement…" : "Enregistrer"}</button></div></section>
  </div>;
}
