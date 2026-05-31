const { test } = require('node:test');
const assert = require('node:assert');

const { parseMongoUri, normalizeMongoUri } = require('../config/db');
const { validateStartupConfig } = require('../config/startupValidation');

test('ALLOW_DEGRADED_MODE defaults to false when absent', () => {
  const profile = validateStartupConfig(
    { MONGODB_URI: 'mongodb+srv://user:pass@cluster0.mongodb.net/diaexpress?retryWrites=true&w=majority', CORS_ORIGINS: 'http://localhost:3000' },
    { runtime: { environment: 'development' } },
  );

  assert.strictEqual(profile.degradedAllowed, false);
});

test('MONGODB_ALLOW_LOCAL_FALLBACK defaults to false when absent', () => {
  const profile = validateStartupConfig(
    { MONGODB_URI: 'mongodb+srv://user:pass@cluster0.mongodb.net/diaexpress?retryWrites=true&w=majority' },
    { runtime: { environment: 'development' } },
  );

  assert.strictEqual(profile.localFallbackAllowed, false);
});

test('ALLOW_DEGRADED_MODE is true only when explicitly enabled', () => {
  const profile = validateStartupConfig(
    { ALLOW_DEGRADED_MODE: 'true', MONGODB_URI: 'mongodb://127.0.0.1:27017/diaexpress' },
    { runtime: { environment: 'development' } },
  );

  assert.strictEqual(profile.degradedAllowed, true);
});

test('MONGODB_LOCAL_URI rejects Atlas SRV URIs with clear guidance', () => {
  assert.throws(
    () => validateStartupConfig(
      { MONGODB_LOCAL_URI: 'mongodb+srv://user:pass@cluster0.mongodb.net/diaexpress' },
      { runtime: { environment: 'development' } },
    ),
    /MONGODB_LOCAL_URI must be a local mongodb:\/\/ URI\. Use MONGODB_URI for Atlas\./,
  );
});


test('MONGODB_URI is required at startup in development', () => {
  assert.throws(
    () => validateStartupConfig(
      { CORS_ORIGINS: 'http://localhost:3000' },
      { runtime: { environment: 'development' } },
    ),
    /Missing required config: MONGODB_URI/,
  );
});

test('startup validation rejects MONGODB_URI without a database name', () => {
  assert.throws(
    () => validateStartupConfig(
      { MONGODB_URI: 'mongodb+srv://user:pass@cluster0.mongodb.net/?retryWrites=true&w=majority' },
      { runtime: { environment: 'development' } },
    ),
    /Database name is required in URI path/,
  );
});

test('startup validation reports local URI issues when fallback is disabled too', () => {
  assert.throws(
    () => validateStartupConfig(
      {
        MONGODB_URI: 'mongodb+srv://user:pass@cluster0.mongodb.net/diaexpress?retryWrites=true&w=majority',
        MONGODB_LOCAL_URI: 'mongodb://127.0.0.1:27017',
        MONGODB_ALLOW_LOCAL_FALLBACK: 'false',
      },
      { runtime: { environment: 'development' } },
    ),
    /Database name is required in URI path/,
  );
});

test('MONGODB_URI requires a database name', () => {
  const result = parseMongoUri('mongodb+srv://user:pass@cluster0.mongodb.net/?retryWrites=true&w=majority');

  assert.strictEqual(result.valid, false);
  assert.deepStrictEqual(result.issues.map((issue) => issue.code), ['MISSING_DB_NAME']);
});

test('valid MongoDB URI preserves database path and query parameters', () => {
  const uri = 'mongodb+srv://user:pass@cluster0.mongodb.net/diaexpress?retryWrites=true&w=majority&appName=Cluster0';
  const result = normalizeMongoUri(uri);

  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.uri, uri);
});

test('local fallback URI must use mongodb protocol', () => {
  const result = parseMongoUri('mongodb+srv://user:pass@cluster0.mongodb.net/diaexpress', {
    allowSrv: false,
    label: 'MONGODB_LOCAL_URI',
  });

  assert.strictEqual(result.valid, false);
  assert.deepStrictEqual(result.issues.map((issue) => issue.code), ['LOCAL_URI_MUST_NOT_BE_SRV']);
});
