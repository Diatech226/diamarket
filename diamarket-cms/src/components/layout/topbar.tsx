import { UserButton } from "@clerk/nextjs";

export function Topbar() {
  return <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950"><p className="text-sm text-zinc-500">Administration marketplace</p><UserButton /></header>;
}
