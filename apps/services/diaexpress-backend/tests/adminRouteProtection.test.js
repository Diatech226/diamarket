const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ADMIN_ROUTE_FILES = [
  'routes/v1/admin.js',
  'routes/logisticsAdmin.js',
  'routes/adminQuotes.js',
  'routes/marketPoints.js',
];

const guardPattern = /router\.use\(\s*requireAuth\s*,\s*requireRole\(['"]admin['"]\)\s*\)/;

test('all CMS/admin routers enforce auth + admin role guard', () => {
  ADMIN_ROUTE_FILES.forEach((relativePath) => {
    const absolutePath = path.join(__dirname, '..', relativePath);
    const source = fs.readFileSync(absolutePath, 'utf8');

    assert.match(
      source,
      guardPattern,
      `${relativePath} must enforce requireAuth + requireRole('admin')`,
    );
  });
});
