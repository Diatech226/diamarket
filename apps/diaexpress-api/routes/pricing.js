const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateBody, validators } = require('../middleware/validate');
const Pricing = require('../models/Pricing');
const { success } = require('../utils/http');

router.get('/public/routes', async (_req, res, next) => {
  try {
    const routes = (await Pricing.find({}, 'origin destination transportType').lean()).map((p) => ({ origin: p.origin, destination: p.destination, transportType: p.transportType }));
    return success(res, routes, { legacy: routes });
  } catch (e) { return next(e); }
});

router.get('/routes', async (_req, res, next) => {
  try {
    const routes = (await Pricing.find({}, 'origin destination transportType').lean()).map((p) => ({ origin: p.origin, destination: p.destination, transportType: p.transportType }));
    return success(res, routes, { legacy: { routes } });
  } catch (e) { return next(e); }
});

router.get('/locations', async (_req, res, next) => {
  try {
    const pricing = await Pricing.find({}, 'origin destination').lean();
    const origins = [...new Set(pricing.map((p) => p.origin))];
    const destinations = [...new Set(pricing.map((p) => p.destination))];
    return success(res, { origins, destinations }, { legacy: { origins, destinations } });
  } catch (e) { return next(e); }
});

router.post('/estimate', pricingController.estimatePricing);
router.get('/currencies', requireAuth, requireRole('admin'), pricingController.listCurrencyRates);
router.get('/warehouses', pricingController.getWarehouses);
router.get('/meta', requireAuth, requireRole('admin'), pricingController.getPricingMeta);
router.get('/', requireAuth, requireRole('admin'), pricingController.getAllPricing);
router.get('/:id', requireAuth, requireRole('admin'), pricingController.getPricingById);
router.post('/', requireAuth, requireRole('admin'), validateBody([
  { field: 'origin', checks: [{ fn: validators.required, message: 'origin is required' }] },
  { field: 'destination', checks: [{ fn: validators.required, message: 'destination is required' }] },
]), pricingController.createPricing);
router.put('/:id', requireAuth, requireRole('admin'), pricingController.updatePricing);
router.delete('/:id', requireAuth, requireRole('admin'), pricingController.deletePricing);

module.exports = router;
