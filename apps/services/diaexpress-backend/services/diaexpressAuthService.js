const fs = require('fs');
const crypto = require('crypto');
const { createClerkClient, verifyToken } = require('@clerk/backend');
const { logger } = require('../src/shared/observability/logger');

const config = require('../config/diaexpressAuth');

const tokenRegistry = new Map();
const clientRegistry = new Map();
let initialised = false;

const clerkState = {
  client: null,
  initialised: false,
  verifyOptions: null,
  templateCandidates: [],
  secretKey: null,
  unavailableReason: null,
  unavailableDetail: null,
};

function toStringList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function uniqueList(values = []) {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean),
    ),
  );
}

function readEnvFlag(name) {
  return Boolean(typeof process.env[name] === 'string' && process.env[name].trim());
}

function getClerkEnvDiagnostics() {
  return {
    sdkLoaded: typeof createClerkClient === 'function' && typeof verifyToken === 'function',
    secretKeyPresent: readEnvFlag('CLERK_SECRET_KEY') || readEnvFlag('CLERK_API_KEY'),
    publishableKeyPresent: readEnvFlag('CLERK_PUBLISHABLE_KEY') || readEnvFlag('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
    webhookSecretPresent: readEnvFlag('CLERK_WEBHOOK_SECRET'),
    issuerConfigured: readEnvFlag('CLERK_JWT_ISSUER') || readEnvFlag('CLERK_ISSUER'),
    audienceConfigured:
      readEnvFlag('CLERK_JWT_AUDIENCES') || readEnvFlag('CLERK_JWT_AUDIENCE') || readEnvFlag('CLERK_AUDIENCE'),
    authorizedPartiesConfigured: readEnvFlag('CLERK_AUTHORIZED_PARTIES') || readEnvFlag('CLERK_ALLOWED_ORIGINS'),
  };
}

function logClerkDiagnostic(level, message, details = {}) {
  const payload = {
    ...getClerkEnvDiagnostics(),
    template: resolveCanonicalClerkTemplate(),
    ...details,
  };

  if (level === 'error') {
    logger.error('auth.clerk', message, payload);
    return;
  }

  if (level === 'warn') {
    logger.warn('auth.clerk', message, payload);
    return;
  }

  logger.info('auth.clerk', message, payload);
}

function classifyClerkError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  if (message.includes('expired') || message.includes('exp claim')) {
    return 'expired_token';
  }

  if (
    message.includes('network') ||
    message.includes('fetch failed') ||
    message.includes('econn') ||
    message.includes('etimedout') ||
    message.includes('timeout') ||
    message.includes('enotfound')
  ) {
    return 'clerk_network_failure';
  }

  return 'invalid_token';
}



function resolveCanonicalClerkTemplate() {
  const explicit = uniqueList([
    process.env.DIAEXPRESS_CLERK_JWT_TEMPLATE,
    process.env.CMS_CLERK_JWT_TEMPLATE,
    process.env.CLERK_JWT_TEMPLATE,
    process.env.CLERK_JWT_TEMPLATE_NAME,
    process.env.CLERK_TEMPLATE,
  ]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean));

  if (explicit.length) {
    return explicit[0];
  }

  return 'diaexpress-backend';
}

function resolveLegacyTemplateCandidates(canonicalTemplate) {
  const allowLegacy = isTruthyFlag(process.env.DIAEXPRESS_ALLOW_LEGACY_CLERK_TEMPLATES);
  if (!allowLegacy) {
    return [];
  }

  const candidates = uniqueList([
    ...toStringList(process.env.CLERK_JWT_TEMPLATE_CANDIDATES),
    ...toStringList(process.env.DIAEXPRESS_CLERK_JWT_TEMPLATE_CANDIDATES),
    process.env.CLERK_TOKEN_TEMPLATE,
    process.env.DIAEXPRESS_CLERK_TEMPLATE,
    'backend',
  ]);

  return candidates.filter((entry) => entry !== canonicalTemplate);
}
function isTruthyFlag(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) && value === 1;
  }

  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    if (!normalised) {
      return false;
    }
    return ['true', '1', 'yes', 'y', 'on'].includes(normalised);
  }

  return false;
}

