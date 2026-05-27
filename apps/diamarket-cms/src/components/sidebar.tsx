const links = ['Dashboard', 'Utilisateurs', 'Vendeurs', 'Produits', 'Commandes', 'Paramètres'];

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-slate-900 p-5 text-slate-100">
      <h2 className="mb-6 text-xl font-semibold">Diamarket CMS</h2>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link} className="rounded px-3 py-2 hover:bg-slate-800">
            {link}
          </li>
        ))}
      </ul>
    </aside>
  );
}
