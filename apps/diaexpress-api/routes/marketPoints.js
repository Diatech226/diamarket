const router = require('express').Router();
const marketPointController = require('../controllers/marketPointController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));

/**
 * @swagger
 * /admin/market-points:
 *   get:
 *     tags: [Market Points]
 *     summary: Lister les points de marché
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des points de marché
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MarketPoint'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', marketPointController.list);

/**
 * @swagger
 * /admin/market-points:
 *   post:
 *     tags: [Market Points]
 *     summary: Créer un point de marché
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Point de marché créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketPoint'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', marketPointController.create);

/**
 * @swagger
 * /admin/market-points/{id}:
 *   patch:
 *     tags: [Market Points]
 *     summary: Mettre à jour un point de marché
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
 *         description: Point de marché mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketPoint'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', marketPointController.update);

/**
 * @swagger
 * /admin/market-points/{id}:
 *   delete:
 *     tags: [Market Points]
 *     summary: Supprimer un point de marché
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Point de marché supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', marketPointController.remove);

module.exports = router;
