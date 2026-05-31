import { getClerkRuntimeConfig } from '@/lib/config/env';
import { auth } from '@clerk/nextjs/server';

let hasLoggedAuthReady = false;

export async function safeClerkAuth() {
  const clerkConfig = getClerkRuntimeConfig();
  if (process.env.NODE_ENV !== 'production' && !hasLoggedAuthReady && clerkConfig.enabled) {
    hasLoggedAuthReady = true;
    console.info('[adminv2/clerk] Server auth diagnostics', {
      clerkSdkLoaded: typeof auth === 'function',
      publishableKeyPresent: Boolean(clerkConfig.publishableKey),
      secretKeyPresent: Boolean(clerkConfig.secretKey),
      usingPublishableKeyAlias: clerkConfig.usingPublishableKeyAlias,
    });
  }
  if (!clerkConfig.enabled) {
    return {
      userId: null,
      sessionClaims: null,
      middlewareConfigured: false,
      error: `missing_env:${clerkConfig.missingKeys.join(',')}`,
    };
  }

  try {
    const authState = await auth();
    return { ...authState, middlewareConfigured: true, error: null as string | null };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Clerk middleware manquant. Ajoutez middleware.ts avec clerkMiddleware().';

    console.warn('[adminv2/clerk] Unable to resolve auth context:', {
      message,
      clerkSdkLoaded: typeof auth === 'function',
      publishableKeyPresent: Boolean(clerkConfig.publishableKey),
      secretKeyPresent: Boolean(clerkConfig.secretKey),
      usingPublishableKeyAlias: clerkConfig.usingPublishableKeyAlias,
    });
    return {
      userId: null,
      sessionClaims: null,
      middlewareConfigured: false,
      error: message,
    };
  }
}
