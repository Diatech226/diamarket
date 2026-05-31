const { EventEmitter } = require('events');
const { logger } = require('../observability/logger');
const { metrics } = require('../observability/metrics');

class DomainEventBus {
  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  publish(event) {
    this.emitter.emit(event.name, event);
    this.emitter.emit('*', event);
  }

  subscribe(eventName, handler) {
    const wrappedHandler = async (event) => {
      try {
        await handler(event);
      } catch (error) {
        metrics.increment('domain_event_handler_failures', 1, { eventName });
        logger.error('errors', 'domain_event.handler_failed', {
          eventName,
          eventId: event?.eventId,
          category: 'event_handler_failure',
          errorMessage: error?.message,
        });
      }
    };

    this.emitter.on(eventName, wrappedHandler);
    return () => this.emitter.off(eventName, wrappedHandler);
  }
}

module.exports = {
  DomainEventBus,
};
