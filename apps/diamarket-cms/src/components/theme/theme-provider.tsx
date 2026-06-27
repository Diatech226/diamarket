"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "diamarket-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = theme;
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored === "dark" || stored === "system" || stored === "light" ? stored : "light";
    setThemeState(initial);
    setResolvedTheme(applyTheme(initial));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = (window.localStorage.getItem(STORAGE_KEY) as Theme | null) || initial;
      if (current === "system") setResolvedTheme(applyTheme("system"));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setResolvedTheme(applyTheme(next));
  };

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-dark shadow-sm transition hover:bg-brand-surface-alt dark:border-brand-border dark:bg-brand-surface dark:text-brand-text">
      <span aria-hidden>{resolvedTheme === "dark" ? "🌙" : "☀️"}</span>
      <span className="sr-only">Thème</span>
      <select
        aria-label="Choisir le thème"
        value={theme}
        onChange={(event) => setTheme(event.target.value as Theme)}
        className="min-h-0 border-0 bg-transparent p-0 text-xs font-semibold focus-visible:ring-0"
      >
        <option value="light">Clair</option>
        <option value="dark">Sombre</option>
        <option value="system">Système</option>
      </select>
    </label>
  );
}

export function ThemeScript() {
  const code = `(() => { try { const key = 'diamarket-theme'; const stored = localStorage.getItem(key) || 'light'; const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches; const dark = stored === 'dark' || (stored === 'system' && systemDark); document.documentElement.classList.toggle('dark', dark); document.documentElement.dataset.theme = stored; } catch (_) {} })();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
