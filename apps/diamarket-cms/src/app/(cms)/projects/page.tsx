"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { resolveMediaUrl } from "@/lib/api";
import { cmsService } from "@/services/cms-service";
import type { MediaAsset, Project, ProjectPayload } from "@/types/cms";

type Notice = { tone: "success" | "error" | "info"; message: string } | null;
type ImageMode = "cover" | "gallery";

type ProjectForm = {
  title: string;
  description: string;
  category: string;
  status: "draft" | "active" | "archived";
  coverImageUrl: string;
  coverMedia?: MediaAsset;
  galleryImageUrls: string[];
  galleryMedia: MediaAsset[];
  links: string;
  startDate: string;
  endDate: string;
  isFeatured: boolean;
};

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  category: "",
  status: "draft",
  coverImageUrl: "",
  coverMedia: undefined,
  galleryImageUrls: [],
  galleryMedia: [],
  links: "",
  startDate: "",
  endDate: "",
  isFeatured: false,
};

function isMediaAsset(value: Project["coverMedia"]): value is MediaAsset {
  return Boolean(value && typeof value === "object" && "url" in value);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function mediaLabel(media: MediaAsset) {
  return media.alt || media.originalName || media.filename || media.url;
}

function imageUrlFromMedia(media?: MediaAsset) {
  return resolveMediaUrl(media?.url);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState({ cover: "", gallery: "" });
  const [mediaSearch, setMediaSearch] = useState("");

  const filteredMedia = useMemo(() => {
    const query = mediaSearch.trim().toLowerCase();
    if (!query) return media;
    return media.filter((item) => mediaLabel(item).toLowerCase().includes(query));
  }, [media, mediaSearch]);

  const coverPreview = form.coverMedia ? imageUrlFromMedia(form.coverMedia) : form.coverImageUrl;
  const galleryPreviews = [
    ...form.galleryMedia.map((item) => ({ id: item._id, url: imageUrlFromMedia(item), label: mediaLabel(item), type: "media" as const })),
    ...form.galleryImageUrls.map((url) => ({ id: url, url, label: url, type: "url" as const })),
  ];

  async function refresh() {
    setIsLoading(true);
    try {
      const [nextProjects, nextMedia] = await Promise.all([cmsService.getProjects(), cmsService.getMedia()]);
      setProjects(nextProjects);
      setMedia(nextMedia.data);
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Chargement impossible." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingProject(null);
    setNotice(null);
    setUrlDraft({ cover: "", gallery: "" });
  }

  function editProject(project: Project) {
    const galleryMedia = (project.galleryMedia ?? []).filter(isMediaAsset);
    setEditingProject(project);
    setForm({
      title: project.title ?? "",
      description: project.description ?? "",
      category: project.category ?? "",
      status: project.status ?? "draft",
      coverImageUrl: project.coverImageUrl ?? "",
      coverMedia: isMediaAsset(project.coverMedia) ? project.coverMedia : undefined,
      galleryImageUrls: project.galleryImageUrls ?? [],
      galleryMedia,
      links: (project.links ?? []).join("\n"),
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      endDate: project.endDate ? project.endDate.slice(0, 10) : "",
      isFeatured: Boolean(project.isFeatured),
    });
    setNotice({ tone: "info", message: `Modification de « ${project.title} ».` });
  }

  function buildPayload(): ProjectPayload {
    const links = form.links
      .split("\n")
      .map((link) => link.trim())
      .filter(Boolean);

    return {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category.trim() || undefined,
      status: form.status,
      coverImageUrl: form.coverMedia ? undefined : form.coverImageUrl.trim() || undefined,
      coverMedia: form.coverMedia?._id,
      galleryImageUrls: form.galleryImageUrls,
      galleryMedia: form.galleryMedia.map((item) => item._id),
      media: form.galleryMedia.map((item) => item._id),
      links,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      isFeatured: form.isFeatured,
    };
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      setNotice({ tone: "error", message: "Le titre du projet est le seul champ obligatoire." });
      return;
    }

    setIsSaving(true);
    setNotice({ tone: "info", message: editingProject ? "Mise à jour du projet…" : "Création du projet…" });
    try {
      if (editingProject) await cmsService.updateProject(editingProject._id, buildPayload());
      else await cmsService.createProject(buildPayload());
      setNotice({ tone: "success", message: editingProject ? "Projet mis à jour." : "Projet créé. Vous pouvez l’enrichir à tout moment." });
      resetForm();
      await refresh();
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Enregistrement impossible." });
    } finally {
      setIsSaving(false);
    }
  }

  async function addUrl(mode: ImageMode) {
    const url = urlDraft[mode].trim();
    if (!url) return;
    setNotice({ tone: "info", message: "Ajout de l’image URL à la médiathèque…" });
    try {
      const response = await cmsService.createMediaFromUrl({ url, originalName: url });
      setMedia((current) => [response.data, ...current]);
      if (mode === "cover") setForm((current) => ({ ...current, coverImageUrl: url, coverMedia: undefined }));
      else setForm((current) => ({ ...current, galleryImageUrls: [...current.galleryImageUrls, url] }));
      setUrlDraft((current) => ({ ...current, [mode]: "" }));
      setNotice({ tone: "success", message: "Image ajoutée. Elle est disponible dans la médiathèque." });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Ajout de l’URL impossible." });
    }
  }

  function chooseMedia(mode: ImageMode, item: MediaAsset) {
    if (mode === "cover") {
      setForm((current) => ({ ...current, coverMedia: item, coverImageUrl: "" }));
      return;
    }
    setForm((current) => {
      if (current.galleryMedia.some((selected) => selected._id === item._id)) return current;
      return { ...current, galleryMedia: [...current.galleryMedia, item] };
    });
  }

  async function uploadLocal(event: ChangeEvent<HTMLInputElement>, mode: ImageMode) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setIsUploading(true);
    setNotice({ tone: "info", message: "Upload en cours…" });
    try {
      const uploaded: MediaAsset[] = [];
      for (const file of files) {
        const dataUrl = await readFileAsDataUrl(file);
        const response = await cmsService.uploadMedia({ dataUrl, fileName: file.name });
        uploaded.push(response.data);
      }
      setMedia((current) => [...uploaded, ...current]);
      setForm((current) => {
        if (mode === "cover") return { ...current, coverMedia: uploaded[0], coverImageUrl: "" };
        return { ...current, galleryMedia: [...current.galleryMedia, ...uploaded] };
      });
      setNotice({ tone: "success", message: "Upload terminé. Les images sont dans la médiathèque." });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Upload impossible." });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function removeMediaAsset(item: MediaAsset) {
    try {
      await cmsService.deleteMedia(item._id);
      setMedia((current) => current.filter((mediaItem) => mediaItem._id !== item._id));
      setForm((current) => ({
        ...current,
        coverMedia: current.coverMedia?._id === item._id ? undefined : current.coverMedia,
        galleryMedia: current.galleryMedia.filter((mediaItem) => mediaItem._id !== item._id),
      }));
      setNotice({ tone: "success", message: "Média supprimé." });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Suppression impossible." });
    }
  }

  function removeGalleryPreview(id: string, type: "media" | "url") {
    setForm((current) => ({
      ...current,
      galleryMedia: type === "media" ? current.galleryMedia.filter((item) => item._id !== id) : current.galleryMedia,
      galleryImageUrls: type === "url" ? current.galleryImageUrls.filter((url) => url !== id) : current.galleryImageUrls,
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Projets" subtitle="Création rapide : seul le titre est obligatoire, les médias et détails restent facultatifs." />

      {notice && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${notice.tone === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : notice.tone === "error" ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"}`}>
          {notice.message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <form onSubmit={saveProject} className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{editingProject ? "Modifier le projet" : "Nouveau projet"}</h2>
              <p className="text-sm text-zinc-500">Renseignez un titre, puis ajoutez les éléments facultatifs maintenant ou plus tard.</p>
            </div>
            {editingProject && <button type="button" onClick={resetForm} className="rounded-xl border px-3 py-2 text-sm dark:border-zinc-700">Annuler</button>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Titre du projet <span className="text-red-500">*</span></span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Ex. Villa témoin Ouaga 2000" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Catégorie <span className="text-zinc-400">(facultatif)</span></span>
              <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Résidentiel, commerce…" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Statut <span className="text-zinc-400">(facultatif)</span></span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectForm["status"] })} className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
                <option value="draft">Brouillon</option>
                <option value="active">Actif</option>
                <option value="archived">Archivé</option>
              </select>
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Description <span className="text-zinc-400">(facultatif)</span></span>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Ajoutez le contexte du projet plus tard si besoin." />
            </label>
          </div>

          <section className="space-y-3 rounded-2xl border border-dashed p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Image principale / cover</h3>
                <p className="text-sm text-zinc-500">URL, médiathèque ou upload local : choisissez le flux qui vous convient.</p>
              </div>
              {coverPreview && <button type="button" onClick={() => setForm({ ...form, coverImageUrl: "", coverMedia: undefined })} className="rounded-xl border px-3 py-2 text-sm dark:border-zinc-700">Retirer</button>}
            </div>
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                {coverPreview ? <img src={resolveMediaUrl(coverPreview)} alt="Preview cover" className="h-full max-h-56 w-full object-cover" /> : <span className="px-4 text-center text-sm text-zinc-500">Aucune image sélectionnée</span>}
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input value={urlDraft.cover} onChange={(event) => setUrlDraft({ ...urlDraft, cover: event.target.value })} className="min-w-0 flex-1 rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Coller une URL d’image" />
                  <button type="button" onClick={() => void addUrl("cover")} className="rounded-xl bg-olive-700 px-3 py-2 text-sm font-medium text-white">Utiliser</button>
                </div>
                <label className="block rounded-xl border px-3 py-3 text-sm dark:border-zinc-700">
                  <span className="font-medium">Importer depuis l’ordinateur</span>
                  <input type="file" accept="image/*" className="mt-2 block w-full text-sm" onChange={(event) => void uploadLocal(event, "cover")} />
                </label>
                <p className="text-xs text-zinc-500">Depuis la médiathèque : cliquez sur une image dans le panneau de droite.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-dashed p-4 dark:border-zinc-800">
            <h3 className="font-semibold">Galerie du projet <span className="text-sm font-normal text-zinc-400">(facultatif)</span></h3>
            <div className="flex gap-2">
              <input value={urlDraft.gallery} onChange={(event) => setUrlDraft({ ...urlDraft, gallery: event.target.value })} className="min-w-0 flex-1 rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="Ajouter une URL dans la galerie" />
              <button type="button" onClick={() => void addUrl("gallery")} className="rounded-xl border px-3 py-2 text-sm dark:border-zinc-700">Ajouter</button>
            </div>
            <label className="block rounded-xl border px-3 py-3 text-sm dark:border-zinc-700">
              <span className="font-medium">Importer une ou plusieurs images locales</span>
              <input type="file" accept="image/*" multiple className="mt-2 block w-full text-sm" onChange={(event) => void uploadLocal(event, "gallery")} />
            </label>
            {galleryPreviews.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {galleryPreviews.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="overflow-hidden rounded-2xl border dark:border-zinc-800">
                    <img src={resolveMediaUrl(item.url)} alt={item.label} className="h-28 w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 p-2 text-xs">
                      <span className="truncate text-zinc-500">{item.label}</span>
                      <button type="button" onClick={() => removeGalleryPreview(item.id, item.type)} className="text-red-600">Retirer</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-900">La galerie peut rester vide pendant la création.</p>
            )}
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Liens associés <span className="text-zinc-400">(facultatif, un par ligne)</span></span>
              <textarea value={form.links} onChange={(event) => setForm({ ...form, links: event.target.value })} rows={3} className="w-full rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" placeholder="https://…" />
            </label>
            <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
            <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="rounded-xl border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} />
              Mettre en avant le projet
            </label>
          </div>

          <button disabled={isSaving || isUploading} className="rounded-xl bg-olive-700 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? "Enregistrement…" : editingProject ? "Mettre à jour" : "Créer le projet"}
          </button>
        </form>

        <aside className="space-y-5">
          <section className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Médiathèque</h2>
                <p className="text-xs text-zinc-500">Sélection cover ou galerie, suppression incluse.</p>
              </div>
              {isUploading && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">Upload…</span>}
            </div>
            <input value={mediaSearch} onChange={(event) => setMediaSearch(event.target.value)} className="mb-3 w-full rounded-xl border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="Rechercher un média" />
            <div className="grid max-h-[620px] gap-3 overflow-auto pr-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {filteredMedia.map((item) => (
                <article key={item._id} className="overflow-hidden rounded-2xl border dark:border-zinc-800">
                  <img src={imageUrlFromMedia(item)} alt={mediaLabel(item)} className="h-28 w-full object-cover" />
                  <div className="space-y-2 p-2">
                    <p className="truncate text-xs text-zinc-500">{mediaLabel(item)}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button type="button" onClick={() => chooseMedia("cover", item)} className="rounded-lg bg-zinc-100 px-2 py-1 dark:bg-zinc-900">Cover</button>
                      <button type="button" onClick={() => chooseMedia("gallery", item)} className="rounded-lg bg-zinc-100 px-2 py-1 dark:bg-zinc-900">Galerie</button>
                      <button type="button" onClick={() => void removeMediaAsset(item)} className="col-span-2 rounded-lg bg-red-50 px-2 py-1 text-red-700 dark:bg-red-950/40 dark:text-red-200">Supprimer</button>
                    </div>
                  </div>
                </article>
              ))}
              {!isLoading && filteredMedia.length === 0 && <p className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-900">Aucun média pour le moment.</p>}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 font-semibold">Projets existants</h2>
            {isLoading ? <p className="text-sm text-zinc-500">Chargement…</p> : <div className="space-y-3">
              {projects.map((project) => (
                <article key={project._id} className="rounded-2xl border p-3 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-xs text-zinc-500">{project.description || "Projet minimal, prêt à enrichir."}</p>
                    </div>
                    <StatusBadge status={project.status || "draft"} />
                  </div>
                  <div className="mt-3 flex gap-2 text-xs">
                    <button type="button" onClick={() => editProject(project)} className="rounded-lg border px-2 py-1 dark:border-zinc-700">Modifier</button>
                    <button type="button" onClick={() => void cmsService.deleteProject(project._id).then(refresh)} className="rounded-lg border border-red-200 px-2 py-1 text-red-700 dark:border-red-900">Supprimer</button>
                  </div>
                </article>
              ))}
              {projects.length === 0 && <p className="text-sm text-zinc-500">Aucun projet. Créez-en un avec seulement un titre.</p>}
            </div>}
          </section>
        </aside>
      </div>
    </div>
  );
}
