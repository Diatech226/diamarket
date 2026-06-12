import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CmsAccessGate } from "@/components/auth/cms-access-gate";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <CmsAccessGate><div className="flex min-h-screen"><Sidebar /><main className="flex-1"><Topbar /><div className="p-6">{children}</div></main></div></CmsAccessGate>;
}
