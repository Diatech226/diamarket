const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const adminQuoteController = require('../controllers/adminQuoteController');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');
const { validateBody, validators } = require('../middleware/validate');

/**
 * @swagger
 * /quotes:
 *   post:
 *     tags: [Quotes]
 *     summary: Créer un devis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Devis créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', optionalAuth, quoteController.createQuote);

/**
 * @swagger
 * /quotes:
 *   get:
 *     tags: [Quotes]
 *     summary: Lister tous les devis (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des devis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', requireAuth, requireRole('admin'), quoteController.getAllQuotes);

/**
 * @swagger
 * /quotes/estimateQuote:
 *   post:
 *     tags: [Quotes]
 *     summary: Estimer un devis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Estimation calculée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuoteEstimate'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/estimateQuote', quoteController.estimateQuote);

/**
 * @swagger
 * /quotes/estimate:
 *   post:
 *     tags: [Quotes]
 *     summary: Estimer un devis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Estimation calculée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuoteEstimate'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/estimate', quoteController.estimateQuote);

/**
 * @swagger
 * /quotes/all:
 *   get:
 *     tags: [Quotes]
 *     summary: Lister tous les devis (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des devis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/all', requireAuth, requireRole('admin'), quoteController.getAllQuotes);

/**
 * @swagger
 * /quotes/meta:
 *   get:
 *     tags: [Quotes]
 *     summary: Récupérer les métadonnées de devis
 *     responses:
 *       200:
 *         description: Métadonnées de devis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/meta', quoteController.getQuoteMeta);

/**
 * @swagger
 * /quotes/me:
 *   get:
 *     tags: [Quotes]
 *     summary: Lister mes devis
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des devis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', requireAuth, quoteController.getUserQuotes);

/**
 * @swagger
 * /quotes/{id}:
 *   get:
 *     tags: [Quotes]
 *     summary: Récupérer un devis par identifiant
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Devis trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', requireAuth, quoteController.getQuoteById);

/**
 * @swagger
 * /quotes/{quoteId}/confirm:
 *   post:
 *     tags: [Quotes]
 *     summary: Confirmer un devis (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: quoteId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devis confirmé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:quoteId/confirm', requireAuth, requireRole('admin'), quoteController.confirmQuote);

/**
 * @swagger
 * /quotes/{quoteId}/reject:
 *   post:
 *     tags: [Quotes]
 *     summary: Rejeter un devis (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: quoteId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devis rejeté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:quoteId/reject', requireAuth, requireRole('admin'), quoteController.rejectQuote);

/**
 * @swagger
 * /quotes/{quoteId}/dispatch:
 *   post:
 *     tags: [Quotes]
 *     summary: Envoyer un devis en expédition (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: quoteId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devis expédié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:quoteId/dispatch', requireAuth, requireRole('admin'), quoteController.dispatchQuote);

/**
 * @swagger
 * /quotes/{id}:
 *   delete:
 *     tags: [Quotes]
 *     summary: Supprimer un devis (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Devis supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', requireAuth, requireRole('admin'), quoteController.deleteQuote);

/**
 * @swagger
 * /quotes/{id}/status:
 *   patch:
 *     tags: [Quotes]
 *     summary: Mettre à jour le statut d'un devis (admin)
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
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/status', requireAuth, requireRole('admin'), validateBody([{ field: 'status', checks: [{ fn: validators.required, message: 'status is required' }] }]), quoteController.updateQuoteStatus);

/**
 * @swagger
 * /quotes/{id}:
 *   patch:
 *     tags: [Quotes]
 *     summary: Mettre à jour un devis (admin)
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
 *         description: Devis mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', requireAuth, requireRole('admin'), adminQuoteController.updateByAdmin);

/**
 * @swagger
 * /quotes/{id}/review:
 *   post:
 *     tags: [Quotes]
 *     summary: Marquer un devis en cours de révision (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Devis marqué en révision
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/review', requireAuth, requireRole('admin'), adminQuoteController.markUnderReview);

/**
 * @swagger
 * /quotes/{id}/request-info:
 *   post:
 *     tags: [Quotes]
 *     summary: Demander des informations complémentaires sur un devis (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Demande d'information envoyée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/request-info', requireAuth, requireRole('admin'), adminQuoteController.requestMoreInfo);

/**
 * @swagger
 * /quotes/{id}/ready-for-shipment:
 *   post:
 *     tags: [Quotes]
 *     summary: Marquer un devis prêt pour expédition (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Devis marqué prêt pour expédition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/ready-for-shipment', requireAuth, requireRole('admin'), adminQuoteController.markReadyForShipment);

/**
 * @swagger
 * /quotes/{id}/pay:
 *   post:
 *     tags: [Quotes]
 *     summary: Payer un devis
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
 *         description: Paiement effectué
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/pay', requireAuth, quoteController.payQuote);

module.exports = router;
