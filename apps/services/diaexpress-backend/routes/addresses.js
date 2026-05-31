const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const syncUser = require('../middleware/syncUser');
const controller = require('../controllers/addressController');
const { validateBody, validators } = require('../middleware/validate');

router.use(requireAuth, syncUser);
router.get('/', controller.list);
router.post('/', validateBody([
  { field: 'line1', checks: [{ fn: validators.required, message: 'line1 is required' }] },
  { field: 'city', checks: [{ fn: validators.required, message: 'city is required' }] },
  { field: 'country', checks: [{ fn: validators.required, message: 'country is required' }] },
]), controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
