const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { assignShipment, transitionReturn } = require('../services/operationsIncidentService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateBody, validators } = require('../middleware/validate');
const documents = require('../controllers/shipmentDocumentsController');

const SHIPMENT_STATUSES = [
  'draft',
  'created',
  'pending_dispatch',
  'scheduled',
  'in_transit',
  'delayed',
  'at_hub',
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'returned',
  'cancelled',
];

router.post('/from-quote', requireAuth, requireRole('admin'), validateBody([{ field: 'quoteId', checks: [{ fn: validators.required, message: 'quoteId is required' }, { fn: validators.objectId, message: 'quoteId must be an objectId' }] }]), shipmentController.createFromQuote);
router.post('/create-from-quote', requireAuth, requireRole('admin'), shipmentController.createFromQuote);
router.get('/me', requireAuth, shipmentController.getMine);
router.get('/dashboard', requireAuth, requireRole('admin'), shipmentController.dashboard);
router.get('/', requireAuth, requireRole('admin'), shipmentController.getAll);

router.get('/:id/documents', requireAuth, documents.clientList);
router.get('/:id/documents/admin', requireAuth, requireRole('admin'), documents.adminList);
router.post('/:id/documents', requireAuth, requireRole('admin'), documents.upload);
router.delete('/:id/documents/:documentId', requireAuth, requireRole('admin'), documents.remove);
router.post('/:id/proof-pickup', requireAuth, requireRole('admin'), documents.proofPickup);
router.post('/:id/proof-delivery', requireAuth, requireRole('admin'), documents.proofDelivery);
router.get('/:shipmentId/timeline', requireAuth, shipmentController.getTimeline);
router.get('/:shipmentId', requireAuth, shipmentController.getById);
router.patch('/:shipmentId/status', requireAuth, requireRole('admin'), validateBody([{ field: 'status', checks: [{ fn: validators.required, message: 'status is required' }, { fn: validators.enum(SHIPMENT_STATUSES), message: 'invalid status' }] }]), shipmentController.updateStatus);
router.post('/:shipmentId/history', requireAuth, requireRole('admin'), shipmentController.addHistory);
router.patch('/:shipmentId/assign-embarkment', requireAuth, requireRole('admin'), shipmentController.assignEmbarkment);
router.patch('/:shipmentId/assign-operation', requireAuth, requireRole('admin'), shipmentController.assignEmbarkment);
router.patch('/:shipmentId/assign', requireAuth, requireRole('admin'), async (req, res, next) => { try { res.json(await assignShipment(req.params.shipmentId, req.body || {}, req.identity || {})); } catch (error) { next(error); } });
router.patch('/:shipmentId/return', requireAuth, requireRole('admin'), async (req, res, next) => { try { res.json(await transitionReturn(req.params.shipmentId, req.body || {})); } catch (error) { next(error); } });
router.delete('/:shipmentId', requireAuth, requireRole('admin'), shipmentController.deleteShipment);

module.exports = router;
