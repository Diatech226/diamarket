import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Diamarket CMS", description: "Admin CMS" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" suppressHydrationWarning><body className="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">{children}</body></html>;
}
