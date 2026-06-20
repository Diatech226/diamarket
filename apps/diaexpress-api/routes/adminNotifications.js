const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { listAdmin } = require('../services/notificationService');
const router = express.Router();
router.get('/', requireAuth, requireRole('admin'), async (req,res,next)=>{ try { res.json({ items: await listAdmin(req.query) }); } catch(e) { next(e); } });
module.exports = router;
