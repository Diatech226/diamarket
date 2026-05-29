import { NextResponse, type NextRequest } from 'next/server';

const allowedRoles = ['merchant', 'admin', 'super_admin'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get('diapay_session')?.value;
  const role = request.cookies.get('diapay_role')?.value;
  const isDashboard = !request.nextUrl.pathname.startsWith('/login') && request.nextUrl.pathname !== '/';

  if (isDashboard && (!session || !role || !allowedRoles.includes(role))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (request.nextUrl.pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/payments/:path*', '/transactions/:path*', '/api-keys/:path*', '/webhooks/:path*', '/customers/:path*', '/refunds/:path*', '/payouts/:path*', '/developers/:path*', '/settings/:path*'],
};
