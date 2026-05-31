const CLERK_DEV_KEYLESS_FLAG = 'NEXT_PUBLIC_CLERK_ENABLE_KEYLESS';

const REQUIRED_PUBLIC_KEYS = ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'] as const;
const REQUIRED_SERVER_KEYS = ['CLERK_SECRET_KEY'] as const;

type ClerkRuntimeConfig = {
  enabled: boolean;
  keyless: boolean;
  missingPublicKeys: string[];
  missingServerKeys: string[];
  missingKeys: string[];
  publishableKey: string | null;
  secretKey: string | null;
  usingPublishableKeyAlias: boolean;
  diagnostics: {
    clerkSdkExpected: boolean;
    publishableKeyPresent: boolean;
    legacyPublishableKeyPresent: boolean;
    secretKeyPresent: boolean;
  };
};

function readEnv(name: string): string | null {
  const value = process.env[name];
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function isKeylessExplicitlyEnabled() {
  return readEnv(CLERK_DEV_KEYLESS_FLAG) === 'true';
}

let hasLoggedMissingConfig = false;
let hasLoggedRuntimeConfig = false;

function logMissingClerkConfigOnce(config: ClerkRuntimeConfig) {
  if (process.env.NODE_ENV === 'production' || hasLoggedMissingConfig || config.enabled) {
    return;
  }

  hasLoggedMissingConfig = true;
  console.warn(
    `[adminv2/env] Clerk auth disabled due to missing env: ${config.missingKeys.join(', ')}. ` +
      `Set ${REQUIRED_PUBLIC_KEYS.join(', ')} and ${REQUIRED_SERVER_KEYS.join(', ')}. ` +
      `Keyless mode is OFF by default. To opt in explicitly for development, set ${CLERK_DEV_KEYLESS_FLAG}=true.`
  );
}

function logRuntimeConfigOnce(config: ClerkRuntimeConfig) {
  if (process.env.NODE_ENV === 'production' || hasLoggedRuntimeConfig) {
    return;
  }

  hasLoggedRuntimeConfig = true;
  console.info('[adminv2/env] Clerk runtime diagnostics', {
    enabled: config.enabled,
    keyless: config.keyless,
    missingKeys: config.missingKeys,
    usingPublishableKeyAlias: config.usingPublishableKeyAlias,
    ...config.diagnostics,
  });
}

export function getClerkRuntimeConfig(): ClerkRuntimeConfig {
  const canonicalPublishableKey = readEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  const legacyPublishableKey = readEnv('CLERK_PUBLISHABLE_KEY');
  const publishableKey = canonicalPublishableKey || legacyPublishableKey;
  const secretKey = readEnv('CLERK_SECRET_KEY');

  const keyless = isKeylessExplicitlyEnabled();
  const missingPublicKeys = REQUIRED_PUBLIC_KEYS.filter((key) => !readEnv(key));
  const effectiveMissingPublicKeys = publishableKey ? [] : missingPublicKeys;
  const missingServerKeys = REQUIRED_SERVER_KEYS.filter((key) => !readEnv(key));

  const missingKeys = keyless
    ? missingServerKeys
    : [...effectiveMissingPublicKeys, ...missingServerKeys];

  const enabled = missingKeys.length === 0;
  const config: ClerkRuntimeConfig = {
    enabled,
    keyless,
    missingPublicKeys: effectiveMissingPublicKeys,
    missingServerKeys,
    missingKeys,
    publishableKey,
    secretKey,
    usingPublishableKeyAlias: Boolean(!canonicalPublishableKey && legacyPublishableKey),
    diagnostics: {
      clerkSdkExpected: true,
      publishableKeyPresent: Boolean(canonicalPublishableKey),
      legacyPublishableKeyPresent: Boolean(legacyPublishableKey),
      secretKeyPresent: Boolean(secretKey),
    },
  };

  logMissingClerkConfigOnce(config);
  logRuntimeConfigOnce(config);
  return config;
}

export function getMissingClerkEnvKeys() {
  return getClerkRuntimeConfig().missingKeys;
}

export function isClerkAuthEnabled() {
  return getClerkRuntimeConfig().enabled;
}