function collectRoleValues(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return toStringList(value);
  }

  if (typeof value === 'number') {
    const coerced = String(value).trim();
    return coerced ? [coerced] : [];
  }

  return [];
}

function collectRolesFromObject(source = {}) {
  if (!source || typeof source !== 'object') {
    return [];
  }

  return Object.entries(source)
    .filter(([key]) => typeof key === 'string' && key.toLowerCase().includes('role'))
    .flatMap(([, value]) => collectRoleValues(value));
}

function collectClerkRoles(sessionClaims, user) {
  const candidates = [];

  candidates.push(
    ...collectRoleValues(user?.publicMetadata?.role),
    ...collectRoleValues(user?.publicMetadata?.roles),
    ...collectRoleValues(user?.privateMetadata?.role),
    ...collectRoleValues(user?.privateMetadata?.roles),
    ...collectRoleValues(sessionClaims?.role),
    ...collectRoleValues(sessionClaims?.roles),
    ...collectRoleValues(sessionClaims?.org_role),
    ...collectRoleValues(sessionClaims?.org_roles),
    ...collectRoleValues(sessionClaims?.public_metadata?.role),
    ...collectRoleValues(sessionClaims?.public_metadata?.roles),
    ...collectRoleValues(sessionClaims?.private_metadata?.role),
    ...collectRoleValues(sessionClaims?.private_metadata?.roles),
    ...collectRoleValues(sessionClaims?.metadata?.role),
    ...collectRoleValues(sessionClaims?.metadata?.roles),
  );

  candidates.push(...collectRolesFromObject(sessionClaims));

  const normalised = uniqueList(candidates);

  const hasAdminRole = normalised.some((role) => role.toLowerCase() === 'admin');
  if (!hasAdminRole) {
    const adminFlag =
      isTruthyFlag(user?.publicMetadata?.isAdmin) ||
      isTruthyFlag(user?.privateMetadata?.isAdmin) ||
      isTruthyFlag(sessionClaims?.isAdmin) ||
      isTruthyFlag(sessionClaims?.metadata?.isAdmin) ||
      isTruthyFlag(sessionClaims?.public_metadata?.isAdmin) ||
      isTruthyFlag(sessionClaims?.private_metadata?.isAdmin);

    if (adminFlag) {
      normalised.push('admin');
    }
  }

  return normalised;
}

function normaliseRoles(entry) {
  const roles = uniqueList([
    ...(Array.isArray(entry.roles) ? entry.roles : []),
    ...(entry.role ? [entry.role] : []),
  ]);
  return roles;
}

function normaliseScopes(entry) {
  const scopes = uniqueList(
    Array.isArray(entry.scopes)
      ? entry.scopes
      : entry.scopes
      ? String(entry.scopes)
          .split('|')
          .map((scope) => scope.trim())
      : [],
  );
  return scopes;
}

function buildDescriptor(entry) {
  if (!entry || !entry.subject) {
    return null;
  }

  const roles = normaliseRoles(entry);
  const scopes = normaliseScopes(entry);
  const lowercaseRoles = new Set(roles.map((role) => role.toLowerCase()));
  const lowercaseScopes = new Set(scopes.map((scope) => scope.toLowerCase()));

  return {
    type: entry.type || 'service',
    subject: entry.subject,
    principalId: entry.subject,
    roles,
    role: roles[0] || null,
    lowercaseRoles,
    scopes,
    lowercaseScopes,
    label: entry.label || null,
    email: entry.email || null,
    metadata: entry.metadata || {},
    source: entry.source || 'config',
  };
}

