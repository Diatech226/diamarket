import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { resolveClerkJwtTemplate } from './clerk-template';

type ClerkTokenOptions = { template?: string; skipCache?: boolean };

export type ServerClerkTokenResolution = {
  token: string | null;
  usedTemplate: string | null;
  errorReason: 'missing_auth_context' | 'token_template_not_found' | 'token_resolution_failed' | null;
  errorDetail: string | null;
};

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || 'Unknown token resolution error');
}

function isTemplateNotFoundError(error: unknown) {
  const message = toErrorMessage(error).toLowerCase();
  return message.includes('not found') || message.includes('404');
}

export async function resolveServerClerkTokenWithClerk(
  tokenOptions: ClerkTokenOptions,
): Promise<ServerClerkTokenResolution> {
  const authContext = await auth();

  if (!authContext || typeof authContext.getToken !== 'function') {
    return {
      token: null,
      usedTemplate: null,
      errorReason: 'missing_auth_context',
      errorDetail: 'Clerk auth() context unavailable',
    };
  }

  try {
    const token = await authContext.getToken(tokenOptions);
    return {
      token: token || null,
      usedTemplate: tokenOptions.template || null,
      errorReason: null,
      errorDetail: null,
    };
  } catch (error) {
    if (tokenOptions.template && isTemplateNotFoundError(error)) {
      const fallbackToken = await authContext.getToken({ skipCache: tokenOptions.skipCache });
      return {
        token: fallbackToken || null,
        usedTemplate: fallbackToken ? null : tokenOptions.template,
        errorReason: fallbackToken ? null : 'token_template_not_found',
        errorDetail: toErrorMessage(error),
      };
    }

    return {
      token: null,
      usedTemplate: tokenOptions.template || null,
      errorReason: 'token_resolution_failed',
      errorDetail: toErrorMessage(error),
    };
  }
}

function resolveTemplate() {
  return resolveClerkJwtTemplate();
}

export function buildServerClerkTokenOptions(forceFresh = false): ClerkTokenOptions {
  const template = resolveTemplate();
  const tokenOptions: ClerkTokenOptions = { template };

  if (forceFresh) {
    tokenOptions.skipCache = true;
  }

  return tokenOptions;
}

/**
 * App Router helper for Server Components / Route Handlers.
 */
export async function resolveAppRouterAuthToken(forceFresh = false): Promise<ServerClerkTokenResolution> {
  return resolveServerClerkTokenWithClerk(buildServerClerkTokenOptions(forceFresh));
}
