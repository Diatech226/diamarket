const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const { requireAuth, requireRole } = require("../middleware/auth");
const syncUser = require("../middleware/syncUser");

// 🔹 Client
/**
 * @swagger
 * /reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Créer une réservation
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
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/", requireAuth, syncUser, reservationController.createReservation);

/**
 * @swagger
 * /reservations/me:
 *   get:
 *     tags: [Reservations]
 *     summary: Lister mes réservations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des réservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/me", requireAuth, syncUser, reservationController.getMyReservations);

// 🔹 Admin
/**
 * @swagger
 * /reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Lister toutes les réservations (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des réservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/", requireAuth, requireRole("admin"), reservationController.getAllReservations);

/**
 * @swagger
 * /reservations/{id}/status:
 *   patch:
 *     tags: [Reservations]
 *     summary: Mettre à jour le statut d'une réservation (admin)
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
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/status", requireAuth, requireRole("admin"), reservationController.updateStatus);

// 🔹 Documents (client peut uploader ses docs)
/**
 * @swagger
 * /reservations/{id}/documents:
 *   post:
 *     tags: [Reservations]
 *     summary: Téléverser un document pour une réservation
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Document téléversé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post("/:id/documents", requireAuth, syncUser, reservationController.uploadDocument);

module.exports = router;
