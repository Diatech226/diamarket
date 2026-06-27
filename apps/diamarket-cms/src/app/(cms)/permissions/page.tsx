import { PageHeader } from "@/components/ui/page-header";
import { PermissionMatrix } from "@/components/cms/admin-control-center";
export default function PermissionsPage(){ return <div className="space-y-6"><PageHeader title="Permissions" subtitle="Matrice de contrôle par module."/><PermissionMatrix roles={["super_admin","admin","manager","support","finance","vendor_manager","viewer"]} permissions={["analytics:read","audit:read","settings:update","users:create","users:update","orders:update","products:update","vendors:approve"]}/></div>; }
