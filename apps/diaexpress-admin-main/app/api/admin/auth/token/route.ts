import { NextResponse } from 'next/server';
import { resolveAppRouterAuthToken } from '@/lib/api/auth.server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const forceFresh = url.searchParams.get('fresh') === '1';
  const tokenResult = await resolveAppRouterAuthToken(forceFresh);

  if (!tokenResult.token) {
    return NextResponse.json(
      {
        token: null,
        reason: tokenResult.errorReason || 'no_token',
        detail: tokenResult.errorDetail,
      },
      { status: 401 },
    );
  }

  return NextResponse.json({ token: tokenResult.token }, { status: 200 });
}
