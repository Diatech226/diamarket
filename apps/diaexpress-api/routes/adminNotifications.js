const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { listAdmin } = require('../services/notificationService');
const router = express.Router();
/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Lister toutes les notifications (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', requireAuth, requireRole('admin'), async (req,res,next)=>{ try { res.json({ items: await listAdmin(req.query) }); } catch(e) { next(e); } });
module.exports = router;
