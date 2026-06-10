import { getClerkRuntimeConfig } from '@/lib/config/env';
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

const runtimeClerkMiddleware = clerkMiddleware();

let hasLoggedMiddlewareBypass = false;

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const clerkConfig = getClerkRuntimeConfig();
  if (!clerkConfig.enabled) {
    if (!hasLoggedMiddlewareBypass && process.env.NODE_ENV !== 'production') {
      hasLoggedMiddlewareBypass = true;
      console.warn('[adminv2/middleware] Skipping Clerk middleware because auth env is not configured.');
    }
    return NextResponse.next();
  }

  return runtimeClerkMiddleware(request, event);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
