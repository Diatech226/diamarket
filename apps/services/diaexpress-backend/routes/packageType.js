const express = require('express');
const router = express.Router();
const controller = require('../controllers/PackageTypeController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateBody, validators } = require('../middleware/validate');

router.get('/', controller.getAllPackageTypes);
router.post('/', requireAuth, requireRole('admin'), validateBody([{ field: 'name', checks: [{ fn: validators.required, message: 'name is required' }] }]), controller.createPackageType);
router.put('/:id', requireAuth, requireRole('admin'), controller.updatePackageType);
router.delete('/:id', requireAuth, requireRole('admin'), controller.deletePackageType);

module.exports = router;
