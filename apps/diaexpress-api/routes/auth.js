const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { exchangeToken, syncUser, getMe } = require('../controllers/authController');

/**
 * @swagger
 * /auth/token:
 *   post:
 *     tags: [Auth]
 *     summary: Échanger un token Clerk contre une session DiaExpress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Session créée
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/token', exchangeToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Profil de l'utilisateur courant
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', requireAuth, getMe);

/**
 * @swagger
 * /auth/sync:
 *   post:
 *     tags: [Auth]
 *     summary: Synchroniser l'utilisateur Clerk avec la base DiaExpress
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Utilisateur synchronisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/sync', requireAuth, syncUser);

module.exports = router;
