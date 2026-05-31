const DOMAIN_REGISTRY = Object.freeze({
  identity: {
    module: 'identity',
    owner: 'Identity Team',
    entities: ['User', 'AuthSession'],
  },
  quote: {
    module: 'quote',
    owner: 'Commercial Ops Team',
    entities: ['Quote', 'QuoteReview'],
  },
  pricing: {
    module: 'pricing',
    owner: 'Pricing Team',
    entities: ['Pricing', 'ExternalPricing'],
  },
  shipment: {
    module: 'shipment',
    owner: 'Logistics Ops Team',
    entities: ['Shipment', 'Reservation', 'Schedule'],
  },
  tracking: {
    module: 'tracking',
    owner: 'Logistics Ops Team',
    entities: ['ShipmentHistory'],
  },
  network: {
    module: 'network',
    owner: 'Master Data Team',
    entities: ['Country', 'MarketPoint', 'TransportLine', 'ExpeditionLine', 'Embarkment', 'Address'],
  },
  operations: {
    module: 'operations',
    owner: 'Logistics Operations Planning Team',
    entities: ['Reservation', 'Schedule', 'OperationalException'],
  },
  payment: {
    module: 'payment',
    owner: 'Finance Team',
    entities: ['Payment', 'CryptoTransaction'],
  },
  notification: {
    module: 'notification',
    owner: 'Comms Team',
    entities: ['Notification'],
  },
  document: {
    module: 'document',
    owner: 'Operations Team',
    entities: ['Upload'],
  },
});

module.exports = {
  DOMAIN_REGISTRY,
};
