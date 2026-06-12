"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function Topbar() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950"><p className="text-sm text-zinc-500">Administration marketplace</p><div className="flex items-center gap-3"><button onClick={toggle} className="rounded-lg border px-3 py-1.5 text-xs dark:border-zinc-700">{dark ? "☀️ Light" : "🌙 Dark"}</button><UserButton /></div></header>;
}
