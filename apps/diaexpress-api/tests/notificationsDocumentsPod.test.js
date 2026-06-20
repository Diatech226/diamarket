const assert = require('assert');
const { renderTemplate, templates } = require('../services/notificationTemplates');
const { NOTIFICATION_EVENTS, STATUS_EVENT_MAP } = require('../src/lib/events/notificationEvents');
const ShipmentDocument = require('../models/ShipmentDocument');

assert.ok(NOTIFICATION_EVENTS.QuoteSubmitted);
assert.strictEqual(STATUS_EVENT_MAP.delivered, 'ShipmentDelivered');
assert.strictEqual(renderTemplate('shipment_delivered').title, 'Colis livré');
['quote_submitted','quote_approved','shipment_created','shipment_delivered','delivery_failed'].forEach((key)=>assert.ok(templates[key]));
assert.ok(ShipmentDocument.DOCUMENT_TYPES.includes('pickup_proof'));
assert.ok(ShipmentDocument.DOCUMENT_TYPES.includes('delivery_proof'));
assert.ok(ShipmentDocument.DOCUMENT_VISIBILITIES.includes('admin_only'));
console.log('notificationsDocumentsPod.test.js passed');
