import { NextResponse } from 'next/server';

// The API owns the HttpOnly session cookie, which may live on a different host
// from the CMS. The client-side CmsAccessGate validates /api/auth/me and redirects
// unauthenticated or non-admin visitors before rendering any CMS content.
export function middleware() {
  return NextResponse.next();
}

export const config = { matcher: ['/((?!.+\\.[\\w]+$|_next).*)'] };
