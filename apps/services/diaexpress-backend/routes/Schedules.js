const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/', requireAuth, requireRole('admin'), scheduleController.createSchedule);
router.patch('/:id', requireAuth, requireRole('admin'), scheduleController.updateSchedule);
router.delete('/:id', requireAuth, requireRole('admin'), scheduleController.deleteSchedule);

router.get('/', scheduleController.getSchedules);
router.get('/available/route', scheduleController.getAvailableSchedulesForRoute);
router.get('/public', scheduleController.getSchedules);

module.exports = router;
