import { PageHeader } from "@/components/ui/page-header";
import { UserRoleEditor } from "@/components/cms/admin-control-center";
export default function RolesPage(){ return <div className="space-y-6"><PageHeader title="Roles" subtitle="super_admin, admin, manager, support, finance, vendor_manager, viewer."/><UserRoleEditor roles={["super_admin","admin","manager","support","finance","vendor_manager","viewer"]}/></div>; }
