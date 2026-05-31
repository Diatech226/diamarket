const express = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');
const paymentsController = require('../../controllers/admin/payments');
const notificationJobsController = require('../../controllers/admin/notificationJobs');
const apiKeysController = require('../../controllers/admin/apiKeys');
const usersController = require('../../controllers/admin/users');
const providersController = require('../../controllers/admin/providers');
const Reservation = require('../../models/Reservation');
const Shipment = require('../../models/Shipment');
const {
  transitionReservationStatus,
  listSchedules,
  assignShipmentToOperation,
} = require('../../src/domains/operations/application/operationsApplicationService');
const { ensureRequestIdentity } = require('../../services/diaexpressAuthService');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

// Paiements
router.get('/payments', paymentsController.list);
router.get('/payments/summary', paymentsController.summary);
router.get('/payments/:paymentId', paymentsController.detail);
router.get('/payments/:paymentId/events', paymentsController.events);

// Jobs de notification
router.get('/notifications/jobs', notificationJobsController.list);
router.get('/notifications/jobs/:jobId', notificationJobsController.detail);

// Providers
router.get('/providers', providersController.list);
router.get('/providers/configs', providersController.listConfigs);
router.post('/providers/configs', providersController.createConfig);
router.patch('/providers/configs/:configId', providersController.updateConfig);
router.delete('/providers/configs/:configId', providersController.deleteConfig);
router.get('/providers/errors', providersController.listErrors);

// Clés API
router.get('/api-keys', apiKeysController.list);
router.post('/api-keys', apiKeysController.create);
router.get('/api-keys/:keyId', apiKeysController.detail);
router.patch('/api-keys/:keyId', apiKeysController.update);
router.delete('/api-keys/:keyId', apiKeysController.revoke);

// Utilisateurs
router.get('/users', usersController.list);
router.post('/users', usersController.create);
router.get('/users/:userId', usersController.detail);
router.patch('/users/:userId', usersController.update);
router.delete('/users/:userId', usersController.remove);


// Operations planning (Iteration E)
router.get('/operations/reservations', async (req, res, next) => {
  try {
    const items = await Reservation.find().sort({ createdAt: -1 }).limit(200)
      .populate('user', 'email role')
      .populate('quoteId', 'status transportType origin destination')
      .populate('shipmentId', 'trackingCode status planningStatus assignmentStatus')
      .populate('embarkmentId', 'label status cutoffDate capacity reservedCapacity')
      .populate('transportLineId', 'lineCode origin destination transportTypes');
    res.json({ items });
  } catch (error) { next(error); }
});

router.patch('/operations/reservations/:reservationId/status', async (req, res, next) => {
  try {
    const identity = ensureRequestIdentity(req);
    const reservation = await transitionReservationStatus({
      reservationId: req.params.reservationId,
      status: req.body?.status,
      reason: req.body?.reason,
      identity,
    });
    res.json(reservation);
  } catch (error) { next(error); }
});

router.get('/operations/schedules', async (req, res, next) => {
  try {
    const items = await listSchedules({
      filters: {
        active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
        status: req.query.status,
        transportType: req.query.transportType,
        origin: req.query.origin,
        destination: req.query.destination,
      },
      options: { limit: req.query.limit || 200 },
    });
    res.json({ items });
  } catch (error) { next(error); }
});

router.patch('/operations/shipments/:shipmentId/assign', async (req, res, next) => {
  try {
    const identity = ensureRequestIdentity(req);
    const shipment = await assignShipmentToOperation({
      shipmentId: req.params.shipmentId,
      input: req.body || {},
      identity,
    });
    res.json(shipment);
  } catch (error) { next(error); }
});

router.get('/operations/shipments', async (req, res, next) => {
  try {
    const items = await Shipment.find({}).sort({ createdAt: -1 }).limit(200)
      .populate('scheduleId', 'periodLabel departureDate closingDate totalCapacity reservedCapacity status')
      .populate('embarkmentId', 'label cutoffDate capacity reservedCapacity status')
      .populate('transportLineId', 'lineCode origin destination');
    res.json({ items });
  } catch (error) { next(error); }
});

module.exports = router;
