"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveMediaUrl } from "@/lib/api";
import { cmsService } from "@/services/cms-service";
import type { MediaAsset, MediaCategory } from "@/types/cms";

type MediaPickerProps = { value?: MediaAsset | MediaAsset[]; multiple?: boolean; category?: MediaCategory; onChange: (media: MediaAsset | MediaAsset[]) => void };

export function MediaPicker({ value, multiple = false, category = "other", onChange }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selected = useMemo(() => (Array.isArray(value) ? value : value ? [value] : []), [value]);
  const selectedIds = new Set(selected.map((item) => item._id));

  const load = async () => { setLoading(true); setError(""); try { const response = await cmsService.getMedia({ page: 1, limit: 24, search, category }); setItems(response.data); } catch (err) { setError((err as Error).message); } finally { setLoading(false); } };
  useEffect(() => { if (open) void load(); }, [open, category]);

  const upload = async (file: File | null) => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const media = await new Promise<MediaAsset>((resolve, reject) => { const reader = new FileReader(); reader.onload = async () => { try { const response = await cmsService.uploadMedia({ dataUrl: String(reader.result), fileName: file.name, category }); resolve(response.data); } catch (err) { reject(err); } }; reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
      setItems((current) => [media, ...current]);
    } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  };

  const choose = (media: MediaAsset) => {
    if (!multiple) { onChange(media); setOpen(false); return; }
    const next = selectedIds.has(media._id) ? selected.filter((item) => item._id !== media._id) : [...selected, media];
    onChange(next);
  };

  return <div className="space-y-2"><button type="button" onClick={() => setOpen(true)} className="rounded-xl border px-3 py-2 text-sm">Choisir depuis la médiathèque</button>{selected.length > 0 && <div className="flex flex-wrap gap-2">{selected.map((item) => <img key={item._id} src={resolveMediaUrl(item.url)} alt={item.alt || item.name || "Média"} className="h-14 w-14 rounded object-cover" />)}</div>}{open && <div className="fixed inset-0 z-50 bg-black/40 p-4"><div className="mx-auto max-h-[90vh] max-w-5xl overflow-auto rounded-2xl bg-white p-4 shadow-xl dark:bg-zinc-950"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Médiathèque</h2><button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-3 py-2">Fermer</button></div><div className="mb-4 grid gap-2 md:grid-cols-3"><input className="rounded-xl border p-2" placeholder="Rechercher" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load()} /><button type="button" onClick={load} className="rounded-xl bg-zinc-900 px-3 py-2 text-white">Rechercher</button><input className="rounded-xl border p-2" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event.target.files?.[0] ?? null)} /></div>{error && <p className="mb-3 rounded-xl bg-red-500/10 p-3 text-red-700">{error}</p>}{loading ? <p className="rounded-xl border p-4">Chargement…</p> : items.length ? <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">{items.map((media) => <button type="button" key={media._id} onClick={() => choose(media)} className={`rounded-xl border p-2 text-left ${selectedIds.has(media._id) ? "ring-2 ring-olive-700" : ""}`}><img src={resolveMediaUrl(media.url)} alt={media.alt || media.name || "Média"} className="mb-2 h-32 w-full rounded object-cover" /><p className="truncate text-sm font-medium">{media.name || media.originalName || media.filename}</p><p className="text-xs text-zinc-500">{media.category} · {media.mimeType || "URL"}</p></button>)}</div> : <p className="rounded-xl border p-4 text-sm text-zinc-500">Aucun média disponible.</p>}</div></div>}</div>;
}
