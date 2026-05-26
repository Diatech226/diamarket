import { auth } from "@clerk/nextjs/server";
import { Role } from "@/types/cms";

const ALLOWED_ROLES: Role[] = ["admin", "super_admin", "marketplace_point_focal"];

export async function getCurrentRole() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  return role;
}

export async function canAccessCms() {
  const role = await getCurrentRole();
  return role ? ALLOWED_ROLES.includes(role as Role) : false;
}
