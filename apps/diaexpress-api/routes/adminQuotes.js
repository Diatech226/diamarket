const router = require('express').Router();
const adminQuote = require('../controllers/adminQuoteController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('admin'));

router.get('/', adminQuote.listAll);
router.get('/dashboard', adminQuote.dashboard);
router.get('/:id', adminQuote.getOne);
router.patch('/:id', adminQuote.updateByAdmin);
router.patch('/:id/status', adminQuote.patchStatus);
router.post('/:id/approve', adminQuote.approve);
router.post('/:id/reject', adminQuote.reject);
router.post('/:id/review', adminQuote.markUnderReview);
router.post('/:id/request-info', adminQuote.requestMoreInfo);
router.post('/:id/convert', adminQuote.convert);
router.post('/:id/ready-for-shipment', adminQuote.approve);
router.post('/:id/dispatch', adminQuote.dispatch);
router.post('/:id/tracking', adminQuote.updateTracking);

module.exports = router;
