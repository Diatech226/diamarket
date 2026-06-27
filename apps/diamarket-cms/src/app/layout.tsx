import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider";

export const metadata: Metadata = { title: "Diamarket CMS", description: "Admin CMS" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" suppressHydrationWarning><head><ThemeScript /></head><body className="bg-brand-surface text-brand-dark dark:bg-brand-surface dark:text-brand-text"><ThemeProvider>{children}</ThemeProvider></body></html>;
}
