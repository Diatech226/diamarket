const { AsyncLocalStorage } = require('node:async_hooks');

const store = new AsyncLocalStorage();

function runWithContext(context, fn) {
  return store.run(context, fn);
}

function getRequestContext() {
  return store.getStore() || null;
}

function getCorrelationId() {
  return getRequestContext()?.correlationId || null;
}

module.exports = {
  runWithContext,
  getRequestContext,
  getCorrelationId,
};
