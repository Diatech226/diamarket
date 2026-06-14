import Link from "next/link";

const links = ["dashboard","projects","products","categories","slides","orders","vendors","focal-points","settings","currencies","shipping"];

export function Sidebar() {
  return (
    <aside className="border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <h2 className="mb-3 text-xl font-bold text-olive-700 lg:mb-6">Diamarket CMS</h2>
      <nav aria-label="Navigation d’administration" className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1">{links.map((l) => <Link key={l} href={`/${l}`} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm capitalize hover:bg-zinc-100 dark:hover:bg-zinc-900">{l.replace('-', ' ')}</Link>)}</nav>
    </aside>
  );
}
