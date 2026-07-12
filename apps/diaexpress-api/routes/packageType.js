const express = require('express');
const router = express.Router();
const controller = require('../controllers/PackageTypeController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateBody, validators } = require('../middleware/validate');

/**
 * @swagger
 * /package-types:
 *   get:
 *     tags: [Package Types]
 *     summary: Lister les types de colis
 *     responses:
 *       200:
 *         description: Liste des types de colis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PackageType'
 */
router.get('/', controller.getAllPackageTypes);

/**
 * @swagger
 * /package-types:
 *   post:
 *     tags: [Package Types]
 *     summary: Créer un type de colis
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Type de colis créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackageType'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', requireAuth, requireRole('admin'), validateBody([{ field: 'name', checks: [{ fn: validators.required, message: 'name is required' }] }]), controller.createPackageType);

/**
 * @swagger
 * /package-types/{id}:
 *   put:
 *     tags: [Package Types]
 *     summary: Mettre à jour un type de colis
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
 *         description: Type de colis mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PackageType'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', requireAuth, requireRole('admin'), controller.updatePackageType);

/**
 * @swagger
 * /package-types/{id}:
 *   delete:
 *     tags: [Package Types]
 *     summary: Supprimer un type de colis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Type de colis supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', requireAuth, requireRole('admin'), controller.deletePackageType);

module.exports = router;
