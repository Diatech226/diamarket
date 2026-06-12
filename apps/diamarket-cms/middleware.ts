import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtected = createRouteMatcher(["/((?!sign-in|unauthorized).*)"]);
const allowed = ["admin", "super_admin", "marketplace_point_focal"];

export default clerkMiddleware(async (auth, req) => {
  if (!isProtected(req)) return;
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (!role || !allowed.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
});

export const config = { matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"] };
