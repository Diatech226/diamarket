"use client";

import { cmsAuth } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme/theme-provider";

export function Topbar() {
  const logout = async () => {
    await cmsAuth.logout();
    window.location.assign("/login");
  };

  return <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-brand-border bg-brand-surface/90 px-4 py-3 backdrop-blur dark:border-brand-border dark:bg-brand-surface/90 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-sm font-medium text-brand-dark dark:text-brand-text">Administration marketplace</p><p className="text-xs text-brand-muted">Actions rapides, thèmes et session admin.</p></div><div className="flex flex-wrap items-center gap-2"><ThemeToggle /><button type="button" onClick={logout} className="admin-btn admin-btn-danger text-xs">Se déconnecter</button></div></header>;
}
