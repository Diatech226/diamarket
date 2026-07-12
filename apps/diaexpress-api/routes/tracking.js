const express = require('express');

const trackingController = require('../controllers/trackingController');
const documents = require('../controllers/shipmentDocumentsController');
const { optionalUserOrIntegrationKey } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /tracking/{trackingCode}/documents:
 *   get:
 *     tags: [Tracking]
 *     summary: Lister les documents publics d'une expédition
 *     parameters:
 *       - name: trackingCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:trackingCode/documents', documents.publicList);

/**
 * @swagger
 * /tracking/{trackingCode}:
 *   get:
 *     tags: [Tracking]
 *     summary: Suivre une expédition par code de suivi
 *     parameters:
 *       - name: trackingCode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Informations de suivi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrackingResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:trackingCode', optionalUserOrIntegrationKey, trackingController.getTracking);

module.exports = router;
