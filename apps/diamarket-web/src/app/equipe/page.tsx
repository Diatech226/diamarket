import { api } from '@/lib/api';
import type { TeamMember } from '@/lib/types';

const cleanPhoneHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`;
const whatsappHref = (value: string) => /^https?:\/\//i.test(value) ? value : `https://wa.me/${value.replace(/[^\d]/g, '')}`;

export default async function EquipePage() {
  const members = await api.getTeam();
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <p className="text-sm font-semibold uppercase tracking-wide text-olive-700">Nos équipes</p>
    <h1 className="mt-2 text-4xl font-bold text-zinc-950">Rencontrez notre équipe</h1>
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member: TeamMember) => {
        const phone = member.phone || member.contact || '';
        return <article key={member.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          {member.photo ? <img src={member.photo} alt={member.name} className="mb-4 h-48 w-full rounded-2xl object-cover" /> : null}
          <h2 className="text-xl font-bold text-zinc-950">{member.name}</h2>
          {member.role ? <p className="text-sm font-medium text-olive-700">{member.role}</p> : null}
          {member.bio ? <p className="mt-3 text-sm text-zinc-600">{member.bio}</p> : null}
          {(member.email || phone || member.whatsapp) ? <div className="mt-4 space-y-2 text-sm">
            {member.email ? <a className="block text-olive-800 underline" href={`mailto:${member.email}`}>{member.email}</a> : null}
            {phone ? <a className="block text-olive-800 underline" href={cleanPhoneHref(phone)}>{phone}</a> : null}
            {member.whatsapp ? <a className="block text-olive-800 underline" href={whatsappHref(member.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a> : null}
          </div> : null}
        </article>;
      })}
    </div>
  </main>;
}
