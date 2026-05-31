const DEFAULT_BASE_URL = 'https://api.exchangerate.host/latest';

function normalizeCurrency(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().toLowerCase();
}

function dedupeSymbols(symbols) {
  const seen = new Set();
  const normalized = [];

  for (const symbol of symbols) {
    const value = normalizeCurrency(symbol);
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    normalized.push(value);
  }

  return normalized;
}

class HttpFxProvider {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
    this.apiKey = options.apiKey || '';
    this.timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : undefined;
  }

  async fetchLatestRates(baseCurrency, quoteCurrencies = []) {
    const base = normalizeCurrency(baseCurrency);
    const symbols = dedupeSymbols(Array.isArray(quoteCurrencies) ? quoteCurrencies : []);

    if (!base || symbols.length === 0) {
      return [];
    }

    const url = new URL(this.baseUrl);
    url.searchParams.set('base', base);
    url.searchParams.set('symbols', symbols.join(','));

    const controller = this.timeoutMs ? new AbortController() : null;
    let timeout;

    if (controller) {
      timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    }

    try {
      const headers = this.apiKey ? { apikey: this.apiKey } : undefined;
      const response = await fetch(url, {
        headers,
        signal: controller?.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch FX rates: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      const fetchedAt = payload?.date ? new Date(payload.date) : new Date();

      return symbols
        .map((quoteCurrency) => {
          const upper = quoteCurrency.toUpperCase();
          const lower = quoteCurrency.toLowerCase();
          const value = payload?.rates?.[upper] ?? payload?.rates?.[lower];
          if (typeof value !== 'number') {
            return null;
          }
          return {
            baseCurrency: base,
            quoteCurrency,
            rate: value,
            fetchedAt,
          };
        })
        .filter(Boolean);
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }
}

module.exports = {
  HttpFxProvider,
};
