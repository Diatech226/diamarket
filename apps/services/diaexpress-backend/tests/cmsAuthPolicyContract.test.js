const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('legacy CMS middleware does not hardcode forced admin email', () => {
  const middlewareSource = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'apps', 'diaexpress-admin', 'middleware.ts'),
    'utf8',
  );

  assert.doesNotMatch(middlewareSource, /zcedric121@gmail\.com/);
  assert.match(middlewareSource, /NEXT_PUBLIC_CMS_ADMIN_EMAIL/);
});
