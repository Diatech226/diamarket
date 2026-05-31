const crypto = require('crypto');
const { DomainEventBus } = require('./domainEventBus');
const { getRequestContext } = require('../observability/requestContext');
const { logger } = require('../observability/logger');
const { metrics } = require('../observability/metrics');

const bus = new DomainEventBus();

function publishDomainEvent(name, payload, options = {}) {
  const context = getRequestContext();
  const event = {
    eventId: crypto.randomUUID(),
    name,
    payload,
    occurredAt: new Date().toISOString(),
    version: options.version || 1,
    metadata: {
      ...(options.metadata || {}),
      correlationId: options.metadata?.correlationId || context?.correlationId || null,
      requestId: options.metadata?.requestId || context?.requestId || null,
    },
  };

  try {
    bus.publish(event);
    metrics.increment('domain_event_published', 1, { eventName: name });
    logger.info('tracking', 'domain_event.published', { eventName: name, eventId: event.eventId });
  } catch (error) {
    metrics.increment('domain_event_publish_failures', 1, { eventName: name });
    logger.error('errors', 'domain_event.publish_failed', {
      eventName: name,
      errorMessage: error?.message,
      eventId: event.eventId,
    });
    throw error;
  }
  return event;
}

function subscribeDomainEvent(name, handler) {
  return bus.subscribe(name, handler);
}

module.exports = {
  publishDomainEvent,
  subscribeDomainEvent,
};
