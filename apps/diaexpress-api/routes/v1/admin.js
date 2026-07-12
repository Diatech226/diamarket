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
/**
 * @swagger
 * /v1/admin/payments:
 *   get:
 *     tags: [Admin]
 *     summary: Lister tous les paiements
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des paiements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/payments', paymentsController.list);

/**
 * @swagger
 * /v1/admin/payments/summary:
 *   get:
 *     tags: [Admin]
 *     summary: Résumé des paiements
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Résumé des paiements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/payments/summary', paymentsController.summary);

/**
 * @swagger
 * /v1/admin/payments/{paymentId}:
 *   get:
 *     tags: [Admin]
 *     summary: Détail d'un paiement
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: paymentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détail du paiement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/payments/:paymentId', paymentsController.detail);

/**
 * @swagger
 * /v1/admin/payments/{paymentId}/events:
 *   get:
 *     tags: [Admin]
 *     summary: Historique des événements d'un paiement
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: paymentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des événements du paiement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/payments/:paymentId/events', paymentsController.events);

// Jobs de notification
/**
 * @swagger
 * /v1/admin/notifications/jobs:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les jobs de notification
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des jobs de notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/notifications/jobs', notificationJobsController.list);

/**
 * @swagger
 * /v1/admin/notifications/jobs/{jobId}:
 *   get:
 *     tags: [Admin]
 *     summary: Détail d'un job de notification
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détail du job de notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/notifications/jobs/:jobId', notificationJobsController.detail);

// Providers
/**
 * @swagger
 * /v1/admin/providers:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les providers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des providers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/providers', providersController.list);

/**
 * @swagger
 * /v1/admin/providers/configs:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les configurations de providers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/providers/configs', providersController.listConfigs);

/**
 * @swagger
 * /v1/admin/providers/configs:
 *   post:
 *     tags: [Admin]
 *     summary: Créer une configuration de provider
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Configuration créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/providers/configs', providersController.createConfig);

/**
 * @swagger
 * /v1/admin/providers/configs/{configId}:
 *   patch:
 *     tags: [Admin]
 *     summary: Mettre à jour une configuration de provider
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: configId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Configuration mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/providers/configs/:configId', providersController.updateConfig);

/**
 * @swagger
 * /v1/admin/providers/configs/{configId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Supprimer une configuration de provider
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: configId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configuration supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/providers/configs/:configId', providersController.deleteConfig);

/**
 * @swagger
 * /v1/admin/providers/errors:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les erreurs de providers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des erreurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/providers/errors', providersController.listErrors);

// Clés API
/**
 * @swagger
 * /v1/admin/api-keys:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les clés API
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des clés API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/api-keys', apiKeysController.list);

/**
 * @swagger
 * /v1/admin/api-keys:
 *   post:
 *     tags: [Admin]
 *     summary: Créer une clé API
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Clé API créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/api-keys', apiKeysController.create);

/**
 * @swagger
 * /v1/admin/api-keys/{keyId}:
 *   get:
 *     tags: [Admin]
 *     summary: Détail d'une clé API
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: keyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détail de la clé API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/api-keys/:keyId', apiKeysController.detail);

/**
 * @swagger
 * /v1/admin/api-keys/{keyId}:
 *   patch:
 *     tags: [Admin]
 *     summary: Mettre à jour une clé API
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: keyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Clé API mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/api-keys/:keyId', apiKeysController.update);

/**
 * @swagger
 * /v1/admin/api-keys/{keyId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Révoquer une clé API
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: keyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clé API révoquée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/api-keys/:keyId', apiKeysController.revoke);

// Utilisateurs
/**
 * @swagger
 * /v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les utilisateurs
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/users', usersController.list);

/**
 * @swagger
 * /v1/admin/users:
 *   post:
 *     tags: [Admin]
 *     summary: Créer un utilisateur
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/users', usersController.create);

/**
 * @swagger
 * /v1/admin/users/{userId}:
 *   get:
 *     tags: [Admin]
 *     summary: Détail d'un utilisateur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détail de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/users/:userId', usersController.detail);

/**
 * @swagger
 * /v1/admin/users/{userId}:
 *   patch:
 *     tags: [Admin]
 *     summary: Mettre à jour un utilisateur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/users/:userId', usersController.update);

/**
 * @swagger
 * /v1/admin/users/{userId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Supprimer un utilisateur
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/users/:userId', usersController.remove);


// Operations planning (Iteration E)
/**
 * @swagger
 * /v1/admin/operations/reservations:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les réservations de planification
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des réservations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
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

/**
 * @swagger
 * /v1/admin/operations/reservations/{reservationId}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Changer le statut d'une réservation
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: reservationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Réservation mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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

/**
 * @swagger
 * /v1/admin/operations/schedules:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les plannings d'opérations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des plannings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
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

/**
 * @swagger
 * /v1/admin/operations/shipments/{shipmentId}/assign:
 *   patch:
 *     tags: [Admin]
 *     summary: Affecter une expédition à une opération
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: shipmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Expédition affectée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shipment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
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

/**
 * @swagger
 * /v1/admin/operations/shipments:
 *   get:
 *     tags: [Admin]
 *     summary: Lister les expéditions en opération
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des expéditions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shipment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
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
