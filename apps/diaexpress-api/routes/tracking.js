const express = require('express');

const trackingController = require('../controllers/trackingController');
const documents = require('../controllers/shipmentDocumentsController');
const { optionalUserOrIntegrationKey } = require('../middleware/auth');

const router = express.Router();

router.get('/:trackingCode/documents', documents.publicList);
router.get('/:trackingCode', optionalUserOrIntegrationKey, trackingController.getTracking);

module.exports = router;
