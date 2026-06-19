"use client";

import { FormEvent, useEffect, useState } from "react";
import { cmsService } from "@/services/cms-service";
import type { TeamMemberItem, TeamMemberPayload } from "@/types/cms";

const emptyForm: TeamMemberPayload = { name: "", role: "", bio: "", photo: "", email: "", phone: "", contact: "", whatsapp: "", socialLinks: {}, status: "active" };
const memberId = (member: TeamMemberItem) => member._id ?? member.id ?? "";
const normalizeForForm = (member: TeamMemberItem): TeamMemberPayload => ({ ...emptyForm, ...member, email: member.email ?? "", phone: member.phone ?? member.contact ?? "", contact: member.contact ?? member.phone ?? "", socialLinks: member.socialLinks ?? {} });

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [form, setForm] = useState<TeamMemberPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => { setLoading(true); try { setMembers(await cmsService.getTeam()); setError(""); } catch (err) { setError(err instanceof Error ? err.message : "Erreur de chargement"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const update = (key: keyof TeamMemberPayload, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const edit = (member: TeamMemberItem) => { setEditingId(memberId(member)); setForm(normalizeForForm(member)); };
  const reset = () => { setEditingId(null); setForm(emptyForm); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...form, phone: form.phone || form.contact || "", contact: form.contact || form.phone || "" };
    try { if (editingId) await cmsService.updateTeamMember(editingId, payload); else await cmsService.createTeamMember(payload); reset(); await load(); } catch (err) { setError(err instanceof Error ? err.message : "Erreur de sauvegarde"); }
  };

  return <main className="space-y-6 p-6">
    <div><p className="text-sm font-semibold uppercase text-olive-700">Contenu public</p><h1 className="text-3xl font-bold">Équipe</h1><p className="text-zinc-500">Gérez les membres et leurs contacts publics.</p></div>
    {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-2">
      {([['name','Nom'],['role','Rôle'],['photo','Photo URL'],['email','Email'],['phone','Téléphone'],['contact','Contact'],['whatsapp','WhatsApp']] as const).map(([key,label]) => <label key={key} className="text-sm font-medium">{label}<input value={String(form[key] ?? '')} onChange={(e)=>update(key,e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" required={key==='name'} /></label>)}
      <label className="text-sm font-medium md:col-span-2">Bio<textarea value={form.bio ?? ''} onChange={(e)=>update('bio',e.target.value)} className="mt-1 min-h-24 w-full rounded-xl border px-3 py-2" /></label>
      <label className="text-sm font-medium">Statut<select value={form.status ?? 'active'} onChange={(e)=>update('status',e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"><option value="active">Actif</option><option value="draft">Brouillon</option><option value="inactive">Inactif</option><option value="archived">Archivé</option></select></label>
      <div className="flex items-end gap-2"><button className="rounded-xl bg-olive-700 px-4 py-2 font-semibold text-white">{editingId ? 'Mettre à jour' : 'Créer'}</button>{editingId ? <button type="button" onClick={reset} className="rounded-xl border px-4 py-2">Annuler</button> : null}</div>
    </form>
    <section className="rounded-2xl border bg-white"><div className="border-b p-4 font-semibold">Membres</div>{loading ? <p className="p-4">Chargement…</p> : members.map((member) => <article key={memberId(member)} className="flex flex-wrap items-center justify-between gap-3 border-b p-4 last:border-0"><div><strong>{member.name}</strong><p className="text-sm text-zinc-500">{member.role}</p><p className="text-sm">{member.email || '—'} · {member.phone || member.contact || '—'}</p></div><button onClick={()=>edit(member)} className="rounded-xl border px-3 py-2 text-sm">Modifier</button></article>)}</section>
  </main>;
}
