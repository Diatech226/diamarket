const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('/api/users/me remains protected by requireAuth and returns stable user payload shape', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'routes', 'user.js'), 'utf8');

  assert.match(source, /router\.get\('\/me',\s*requireAuth,\s*async \(req, res\) =>/);
  assert.match(source, /success\(res,\s*user,\s*\{\s*meta:\s*\{\s*identity\s*\}/);
  assert.match(source, /legacy:\s*\{\s*\.\.\.user,\s*user,\s*identity\s*\}/);
});
