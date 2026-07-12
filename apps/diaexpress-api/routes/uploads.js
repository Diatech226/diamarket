const express = require('express');
const router = express.Router();
const uploadCtrl = require('../controllers/uploadController');

/**
 * @swagger
 * /uploads:
 *   post:
 *     tags: [Documents]
 *     summary: Téléverser un fichier ou une image
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Fichier téléversé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', uploadCtrl.uploadMiddleware, uploadCtrl.uploadImage);

module.exports = router;
