import { AppShell } from '@/components/layout/app-shell';
import { safeClerkAuth } from '@/lib/auth/clerk';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AccessDenied } from '@/components/auth/access-denied';
import { BackendOffline } from '@/components/system/backend-offline';
import { resolveBackendAdminStatus } from '@/lib/auth/backend-user';
import { AuthUnavailable } from '@/components/system/auth-unavailable';
import { getMissingClerkEnvKeys } from '@/lib/config/env';

const toSafeQueryValue = (value: string) => encodeURIComponent(value);


function getRequestPathname() {
  const requestHeaders = headers();
  const candidates = ['x-invoke-path', 'x-matched-path', 'next-url'];

  for (const key of candidates) {
    const value = requestHeaders.get(key);
    if (!value) {
      continue;
    }

    try {
      if (value.startsWith('/')) {
        return value;
      }

      const parsed = new URL(value);
      return parsed.pathname;
    } catch {
      continue;
    }
  }

  return '';
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = getRequestPathname();

  if (pathname.startsWith('/admin/auth-error') || pathname.startsWith('/admin/access-denied')) {
    return <>{children}</>;
  }

  const { userId, middlewareConfigured, error } = await safeClerkAuth();

  if (!middlewareConfigured) {
    return <AuthUnavailable missingKeys={getMissingClerkEnvKeys()} detail={error || undefined} />;
  }

  if (!userId) {
    redirect('/sign-in?reason=unauthenticated');
  }

  const adminStatus = await resolveBackendAdminStatus();

  if (!adminStatus.ok) {
    if (adminStatus.status === 401) {
      const reasonMap: Record<string, string> = {
        expired_token: 'session-invalid',
        missing_token: 'sign-in-required',
        token_template_not_found: 'token-template-missing',
        invalid_token: 'backend-unauthorized',
      };
      const reason = reasonMap[adminStatus.reason] || 'backend-unauthorized';
      const detail = adminStatus.detail ? `&detail=${toSafeQueryValue(adminStatus.detail)}` : '';
      redirect(`/admin/auth-error?reason=${toSafeQueryValue(reason)}${detail}`);
    }

    if (adminStatus.status === 403) {
      return <AccessDenied />;
    }

    const supportRequestId = adminStatus.requestId ? ` Référence support: ${adminStatus.requestId}.` : '';
    const detail = adminStatus.detail ? ` Détail: ${adminStatus.detail}` : '';
    const isDatabaseUnavailable = adminStatus.status === 503 && adminStatus.reason === 'database_unavailable';
    const isNetworkUnavailable = adminStatus.status === 503;
    const message = isDatabaseUnavailable
      ? `Base de données indisponible. Le backend répond, mais MongoDB est hors ligne ou inaccessible.${supportRequestId}`
      : isNetworkUnavailable
        ? `Backend indisponible. Le service API ne répond pas ou est temporairement hors ligne.${supportRequestId}`
        : `Erreur serveur backend pendant la vérification d’authentification. Ce n’est pas une indisponibilité MongoDB.${supportRequestId}${detail}`;

    return <BackendOffline message={message} />;
  }

  return <AppShell>{children}</AppShell>;
}
