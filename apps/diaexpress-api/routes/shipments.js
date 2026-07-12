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

/**
 * @swagger
 * /shipments/from-quote:
 *   post:
 *     tags: [Shipments]
 *     summary: Créer une expédition à partir d'un devis
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quoteId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expédition créée
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
 */
router.post('/from-quote', requireAuth, requireRole('admin'), validateBody([{ field: 'quoteId', checks: [{ fn: validators.required, message: 'quoteId is required' }, { fn: validators.objectId, message: 'quoteId must be an objectId' }] }]), shipmentController.createFromQuote);
/**
 * @swagger
 * /shipments/create-from-quote:
 *   post:
 *     tags: [Shipments]
 *     summary: Créer une expédition à partir d'un devis (legacy)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Expédition créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shipment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/create-from-quote', requireAuth, requireRole('admin'), shipmentController.createFromQuote);
/**
 * @swagger
 * /shipments/me:
 *   get:
 *     tags: [Shipments]
 *     summary: Lister les expéditions de l'utilisateur courant
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des expéditions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shipment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', requireAuth, shipmentController.getMine);
/**
 * @swagger
 * /shipments/dashboard:
 *   get:
 *     tags: [Shipments]
 *     summary: Récupérer le tableau de bord des expéditions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Données du tableau de bord
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/dashboard', requireAuth, requireRole('admin'), shipmentController.dashboard);
/**
 * @swagger
 * /shipments:
 *   get:
 *     tags: [Shipments]
 *     summary: Lister toutes les expéditions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des expéditions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shipment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', requireAuth, requireRole('admin'), shipmentController.getAll);

/**
 * @swagger
 * /shipments/{id}/documents:
 *   get:
 *     tags: [Shipments]
 *     summary: Lister les documents d'une expédition (client)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Liste des documents
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id/documents', requireAuth, documents.clientList);
/**
 * @swagger
 * /shipments/{id}/documents/admin:
 *   get:
 *     tags: [Shipments]
 *     summary: Lister les documents d'une expédition (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Liste des documents
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id/documents/admin', requireAuth, requireRole('admin'), documents.adminList);
/**
 * @swagger
 * /shipments/{id}/documents:
 *   post:
 *     tags: [Shipments]
 *     summary: Téléverser un document pour une expédition
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Document téléversé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/documents', requireAuth, requireRole('admin'), documents.upload);
/**
 * @swagger
 * /shipments/{id}/documents/{documentId}:
 *   delete:
 *     tags: [Shipments]
 *     summary: Supprimer un document d'une expédition
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *       - name: documentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id/documents/:documentId', requireAuth, requireRole('admin'), documents.remove);
/**
 * @swagger
 * /shipments/{id}/proof-pickup:
 *   post:
 *     tags: [Shipments]
 *     summary: Ajouter une preuve d'enlèvement
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Preuve d'enlèvement enregistrée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/proof-pickup', requireAuth, requireRole('admin'), documents.proofPickup);
/**
 * @swagger
 * /shipments/{id}/proof-delivery:
 *   post:
 *     tags: [Shipments]
 *     summary: Ajouter une preuve de livraison
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Preuve de livraison enregistrée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/proof-delivery', requireAuth, requireRole('admin'), documents.proofDelivery);
/**
 * @swagger
 * /shipments/{shipmentId}/timeline:
 *   get:
 *     tags: [Shipments]
 *     summary: Récupérer la chronologie d'une expédition
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: shipmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chronologie de l'expédition
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShipmentEvent'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:shipmentId/timeline', requireAuth, shipmentController.getTimeline);
/**
 * @swagger
 * /shipments/{shipmentId}:
 *   get:
 *     tags: [Shipments]
 *     summary: Récupérer une expédition par id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: shipmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expédition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shipment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:shipmentId', requireAuth, shipmentController.getById);
/**
 * @swagger
 * /shipments/{shipmentId}/status:
 *   patch:
 *     tags: [Shipments]
 *     summary: Mettre à jour le statut d'une expédition
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
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut mis à jour
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
router.patch('/:shipmentId/status', requireAuth, requireRole('admin'), validateBody([{ field: 'status', checks: [{ fn: validators.required, message: 'status is required' }, { fn: validators.enum(SHIPMENT_STATUSES), message: 'invalid status' }] }]), shipmentController.updateStatus);
/**
 * @swagger
 * /shipments/{shipmentId}/history:
 *   post:
 *     tags: [Shipments]
 *     summary: Ajouter un événement à l'historique d'une expédition
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
 *       201:
 *         description: Événement ajouté à l'historique
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:shipmentId/history', requireAuth, requireRole('admin'), shipmentController.addHistory);
/**
 * @swagger
 * /shipments/{shipmentId}/assign-embarkment:
 *   patch:
 *     tags: [Shipments]
 *     summary: Assigner un embarquement à une expédition
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
 *         description: Embarquement assigné
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:shipmentId/assign-embarkment', requireAuth, requireRole('admin'), shipmentController.assignEmbarkment);
/**
 * @swagger
 * /shipments/{shipmentId}/assign-operation:
 *   patch:
 *     tags: [Shipments]
 *     summary: Assigner une opération à une expédition (alias)
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
 *         description: Opération assignée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:shipmentId/assign-operation', requireAuth, requireRole('admin'), shipmentController.assignEmbarkment);
/**
 * @swagger
 * /shipments/{shipmentId}/assign:
 *   patch:
 *     tags: [Shipments]
 *     summary: Assigner une expédition à un opérateur
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
 *         description: Expédition assignée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:shipmentId/assign', requireAuth, requireRole('admin'), async (req, res, next) => { try { res.json(await assignShipment(req.params.shipmentId, req.body || {}, req.identity || {})); } catch (error) { next(error); } });
/**
 * @swagger
 * /shipments/{shipmentId}/return:
 *   patch:
 *     tags: [Shipments]
 *     summary: Passer une expédition en retour
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
 *         description: Expédition passée en retour
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:shipmentId/return', requireAuth, requireRole('admin'), async (req, res, next) => { try { res.json(await transitionReturn(req.params.shipmentId, req.body || {})); } catch (error) { next(error); } });
/**
 * @swagger
 * /shipments/{shipmentId}:
 *   delete:
 *     tags: [Shipments]
 *     summary: Supprimer une expédition
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: shipmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expédition supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:shipmentId', requireAuth, requireRole('admin'), shipmentController.deleteShipment);

module.exports = router;