function registerToken(token, entry, { expiresAt = Infinity, issuedAt = Date.now(), source } = {}) {
  const descriptor = buildDescriptor({ ...entry, source: source || entry.source });
  if (!token || !descriptor) {
    return;
  }

  tokenRegistry.set(token, {
    token,
    descriptor,
    expiresAt,
    issuedAt,
  });
}

function registerStaticTokens() {
  config.tokens.forEach((tokenConfig) => {
    registerToken(tokenConfig.token, tokenConfig, { source: 'config' });
  });
}

function registerClients() {
  config.clients.forEach((clientConfig) => {
    if (!clientConfig.clientId || !clientConfig.clientSecret) {
      return;
    }
    clientRegistry.set(clientConfig.clientId, {
      ...clientConfig,
      roles: normaliseRoles(clientConfig),
      scopes: normaliseScopes(clientConfig),
    });
  });
}

function loadSandboxTokens() {
  if (!config.sandbox?.enabled || !config.sandbox.fixture) {
    return;
  }

  try {
    const fileContent = fs.readFileSync(config.sandbox.fixture, 'utf8');
    const payload = JSON.parse(fileContent);
    (payload.tokens || []).forEach((tokenEntry) => {
      registerToken(tokenEntry.token, { ...tokenEntry, source: 'sandbox' });
    });
  } catch (error) {
    console.warn('Unable to load DiaExpress sandbox tokens:', error.message || error);
  }
}

function ensureInitialised() {
  if (initialised) {
    return;
  }

  registerStaticTokens();
  registerClients();
  loadSandboxTokens();
  initialised = true;
}

function getClerkClient() {
  if (clerkState.initialised) {
    return clerkState.client;
  }

  clerkState.initialised = true;
  clerkState.unavailableReason = null;
  clerkState.unavailableDetail = null;

  const secretKey = (process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY || '').trim();
  logClerkDiagnostic('info', 'Clerk backend runtime check started');

  if (!secretKey) {
    clerkState.unavailableReason = 'missing_clerk_secret_key';
    clerkState.unavailableDetail = 'CLERK_SECRET_KEY is not configured in the backend environment';
    logClerkDiagnostic('warn', 'Clerk backend client not initialized: missing secret key', {
      missingEnv: ['CLERK_SECRET_KEY'],
    });
    return null;
  }

  try {
    clerkState.client = createClerkClient({ secretKey });
    clerkState.secretKey = secretKey;
    logClerkDiagnostic('info', 'Clerk backend client initialized');
  } catch (error) {
    clerkState.unavailableReason = 'clerk_initialization_failed';
    clerkState.unavailableDetail = error?.message || String(error);
    logClerkDiagnostic('error', 'Clerk backend client initialization failed', {
      reason: clerkState.unavailableReason,
      detail: clerkState.unavailableDetail,
    });
    clerkState.client = null;
    clerkState.secretKey = null;
  }

  const authorizedParties = toStringList(
    process.env.CLERK_AUTHORIZED_PARTIES || process.env.CLERK_ALLOWED_ORIGINS,
  );
  const audiences = toStringList(
    process.env.CLERK_JWT_AUDIENCES || process.env.CLERK_JWT_AUDIENCE || process.env.CLERK_AUDIENCE,
  );
  const issuer = (process.env.CLERK_JWT_ISSUER || process.env.CLERK_ISSUER || '').trim();

  const verifyOptions = {};
  if (authorizedParties.length) {
    verifyOptions.authorizedParties = authorizedParties;
  }
  if (audiences.length === 1) {
    verifyOptions.audience = audiences[0];
  } else if (audiences.length > 1) {
    verifyOptions.audience = audiences;
  }
  if (issuer) {
    verifyOptions.issuer = issuer;
  }
  verifyOptions.clockSkewInMs = Number(process.env.CLERK_CLOCK_SKEW_MS) || 60_000;

  clerkState.verifyOptions = verifyOptions;

  const canonicalTemplate = resolveCanonicalClerkTemplate();
  const legacyTemplates = resolveLegacyTemplateCandidates(canonicalTemplate);

  clerkState.templateCandidates = uniqueList([canonicalTemplate, ...legacyTemplates]);

  return clerkState.client;
}

