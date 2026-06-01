const toTrimmedString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const uniqueList = (values = []) => Array.from(new Set(values.filter(Boolean)));

const env = typeof process !== 'undefined' && process?.env ? process.env : {};

const canonicalTemplate =
  toTrimmedString(env.NEXT_PUBLIC_DIAEXPRESS_CLERK_JWT_TEMPLATE) ||
  toTrimmedString(env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE) ||
  'diaexpress-backend';

const allowLegacyTemplates = ['true', '1', 'yes', 'on'].includes(
  toTrimmedString(env.NEXT_PUBLIC_DIAEXPRESS_ALLOW_LEGACY_CLERK_TEMPLATES).toLowerCase(),
);

const legacyTemplateCandidates = allowLegacyTemplates
  ? uniqueList([
      toTrimmedString(env.NEXT_PUBLIC_DIAEXPRESS_CLERK_TEMPLATE),
      toTrimmedString(env.NEXT_PUBLIC_CLERK_TEMPLATE),
      'backend',
    ]).filter((entry) => entry !== canonicalTemplate)
  : [];

const templateCandidates = [canonicalTemplate, ...legacyTemplateCandidates];

const tryGetToken = async (getToken, options) => {
  if (typeof getToken !== 'function') {
    return null;
  }

  try {
    const token = await getToken(options);
    return token || null;
  } catch (_error) {
    return null;
  }
};

export const resolveAuthToken = async (getToken, options = {}) => {
  if (typeof getToken !== 'function') {
    return null;
  }

  const baseOptions = { ...options };
  delete baseOptions.template;

  for (const template of templateCandidates) {
    const candidateOptions = { ...baseOptions, template };
    const token = await tryGetToken(getToken, candidateOptions);
    if (token) {
      return token;
    }
  }

  return null;
};

export const buildAuthHeaders = async (getToken, headers = {}, options = {}) => {
  const token = await resolveAuthToken(getToken, options);
  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};
