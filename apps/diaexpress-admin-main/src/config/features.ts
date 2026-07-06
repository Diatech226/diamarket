const enabledValues = ['true', '1', 'yes', 'on'];

export function isFeatureEnabled(rawValue: string | undefined, defaultValue = false) {
  if (rawValue === undefined) {
    return defaultValue;
  }

  return enabledValues.includes(rawValue.trim().toLowerCase());
}

export const isDiaPayEnabled = isFeatureEnabled(process.env.NEXT_PUBLIC_ENABLE_DIAPAY, false);