async function resolveClerkToken(token) {
  if (!token) {
    return { identity: null, reason: 'missing_token' };
  }

  const client = getClerkClient();
  if (!client) {
    return {
      identity: null,
      reason: clerkState.unavailableReason || 'clerk_initialization_failed',
      detail: clerkState.unavailableDetail,
    };
  }

  const baseVerifyOptions = clerkState.verifyOptions || {};
  const templateCandidates = clerkState.templateCandidates?.length
    ? clerkState.templateCandidates
    : [];

  const attemptedTemplates = [null, ...templateCandidates];
  let lastError = null;

  const secretKey = clerkState.secretKey;
  if (!secretKey) {
    logClerkDiagnostic('warn', 'Clerk JWT verification skipped: secret key missing after initialization');
    return { identity: null, reason: 'missing_clerk_secret_key' };
  }

  for (const template of attemptedTemplates) {
    try {
      const verifyOptions = template
        ? { ...baseVerifyOptions, template }
        : baseVerifyOptions;

      const sessionClaims = await verifyToken(token, {
        ...verifyOptions,
        secretKey,
      });
      const userId = sessionClaims?.sub || sessionClaims?.user_id || sessionClaims?.sid;
      if (!userId) {
        return { identity: null, reason: 'invalid_token' };
      }

      let user = null;
      try {
        user = await client.users.getUser(userId);
      } catch (error) {
        logClerkDiagnostic('warn', 'Clerk user profile fetch failed after JWT verification', {
          reason: classifyClerkError(error) === 'clerk_network_failure' ? 'clerk_network_failure' : 'clerk_user_fetch_failed',
          detail: error?.message || String(error),
        });
      }

      const email =
        user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || null;
      const firstName = user?.firstName || null;
      const lastName = user?.lastName || null;
      const fullName =
        user?.fullName ||
        [firstName, lastName].filter(Boolean).join(' ') ||
        user?.username ||
        email ||
        userId;

      const candidateRoles = collectClerkRoles(sessionClaims, user);

      const roles = candidateRoles.length ? candidateRoles : ['client'];
      const rawPublicScopes = user?.publicMetadata?.scopes;
      const rawPrivateScopes = user?.privateMetadata?.scopes;
      const candidateScopes = uniqueList([
        ...(Array.isArray(rawPublicScopes) ? rawPublicScopes : toStringList(rawPublicScopes)),
        ...(Array.isArray(rawPrivateScopes) ? rawPrivateScopes : toStringList(rawPrivateScopes)),
      ]);
      const scopes = candidateScopes.length
        ? candidateScopes
        : roles.some((role) => String(role).toLowerCase() === 'admin')
        ? ['*']
        : [];
      const metadata = {};

      if (firstName) {
        metadata.firstName = firstName;
      }
      if (lastName) {
        metadata.lastName = lastName;
      }

      const phoneNumber = user?.phoneNumbers?.[0]?.phoneNumber;
      if (phoneNumber) {
        metadata.phone = phoneNumber;
      }

      const companyName =
        user?.publicMetadata?.companyName ||
        user?.publicMetadata?.company?.name ||
        user?.privateMetadata?.companyName ||
        null;
      const jobTitle =
        user?.publicMetadata?.jobTitle ||
        user?.publicMetadata?.company?.jobTitle ||
        user?.privateMetadata?.jobTitle ||
        null;
      if (companyName || jobTitle) {
        metadata.company = {
          ...(companyName ? { name: companyName } : {}),
          ...(jobTitle ? { jobTitle } : {}),
        };
      }

      const issuedAt = sessionClaims?.iat ? sessionClaims.iat * 1000 : Date.now();
      const expiresAt = sessionClaims?.exp ? sessionClaims.exp * 1000 : Infinity;

      registerToken(
        token,
        {
          token,
          subject: userId,
          roles,
          scopes,
          email,
          label: fullName,
          type: 'user',
          metadata,
        },
        { issuedAt, expiresAt, source: template ? `clerk:${template}` : 'clerk' },
      );

      return { identity: resolveBearerToken(token), reason: null };
    } catch (error) {
      lastError = error;
    }
  }

  let failureReason = 'invalid_token';
  if (lastError) {
    failureReason = classifyClerkError(lastError);
    const level = failureReason === 'expired_token' ? 'info' : 'warn';
    logClerkDiagnostic(level, 'Clerk JWT verification failed', {
      reason: failureReason,
      attemptedTemplates: attemptedTemplates.length,
      detail: lastError.message || String(lastError),
    });
  }
  return { identity: null, reason: failureReason };
}

