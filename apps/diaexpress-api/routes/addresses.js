const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const syncUser = require('../middleware/syncUser');
const controller = require('../controllers/addressController');
const { validateBody, validators } = require('../middleware/validate');

router.use(requireAuth, syncUser);

/**
 * @swagger
 * /addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: Lister mes adresses
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des adresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.list);

/**
 * @swagger
 * /addresses:
 *   post:
 *     tags: [Addresses]
 *     summary: Créer une adresse
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Adresse créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', validateBody([
  { field: 'line1', checks: [{ fn: validators.required, message: 'line1 is required' }] },
  { field: 'city', checks: [{ fn: validators.required, message: 'city is required' }] },
  { field: 'country', checks: [{ fn: validators.required, message: 'country is required' }] },
]), controller.create);

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     tags: [Addresses]
 *     summary: Récupérer une adresse
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Adresse trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.getOne);

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     tags: [Addresses]
 *     summary: Mettre à jour une adresse
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
 *         description: Adresse mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     tags: [Addresses]
 *     summary: Supprimer une adresse
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Adresse supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', controller.remove);

module.exports = router;
