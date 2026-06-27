"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  { title: "Pilotage", links: [{ href: "/dashboard", label: "Dashboard" }, { href: "/orders", label: "Commandes" }, { href: "/audit-logs", label: "Audit logs" }] },
  { title: "Catalogue", links: [{ href: "/products", label: "Produits" }, { href: "/categories", label: "Catégories" }, { href: "/media", label: "Médiathèque" }, { href: "/slides", label: "Slides" }, { href: "/team", label: "Équipe" }] },
  { title: "Marchands", links: [{ href: "/vendors", label: "Vendeurs" }, { href: "/storefront", label: "White-Label" }, { href: "/users", label: "Utilisateurs" }] },
  { title: "Marketing", links: [{ href: "/promotions", label: "Promotions" }, { href: "/email-templates", label: "Emails" }] },
  { title: "Configuration", links: [{ href: "/settings", label: "Settings" }, { href: "/currencies", label: "Devises & commissions" }, { href: "/shipping", label: "Shipping" }, { href: "/focal-points", label: "Points focaux", disabled: true }] },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="admin-sidebar border-b border-zinc-200 bg-white/95 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <Link href="/dashboard" className="mb-4 flex items-center gap-3 rounded-2xl bg-olive-50 px-3 py-3 text-olive-800 dark:bg-olive-950/30 dark:text-olive-200" aria-label="Retour au dashboard Diamarket CMS">
        <span className="grid size-10 place-items-center rounded-xl bg-olive-700 text-sm font-bold text-white">DM</span>
        <span><strong className="block text-base">Diamarket CMS</strong><span className="text-xs text-olive-700/80 dark:text-olive-200/80">Administration marketplace</span></span>
      </Link>
      <nav aria-label="Navigation d’administration" className="flex gap-3 overflow-x-auto pb-1 lg:block lg:space-y-5">
        {groups.map((group) => (
          <section key={group.title} className="min-w-max lg:min-w-0">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{group.title}</p>
            <div className="flex gap-1 lg:block lg:space-y-1">
              {group.links.map((link) => {
                const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                if (link.disabled) return <span key={link.href} aria-disabled="true" className="block cursor-not-allowed rounded-xl px-3 py-2 text-sm text-zinc-400">{link.label}</span>;
                return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${active ? "bg-olive-700 text-white shadow-sm" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"}`}>{link.label}</Link>;
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