function isExpired(entry) {
  if (!entry) {
    return true;
  }

  if (entry.expiresAt === Infinity) {
    return false;
  }

  return Number.isFinite(entry.expiresAt) && entry.expiresAt <= Date.now();
}

function buildIdentity(entry) {
  if (!entry) {
    return null;
  }

  const expiresAt = entry.expiresAt === Infinity ? null : entry.expiresAt;
  const issuedAt = entry.issuedAt || Date.now();

  return {
    type: entry.descriptor.type,
    subject: entry.descriptor.subject,
    principalId: entry.descriptor.principalId,
    role: entry.descriptor.role,
    roles: entry.descriptor.roles,
    scopes: entry.descriptor.scopes,
    label: entry.descriptor.label,
    email: entry.descriptor.email,
    metadata: entry.descriptor.metadata,
    source: entry.descriptor.source,
    token: entry.token,
    issuedAt: new Date(issuedAt).toISOString(),
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
  };
}

function resolveBearerToken(token) {
  ensureInitialised();
  if (!token) {
    return null;
  }

  const entry = tokenRegistry.get(token);
  if (!entry || isExpired(entry)) {
    if (entry && isExpired(entry)) {
      tokenRegistry.delete(token);
    }
    return null;
  }

  return buildIdentity(entry);
}

function resolveRequestIdentity(req) {
  if (req.identity && req.identity.principalId) {
    return req.identity;
  }

  const header = req.get('authorization') || req.get('Authorization');
  if (!header) {
    return null;
  }

  const parsedAuth = parseAuthorizationHeader(header);
  if (!parsedAuth.ok) {
    return null;
  }

  const identity = resolveBearerToken(parsedAuth.token);
  if (identity) {
    req.identity = identity;
    return identity;
  }

  return null;
}

function ensureRequestIdentity(req) {
  const identity = resolveRequestIdentity(req);
  if (identity) {
    req.identity = identity;
  }
  return identity;
}

function parseAuthorizationHeader(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') {
    return { ok: false, reason: 'missing_token', scheme: null, token: null };
  }

  const trimmed = headerValue.trim();
  if (!trimmed) {
    return { ok: false, reason: 'missing_token', scheme: null, token: null };
  }

  const [scheme, ...rawTokenParts] = trimmed.split(/\s+/);
  const token = rawTokenParts.join(' ').trim();
  if (!scheme || !token) {
    return { ok: false, reason: 'malformed_authorization_header', scheme: scheme || null, token: null };
  }

  if (scheme.toLowerCase() !== 'bearer') {
    return { ok: false, reason: 'unsupported_authorization_scheme', scheme, token: null };
  }

  return { ok: true, reason: null, scheme: 'Bearer', token };
}

