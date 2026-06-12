import { NextResponse } from 'next/server';

// Authentication and role decisions are made from the API session in CmsAccessGate.
// Keeping this middleware role-neutral prevents valid normal-user sessions from being
// misreported as missing sessions before the forbidden screen can be rendered.
export function middleware() {
  return NextResponse.next();
}

export const config = { matcher: ['/((?!.+\\.[\\w]+$|_next).*)'] };
