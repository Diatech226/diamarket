import Link from "next/link";

const links = ["dashboard","projects","products","categories","slides","orders","vendors","focal-points","settings","currencies","shipping"];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
      <h2 className="mb-6 text-xl font-bold text-olive-700">Diamarket CMS</h2>
      <nav className="space-y-2">{links.map((l) => <Link key={l} href={`/${l}`} className="block rounded-md px-3 py-2 text-sm capitalize hover:bg-zinc-100 dark:hover:bg-zinc-900">{l.replace('-', ' ')}</Link>)}</nav>
    </aside>
  );
}