async function ensureRequestIdentityAsync(req) {
  const current = ensureRequestIdentity(req);
  if (current) {
    req.authFailureReason = null;
    return { identity: current, user: null, reason: null };
  }

  const header = req.get('authorization') || req.get('Authorization');
  if (!header) {
    req.authFailureReason = 'missing_token';
    return { identity: null, user: null, reason: 'missing_token' };
  }

  const parsedAuth = parseAuthorizationHeader(header);
  if (!parsedAuth.ok) {
    const reason = parsedAuth.reason || 'missing_identity';
    req.authFailureReason = reason;
    return { identity: null, user: null, reason };
  }

  const result = await resolveClerkToken(parsedAuth.token);
  const identity = result?.identity || null;
  const reason = result?.reason || (identity ? null : 'invalid_token');

  if (identity) {
    req.identity = identity;
    req.authFailureReason = null;
    return { identity, user: null, reason: null };
  }

  req.authFailureReason = reason || 'missing_identity';
  return { identity: null, user: null, reason: req.authFailureReason };
}

function getAuthRuntimeStatus() {
  const secretKey = (process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY || '').trim();
  const canonicalTemplate = resolveCanonicalClerkTemplate();
  const diagnostics = getClerkEnvDiagnostics();
  const missingEnv = [];
  if (!diagnostics.secretKeyPresent) missingEnv.push('CLERK_SECRET_KEY');

  return {
    enabled: Boolean(secretKey),
    provider: secretKey ? 'clerk' : 'token_registry',
    template: canonicalTemplate,
    missingEnv,
    diagnostics,
  };
}

function identityHasRole(identity, role) {
  if (!role) {
    return true;
  }
  if (!identity) {
    return false;
  }

  const requestedRole = role.toLowerCase();
  const roles = new Set(
    [identity.role, ...(identity.roles || [])]
      .map((value) => (value ? String(value).toLowerCase() : ''))
      .filter(Boolean),
  );

  return roles.has(requestedRole) || roles.has('admin');
}

function identityHasScope(identity, scope) {
  if (!scope) {
    return true;
  }

  if (!identity) {
    return false;
  }

  const loweredScope = scope.toLowerCase();
  const scopes = new Set(
    (identity.scopes || [])
      .map((value) => (value ? String(value).toLowerCase() : ''))
      .filter(Boolean),
  );

  return scopes.has(loweredScope) || scopes.has('*');
}

function parseBasicCredentials(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') {
    return null;
  }

  const trimmed = headerValue.trim();
  if (!trimmed.toLowerCase().startsWith('basic ')) {
    return null;
  }

  const encoded = trimmed.slice(6).trim();
  if (!encoded) {
    return null;
  }

  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex === -1) {
      return { clientId: decoded, clientSecret: '' };
    }
    return {
      clientId: decoded.slice(0, separatorIndex),
      clientSecret: decoded.slice(separatorIndex + 1),
    };
  } catch (error) {
    return null;
  }
}

function issueClientToken(clientId, clientSecret) {
  ensureInitialised();
  const client = clientRegistry.get(clientId);
  if (!client || client.clientSecret !== clientSecret) {
    const error = new Error('Invalid client credentials');
    error.code = 'INVALID_CLIENT';
    throw error;
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();
  const ttl = Number.isFinite(client.expiresIn) && client.expiresIn > 0
    ? client.expiresIn * 1000
    : config.tokenTTLSeconds * 1000;
  const expiresAt = now + ttl;

  registerToken(token, {
    subject: client.subject,
    roles: client.roles,
    email: client.email,
    label: client.label,
    scopes: client.scopes,
    type: client.type || 'client',
    metadata: client.metadata,
  }, { expiresAt, issuedAt: now, source: 'issued' });

  const identity = resolveBearerToken(token);
  return {
    token,
    tokenType: 'Bearer',
    expiresIn: Math.round(ttl / 1000),
    identity,
  };
}

module.exports = {
  ensureRequestIdentity,
  ensureRequestIdentityAsync,
  resolveRequestIdentity,
  identityHasRole,
  identityHasScope,
  issueClientToken,
  parseBasicCredentials,
  parseAuthorizationHeader,
  getAuthRuntimeStatus,
};
