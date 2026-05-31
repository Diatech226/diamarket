const test = require('node:test');
const assert = require('node:assert/strict');

const quotesRouter = require('../routes/quotes');
const quoteController = require('../controllers/quoteController');

function findRoute(path, method) {
  return quotesRouter.stack.find((layer) => (
    layer.route
    && layer.route.path === path
    && layer.route.methods?.[method]
  ));
}

test('quotes router exposes estimate/create/meta endpoints on expected paths', () => {
  const estimateRoute = findRoute('/estimate', 'post');
  const createRoute = findRoute('/', 'post');
  const metaRoute = findRoute('/meta', 'get');

  assert.ok(estimateRoute, 'POST /api/quotes/estimate route should exist');
  assert.ok(createRoute, 'POST /api/quotes route should exist');
  assert.ok(metaRoute, 'GET /api/quotes/meta route should exist');

  const estimateHandler = estimateRoute.route.stack.at(-1)?.handle;
  const createHandler = createRoute.route.stack.at(-1)?.handle;
  const metaHandler = metaRoute.route.stack.at(-1)?.handle;

  assert.equal(estimateHandler, quoteController.estimateQuote);
  assert.equal(createHandler, quoteController.createQuote);
  assert.equal(metaHandler, quoteController.getQuoteMeta);
});
