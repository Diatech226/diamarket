const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const svc = require('../services/notificationService');
const router = express.Router();
const uid = (req) => req.user?._id || req.identity?.principalId;
/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Lister les notifications de l'utilisateur courant
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
 */
router.get('/', requireAuth, async (req,res,next)=>{ try{ res.json({ items: await svc.listForUser(uid(req), req.query) }); }catch(e){ next(e); } });

/**
 * @swagger
 * /notifications/me:
 *   get:
 *     tags: [Notifications]
 *     summary: Lister mes notifications
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
 */
router.get('/me', requireAuth, async (req,res,next)=>{ try{ res.json({ items: await svc.listForUser(uid(req), req.query) }); }catch(e){ next(e); } });

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Marquer toutes les notifications comme lues
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Notifications marquées comme lues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/read-all', requireAuth, async (req,res,next)=>{ try{ res.json(await svc.markAllAsRead(uid(req))); }catch(e){ next(e); } });

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Marquer une notification comme lue
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/read', requireAuth, async (req,res,next)=>{ try{ res.json(await svc.markAsRead(req.params.id, uid(req))); }catch(e){ next(e); } });

/**
 * @swagger
 * /notifications/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Marquer une notification comme lue
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/read', requireAuth, async (req,res,next)=>{ try{ res.json(await svc.markAsRead(req.params.id, uid(req))); }catch(e){ next(e); } });

/**
 * @swagger
 * /notifications/admin/list:
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
router.get('/admin/list', requireAuth, requireRole('admin'), async (req,res,next)=>{ try{ res.json({ items: await svc.listAdmin(req.query) }); }catch(e){ next(e); } });
module.exports = router;
