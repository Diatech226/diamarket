const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { requireAuth, requireRole } = require('../middleware/auth');

/**
 * @swagger
 * /schedules:
 *   post:
 *     tags: [Schedules]
 *     summary: Créer un planning de transport
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Planning créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', requireAuth, requireRole('admin'), scheduleController.createSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   patch:
 *     tags: [Schedules]
 *     summary: Mettre à jour un planning de transport
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Planning mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', requireAuth, requireRole('admin'), scheduleController.updateSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     tags: [Schedules]
 *     summary: Supprimer un planning de transport
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Planning supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', requireAuth, requireRole('admin'), scheduleController.deleteSchedule);

/**
 * @swagger
 * /schedules:
 *   get:
 *     tags: [Schedules]
 *     summary: Lister les plannings de transport
 *     responses:
 *       200:
 *         description: Liste des plannings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 */
router.get('/', scheduleController.getSchedules);

/**
 * @swagger
 * /schedules/available/route:
 *   get:
 *     tags: [Schedules]
 *     summary: Lister les plannings disponibles pour un itinéraire
 *     responses:
 *       200:
 *         description: Liste des plannings disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 */
router.get('/available/route', scheduleController.getAvailableSchedulesForRoute);

/**
 * @swagger
 * /schedules/public:
 *   get:
 *     tags: [Schedules]
 *     summary: Lister les plannings publics
 *     responses:
 *       200:
 *         description: Liste des plannings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 */
router.get('/public', scheduleController.getSchedules);

module.exports = router;
