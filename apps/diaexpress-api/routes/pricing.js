const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateBody, validators } = require('../middleware/validate');
const Pricing = require('../models/Pricing');
const { success } = require('../utils/http');

/**
 * @swagger
 * /pricing/public/routes:
 *   get:
 *     tags: [Pricing]
 *     summary: Lister les routes tarifaires publiques (origine/destination/type de transport)
 *     responses:
 *       200:
 *         description: Liste des routes
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/public/routes', async (_req, res, next) => {
  try {
    const routes = (await Pricing.find({}, 'origin destination transportType').lean()).map((p) => ({ origin: p.origin, destination: p.destination, transportType: p.transportType }));
    return success(res, routes, { legacy: routes });
  } catch (e) { return next(e); }
});

/**
 * @swagger
 * /pricing/routes:
 *   get:
 *     tags: [Pricing]
 *     summary: Lister les routes tarifaires (legacy)
 *     responses:
 *       200:
 *         description: Liste des routes
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/routes', async (_req, res, next) => {
  try {
    const routes = (await Pricing.find({}, 'origin destination transportType').lean()).map((p) => ({ origin: p.origin, destination: p.destination, transportType: p.transportType }));
    return success(res, routes, { legacy: { routes } });
  } catch (e) { return next(e); }
});

/**
 * @swagger
 * /pricing/locations:
 *   get:
 *     tags: [Pricing]
 *     summary: Lister les origines et destinations disponibles
 *     responses:
 *       200:
 *         description: Origines et destinations
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/locations', async (_req, res, next) => {
  try {
    const pricing = await Pricing.find({}, 'origin destination').lean();
    const origins = [...new Set(pricing.map((p) => p.origin))];
    const destinations = [...new Set(pricing.map((p) => p.destination))];
    return success(res, { origins, destinations }, { legacy: { origins, destinations } });
  } catch (e) { return next(e); }
});

/**
 * @swagger
 * /pricing/estimate:
 *   post:
 *     tags: [Pricing]
 *     summary: Estimer un prix de transport
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
router.post('/estimate', pricingController.estimatePricing);
/**
 * @swagger
 * /pricing/currencies:
 *   get:
 *     tags: [Pricing]
 *     summary: Lister les taux de change des devises
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des taux de change
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/currencies', requireAuth, requireRole('admin'), pricingController.listCurrencyRates);
/**
 * @swagger
 * /pricing/warehouses:
 *   get:
 *     tags: [Pricing]
 *     summary: Lister les entrepôts
 *     responses:
 *       200:
 *         description: Liste des entrepôts
 */
router.get('/warehouses', pricingController.getWarehouses);
/**
 * @swagger
 * /pricing/meta:
 *   get:
 *     tags: [Pricing]
 *     summary: Récupérer les métadonnées de tarification
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Métadonnées de tarification
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/meta', requireAuth, requireRole('admin'), pricingController.getPricingMeta);
/**
 * @swagger
 * /pricing:
 *   get:
 *     tags: [Pricing]
 *     summary: Lister toutes les règles de tarification
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des règles de tarification
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PricingRule'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', requireAuth, requireRole('admin'), pricingController.getAllPricing);
/**
 * @swagger
 * /pricing/{id}:
 *   get:
 *     tags: [Pricing]
 *     summary: Récupérer une règle de tarification par id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Règle de tarification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingRule'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', requireAuth, requireRole('admin'), pricingController.getPricingById);
/**
 * @swagger
 * /pricing:
 *   post:
 *     tags: [Pricing]
 *     summary: Créer une règle de tarification
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Règle de tarification créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingRule'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', requireAuth, requireRole('admin'), validateBody([
  { field: 'origin', checks: [{ fn: validators.required, message: 'origin is required' }] },
  { field: 'destination', checks: [{ fn: validators.required, message: 'destination is required' }] },
]), pricingController.createPricing);
/**
 * @swagger
 * /pricing/{id}:
 *   put:
 *     tags: [Pricing]
 *     summary: Mettre à jour une règle de tarification
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
 *         description: Règle de tarification mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingRule'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', requireAuth, requireRole('admin'), pricingController.updatePricing);
/**
 * @swagger
 * /pricing/{id}:
 *   delete:
 *     tags: [Pricing]
 *     summary: Supprimer une règle de tarification
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Règle de tarification supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', requireAuth, requireRole('admin'), pricingController.deletePricing);

module.exports = router;
