const router = require('express').Router();
const adminQuote = require('../controllers/adminQuoteController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Toutes ces routes sont ADMIN
router.use(requireAuth, requireRole('admin'));

router.get('/', adminQuote.listAll);
router.patch('/:id', adminQuote.updateByAdmin);
router.post('/:id/approve', adminQuote.approve);
router.post('/:id/reject', adminQuote.reject);
router.post('/:id/review', adminQuote.markUnderReview);
router.post('/:id/request-info', adminQuote.requestMoreInfo);
router.post('/:id/ready-for-shipment', adminQuote.markReadyForShipment);
router.post('/:id/dispatch', adminQuote.dispatch);
router.post('/:id/tracking', adminQuote.updateTracking);

module.exports = router;
