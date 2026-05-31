const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const adminQuoteController = require('../controllers/adminQuoteController');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');
const { validateBody, validators } = require('../middleware/validate');

router.post('/', optionalAuth, quoteController.createQuote);
router.get('/', requireAuth, requireRole('admin'), quoteController.getAllQuotes);
router.post('/estimateQuote', quoteController.estimateQuote);
router.post('/estimate', quoteController.estimateQuote);
router.get('/all', requireAuth, requireRole('admin'), quoteController.getAllQuotes);
router.get('/meta', quoteController.getQuoteMeta);
router.get('/me', requireAuth, quoteController.getUserQuotes);
router.get('/:id', requireAuth, quoteController.getQuoteById);
router.post('/:quoteId/confirm', requireAuth, requireRole('admin'), quoteController.confirmQuote);
router.post('/:quoteId/reject', requireAuth, requireRole('admin'), quoteController.rejectQuote);
router.post('/:quoteId/dispatch', requireAuth, requireRole('admin'), quoteController.dispatchQuote);
router.delete('/:id', requireAuth, requireRole('admin'), quoteController.deleteQuote);
router.patch('/:id/status', requireAuth, requireRole('admin'), validateBody([{ field: 'status', checks: [{ fn: validators.required, message: 'status is required' }] }]), quoteController.updateQuoteStatus);
router.patch('/:id', requireAuth, requireRole('admin'), adminQuoteController.updateByAdmin);
router.post('/:id/review', requireAuth, requireRole('admin'), adminQuoteController.markUnderReview);
router.post('/:id/request-info', requireAuth, requireRole('admin'), adminQuoteController.requestMoreInfo);
router.post('/:id/ready-for-shipment', requireAuth, requireRole('admin'), adminQuoteController.markReadyForShipment);
router.post('/:id/pay', requireAuth, quoteController.payQuote);

module.exports = router;
