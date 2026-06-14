import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CmsAccessGate } from "@/components/auth/cms-access-gate";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <CmsAccessGate><div className="min-h-screen lg:flex"><Sidebar /><main className="min-w-0 flex-1"><Topbar /><div className="p-4 sm:p-6">{children}</div></main></div></CmsAccessGate>;
}
