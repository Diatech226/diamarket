const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { success, ApiError } = require('../utils/http');

const toNullOrTrimmed = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};
const toBoolean = (value) => {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (['true', '1', 'yes', 'on'].includes(value.toLowerCase())) return true;
    if (['false', '0', 'no', 'off'].includes(value.toLowerCase())) return false;
  }
  return undefined;
};

const sanitizeUserUpdate = (payload = {}) => {
  const updates = {};
  const phone = toNullOrTrimmed(payload.phone);
  if (phone !== undefined) updates.phone = phone;
  if (payload.fullName !== undefined) updates.fullName = toNullOrTrimmed(payload.fullName);
  if (payload.firstName !== undefined) updates.firstName = toNullOrTrimmed(payload.firstName);
  if (payload.lastName !== undefined) updates.lastName = toNullOrTrimmed(payload.lastName);
  if (payload.avatarUrl !== undefined) updates.avatarUrl = toNullOrTrimmed(payload.avatarUrl);
  if (payload.timezone !== undefined) updates.timezone = toNullOrTrimmed(payload.timezone);
  if (payload.notes !== undefined) updates.notes = toNullOrTrimmed(payload.notes);
  if (payload.preferences?.notifications && typeof payload.preferences.notifications === 'object') {
    ['email', 'sms', 'push'].forEach((key) => {
      if (payload.preferences.notifications[key] !== undefined) {
        const b = toBoolean(payload.preferences.notifications[key]);
        if (b !== undefined) updates[`preferences.notifications.${key}`] = b;
      }
    });
  }
  return Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));
};

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Récupérer le profil de l'utilisateur courant
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
router.get('/me', requireAuth, async (req, res) => {
  const user = req.dbUser.toObject();
  const identity = req.identity || req.auth || null;
  return success(res, user, { meta: { identity }, legacy: { ...user, user, identity } });
});

const updateHandler = async (req, res, next) => {
  try {
    const sanitizedUpdates = sanitizeUserUpdate(req.body);
    if (!Object.keys(sanitizedUpdates).length) throw new ApiError(400, 'VALIDATION_ERROR', 'Aucune donnée valide fournie');
    Object.entries(sanitizedUpdates).forEach(([path, value]) => req.dbUser.set(path, value));
    await req.dbUser.save();
    const updatedUser = req.dbUser.toObject();
    return success(res, updatedUser, { legacy: updatedUser });
  } catch (error) { return next(error); }
};

/**
 * @swagger
 * /users/me:
 *   put:
 *     tags: [Users]
 *     summary: Mettre à jour le profil de l'utilisateur courant
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/me', requireAuth, updateHandler);
/**
 * @swagger
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Mettre à jour partiellement le profil de l'utilisateur courant
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/me', requireAuth, updateHandler);

module.exports = router;
