"use client";

import { useEffect, useMemo, useState } from "react";
import { MediaPicker } from "@/components/media/MediaPicker";
import { PageHeader } from "@/components/ui/page-header";
import { cmsService } from "@/services/cms-service";
import type { MediaAsset } from "@/types/cms";

type SettingsForm = {
  marketplaceName: string; defaultCurrency: string; defaultCommission: number; defaultLanguage: string; primaryCountry: string;
  logo: string; favicon: string; supportContact: string; supportEmail: string; supportPhone: string; companyAddress: string;
  maintenanceMode: boolean; maintenanceMessage: string; maintenanceImage: string;
  socialLinks: Record<string, string>; seo: { title: string; description: string; keywords: string; openGraphImage: string };
  checkout: Record<string, boolean | string>; shipping: Record<string, boolean | string>; vendors: Record<string, boolean | string | number>; homepage: Record<string, boolean | string>;
};

const defaults: SettingsForm = {
  marketplaceName: "Diamarket", defaultCurrency: "FCFA", defaultCommission: 0.1, defaultLanguage: "fr", primaryCountry: "CI",
  logo: "", favicon: "", supportContact: "", supportEmail: "", supportPhone: "", companyAddress: "",
  maintenanceMode: false, maintenanceMessage: "La marketplace est temporairement en maintenance.", maintenanceImage: "",
  socialLinks: { facebook: "", instagram: "", x: "", linkedin: "", tiktok: "" },
  seo: { title: "Diamarket", description: "Marketplace premium africaine", keywords: "marketplace, ecommerce, afrique", openGraphImage: "" },
  checkout: { guestCheckout: false, diapayEnabled: true, cashOnDeliveryEnabled: true },
  shipping: { diaExpressEnabled: true, freeShippingThreshold: "" },
  vendors: { applicationsOpen: true, autoApproveProducts: false, defaultCommission: 0.1 },
  homepage: { showSlides: true, showFeaturedProducts: true, showCategories: true, heroTitle: "" },
};
const tabs = ["Général", "Branding", "SEO", "Contact", "Checkout", "Livraison", "Vendeurs", "Maintenance", "Réseaux sociaux"];
const asset = (url: string): MediaAsset | undefined => url ? { _id: url, url, name: url } : undefined;
const mediaUrl = (media: MediaAsset | MediaAsset[]) => Array.isArray(media) ? media[0]?.url ?? "" : media.url;

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaults);
  const [lastSaved, setLastSaved] = useState<SettingsForm>(defaults);
  const [tab, setTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const invalid = useMemo(() => !form.marketplaceName.trim() || !form.defaultCurrency.trim() || (form.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail)) || form.defaultCommission < 0 || form.defaultCommission > 1, [form]);
  const patch = (next: Partial<SettingsForm>) => setForm((current) => ({ ...current, ...next }));
  const patchNested = (key: keyof SettingsForm, field: string, value: string | boolean | number) => setForm((current) => ({ ...current, [key]: { ...(current[key] as Record<string, unknown>), [field]: value } }));

  useEffect(() => { (async () => { try { setError(""); const response: any = await cmsService.getSettings(); const next = { ...defaults, ...(response.data ?? {}) }; setForm(next); setLastSaved(next); } catch (err) { setError((err as Error).message); } finally { setLoading(false); } })(); }, []);
  const save = async () => { if (invalid) { setError("Corrigez les champs invalides avant sauvegarde."); return; } setSaving(true); setError(""); setSuccess(""); try { const response: any = await cmsService.updateSettings(form); const next = { ...defaults, ...(response.data ?? form) }; setForm(next); setLastSaved(next); setSuccess("Paramètres sauvegardés."); } catch (err) { setForm(lastSaved); setError((err as Error).message); } finally { setSaving(false); } };

  const input = (label: string, value: string | number, onChange: (value: string) => void, type = "text") => <label className="space-y-1 text-sm"><span className="font-medium">{label}</span><input className="w-full rounded-xl border p-2 dark:border-zinc-800 dark:bg-zinc-950" type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={saving} /></label>;
  const check = (label: string, checked: boolean, onChange: (value: boolean) => void) => <label className="flex items-center gap-2 rounded-xl border p-3 text-sm dark:border-zinc-800"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={saving} />{label}</label>;

  return <div className="space-y-6"><PageHeader title="Paramètres Marketplace" subtitle="Configuration complète de Diamarket sans modification du code" />
    <div className="flex flex-wrap gap-2">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-xl border px-3 py-2 text-sm ${tab === item ? "bg-olive-700 text-white" : ""}`}>{item}</button>)}</div>
    {loading && <p className="rounded-xl border p-4">Chargement des paramètres…</p>}{error && <p className="rounded-xl bg-red-500/10 p-3 text-red-700">{error}</p>}{success && <p className="rounded-xl bg-green-500/10 p-3 text-green-700">{success}</p>}
    {!loading && <section className="space-y-4 rounded-2xl border p-4 dark:border-zinc-800">
      <div className="grid gap-4 md:grid-cols-2">
        {tab === "Général" && <>{input("Nom marketplace", form.marketplaceName, (v) => patch({ marketplaceName: v }))}{input("Devise par défaut", form.defaultCurrency, (v) => patch({ defaultCurrency: v }))}{input("Langue par défaut", form.defaultLanguage, (v) => patch({ defaultLanguage: v }))}{input("Pays principal", form.primaryCountry, (v) => patch({ primaryCountry: v }))}{input("Commission par défaut (0 à 1)", form.defaultCommission, (v) => patch({ defaultCommission: Number(v) }), "number")}</>}
        {tab === "Branding" && <><div><p className="mb-2 font-medium">Logo</p><MediaPicker category="brand" value={asset(form.logo)} onChange={(m) => patch({ logo: mediaUrl(m) })} /></div><div><p className="mb-2 font-medium">Favicon</p><MediaPicker category="brand" value={asset(form.favicon)} onChange={(m) => patch({ favicon: mediaUrl(m) })} /></div></>}
        {tab === "SEO" && <>{input("Title", form.seo.title, (v) => patchNested("seo", "title", v))}{input("Description", form.seo.description, (v) => patchNested("seo", "description", v))}{input("Keywords", form.seo.keywords, (v) => patchNested("seo", "keywords", v))}<div><p className="mb-2 font-medium">Image OpenGraph</p><MediaPicker category="marketing" value={asset(form.seo.openGraphImage)} onChange={(m) => patchNested("seo", "openGraphImage", mediaUrl(m))} /></div></>}
        {tab === "Contact" && <>{input("Contact support", form.supportContact, (v) => patch({ supportContact: v }))}{input("Email support", form.supportEmail, (v) => patch({ supportEmail: v }), "email")}{input("Téléphone support", form.supportPhone, (v) => patch({ supportPhone: v }))}{input("Adresse entreprise", form.companyAddress, (v) => patch({ companyAddress: v }))}</>}
        {tab === "Checkout" && <>{check("Diapay activé", Boolean(form.checkout.diapayEnabled), (v) => patchNested("checkout", "diapayEnabled", v))}{check("Paiement à la livraison", Boolean(form.checkout.cashOnDeliveryEnabled), (v) => patchNested("checkout", "cashOnDeliveryEnabled", v))}{check("Checkout invité", Boolean(form.checkout.guestCheckout), (v) => patchNested("checkout", "guestCheckout", v))}</>}
        {tab === "Livraison" && <>{check("DiaExpress activé", Boolean(form.shipping.diaExpressEnabled), (v) => patchNested("shipping", "diaExpressEnabled", v))}{input("Seuil livraison gratuite", String(form.shipping.freeShippingThreshold ?? ""), (v) => patchNested("shipping", "freeShippingThreshold", v))}</>}
        {tab === "Vendeurs" && <>{check("Candidatures ouvertes", Boolean(form.vendors.applicationsOpen), (v) => patchNested("vendors", "applicationsOpen", v))}{check("Auto-approbation produits", Boolean(form.vendors.autoApproveProducts), (v) => patchNested("vendors", "autoApproveProducts", v))}{input("Commission vendeurs par défaut", Number(form.vendors.defaultCommission ?? form.defaultCommission), (v) => patchNested("vendors", "defaultCommission", Number(v)), "number")}</>}
        {tab === "Maintenance" && <>{check("Mode maintenance", form.maintenanceMode, (v) => patch({ maintenanceMode: v }))}{input("Message maintenance", form.maintenanceMessage, (v) => patch({ maintenanceMessage: v }))}<div><p className="mb-2 font-medium">Image maintenance</p><MediaPicker category="marketing" value={asset(form.maintenanceImage)} onChange={(m) => patch({ maintenanceImage: mediaUrl(m) })} /></div></>}
        {tab === "Réseaux sociaux" && Object.entries(form.socialLinks).map(([key, value]) => input(key, String(value), (v) => patchNested("socialLinks", key, v)))}
      </div>
      <div className="flex gap-2"><button onClick={save} disabled={saving || invalid} className="rounded-xl bg-olive-700 px-4 py-2 text-white disabled:opacity-50">{saving ? "Sauvegarde…" : "Sauvegarder"}</button><button onClick={() => setForm(lastSaved)} disabled={saving} className="rounded-xl border px-4 py-2">Réinitialiser localement</button></div>
    </section>}
  </div>;
}
