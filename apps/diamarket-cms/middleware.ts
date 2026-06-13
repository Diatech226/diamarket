import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'diamarket_session';
const publicPaths = ['/login', '/unauthorized'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return NextResponse.next();
  if (!request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/((?!.+\\.[\\w]+$|_next).*)'] };
