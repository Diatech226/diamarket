const express = require('express');

const bookingController = require('../controllers/bookingController');
const { requireUserOrIntegrationKey } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Créer une réservation de transport
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Réservation créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', requireUserOrIntegrationKey, bookingController.createBooking);

module.exports = router;
