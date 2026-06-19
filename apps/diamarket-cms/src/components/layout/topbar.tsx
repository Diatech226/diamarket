"use client";

import { useEffect, useState } from "react";
import { cmsAuth } from "@/lib/auth-client";

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

  const logout = async () => {
    await cmsAuth.logout();
    window.location.assign("/login");
  };

  return <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Administration marketplace</p><p className="text-xs text-zinc-500">Actions rapides, thèmes et session admin.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={toggle} aria-label="Basculer le thème clair ou sombre" className="admin-btn admin-btn-secondary text-xs">{dark ? "☀️ Clair" : "🌙 Sombre"}</button><button type="button" onClick={logout} className="admin-btn admin-btn-danger text-xs">Se déconnecter</button></div></header>;
}
