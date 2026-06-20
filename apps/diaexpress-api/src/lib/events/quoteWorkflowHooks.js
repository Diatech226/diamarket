const { publishDomainEvent } = require('./domainEventPublisher');

const emitQuoteWorkflowHook = async (eventName, payload = {}) => {
  try {
    await publishDomainEvent(eventName, {
      aggregateType: 'Quote',
      aggregateId: payload.quoteId ? String(payload.quoteId) : null,
      occurredAt: new Date().toISOString(),
      ...payload,
    });
  } catch (_error) {
    // Notification transports are intentionally not wired yet; hooks must stay non-blocking.
  }
};

module.exports = {
  emitQuoteWorkflowHook,
  QuoteSubmitted: (payload) => emitQuoteWorkflowHook('QuoteSubmitted', payload),
  QuoteInfoRequested: (payload) => emitQuoteWorkflowHook('QuoteInfoRequested', payload),
  QuoteApproved: (payload) => emitQuoteWorkflowHook('QuoteApproved', payload),
  QuoteRejected: (payload) => emitQuoteWorkflowHook('QuoteRejected', payload),
  QuoteConverted: (payload) => emitQuoteWorkflowHook('QuoteConverted', payload),
};
