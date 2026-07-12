const router = require('express').Router();
const adminQuote = require('../controllers/adminQuoteController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));

/**
 * @swagger
 * /admin/quotes:
 *   get:
 *     tags: [Admin Quotes]
 *     summary: Lister tous les devis
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
router.get('/', adminQuote.listAll);

/**
 * @swagger
 * /admin/quotes/dashboard:
 *   get:
 *     tags: [Admin Quotes]
 *     summary: Tableau de bord des devis
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Statistiques du tableau de bord
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/dashboard', adminQuote.dashboard);

/**
 * @swagger
 * /admin/quotes/{id}:
 *   get:
 *     tags: [Admin Quotes]
 *     summary: Récupérer un devis
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
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', adminQuote.getOne);

/**
 * @swagger
 * /admin/quotes/{id}:
 *   patch:
 *     tags: [Admin Quotes]
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
router.patch('/:id', adminQuote.updateByAdmin);

/**
 * @swagger
 * /admin/quotes/{id}/status:
 *   patch:
 *     tags: [Admin Quotes]
 *     summary: Mettre à jour le statut d'un devis
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/status', adminQuote.patchStatus);

/**
 * @swagger
 * /admin/quotes/{id}/approve:
 *   post:
 *     tags: [Admin Quotes]
 *     summary: Approuver un devis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Devis approuvé
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
router.post('/:id/approve', adminQuote.approve);

/**
 * @swagger
 * /admin/quotes/{id}/reject:
 *   post:
 *     tags: [Admin Quotes]
 *     summary: Rejeter un devis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
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
router.post('/:id/reject', adminQuote.reject);

/**
 * @swagger
 * /admin/quotes/{id}/review:
 *   post:
 *     tags: [Admin Quotes]
 *     summary: Marquer un devis en cours de révision
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
router.post('/:id/review', adminQuote.markUnderReview);

/**
 * @swagger
 * /admin/quotes/{id}/request-info:
 *   post:
 *     tags: [Admin Quotes]
 *     summary: Demander des informations complémentaires sur un devis
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
router.post('/:id/request-info', adminQuote.requestMoreInfo);

/**
 * @swagger
 * /admin/quotes/{id}/convert:
 *   post:
 *     tags: [Admin Quotes]
 *     summary: Convertir un devis en réservation/expédition
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Devis converti
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
router.post('/:id/convert', adminQuote.convert);

/**
 * @swagger
 * /admin/quotes/{id}/ready-for-shipment:
 *   post:
 *     tags: [Admin Quotes]
 *     summary: Marquer un devis prêt pour expédition
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
router.post('/:id/ready-for-shipment', adminQuote.approve);

/**
 * @swagger
 * /admin/quotes/{id}/dispatch:
 *   post:
 *     tags: [Admin Quotes]
 *     summary: Envoyer un devis en expédition
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
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
router.post('/:id/dispatch', adminQuote.dispatch);

/**
 * @swagger
 * /admin/quotes/{id}/tracking:
 *   post:
 *     tags: [Admin Quotes]
 *     summary: Mettre à jour les informations de suivi d'un devis
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
 *         description: Suivi mis à jour
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
router.post('/:id/tracking', adminQuote.updateTracking);

module.exports = router;
