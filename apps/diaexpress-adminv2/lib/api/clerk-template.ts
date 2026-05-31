const DEFAULT_TEMPLATE = 'diaexpress-backend';

const TEMPLATE_KEYS = [
  'NEXT_PUBLIC_BACKEND_JWT_TEMPLATE',
  'NEXT_PUBLIC_DIAEXPRESS_CLERK_JWT_TEMPLATE',
  'NEXT_PUBLIC_CLERK_JWT_TEMPLATE',
  'NEXT_PUBLIC_CLERK_TEMPLATE',
  'BACKEND_JWT_TEMPLATE',
  'DIAEXPRESS_CLERK_JWT_TEMPLATE',
  'CLERK_JWT_TEMPLATE',
  'CLERK_TEMPLATE',
] as const;

function readEnvValue(key: string) {
  const value = process.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveClerkJwtTemplate() {
  for (const key of TEMPLATE_KEYS) {
    const value = readEnvValue(key);
    if (value) {
      return value;
    }
  }

  return DEFAULT_TEMPLATE;
}

export function getClerkJwtTemplateCandidates() {
  return [...TEMPLATE_KEYS];
}

export const CLERK_DEFAULT_JWT_TEMPLATE = DEFAULT_TEMPLATE;
