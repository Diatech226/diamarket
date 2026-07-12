const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const TransportLine = require('../models/TransportLine');
const { listTransportLines, createTransportLine } = require('../src/domains/network/application/masterDataService');
const Expedition = require('../models/Expedition');

const router = express.Router();

function buildPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(parseInt(query.limit, 10) || parseInt(query.pageSize, 10) || 20, 100));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildTransportLineFilters(query) {
  const filters = {};

  if (query.origin) {
    filters.origin = new RegExp(query.origin, 'i');
  }
  if (query.destination) {
    filters.destination = new RegExp(query.destination, 'i');
  }
  if (query.transportType) {
    filters.transportTypes = { $in: [query.transportType] };
  }
  if (query.isActive === 'true') {
    filters.isActive = true;
  } else if (query.isActive === 'false') {
    filters.isActive = false;
  }
  if (query.search) {
    filters.$or = [
      { origin: new RegExp(query.search, 'i') },
      { destination: new RegExp(query.search, 'i') },
      { lineCode: new RegExp(query.search, 'i') },
    ];
  }

  return filters;
}

// Transport lines
/**
 * @swagger
 * /expeditions/transport-lines:
 *   get:
 *     tags: [Expeditions]
 *     summary: Lister les lignes de transport
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des lignes de transport
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TransportLine'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/transport-lines', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { page, limit, skip } = buildPagination(req.query);
    const filters = buildTransportLineFilters(req.query);

    const [items, total] = await Promise.all([
      listTransportLines(filters, { skip, limit }),
      TransportLine.countDocuments(filters),
    ]);

    res.json({ items, total, page, pageSize: limit });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /expeditions/transport-lines:
 *   post:
 *     tags: [Expeditions]
 *     summary: Créer une ligne de transport
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Ligne de transport créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransportLine'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/transport-lines', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const transportLine = await createTransportLine(req.body || {});
    res.status(201).json(transportLine);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /expeditions/transport-lines/meta:
 *   get:
 *     tags: [Expeditions]
 *     summary: Obtenir les métadonnées des lignes de transport (origines/destinations)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Métadonnées des lignes de transport
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 origins:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/transport-lines/meta', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const lines = await listTransportLines({ isActive: true }, { limit: 1000 });

    const originsMap = new Map();

    lines.forEach((line) => {
      const originEntry = originsMap.get(line.origin) || { origin: line.origin, destinations: [] };
      originEntry.destinations.push({
        destination: line.destination,
        transportTypes: line.transportTypes,
        transportLineId: line.id || line._id,
        estimatedTransitDays: line.estimatedTransitDays,
      });
      originsMap.set(line.origin, originEntry);
    });

    res.json({ origins: Array.from(originsMap.values()) });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /expeditions/transport-lines/{id}:
 *   get:
 *     tags: [Expeditions]
 *     summary: Détail d'une ligne de transport
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Détail de la ligne de transport
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransportLine'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/transport-lines/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const line = await TransportLine.findById(req.params.id);
    if (!line) {
      return res.status(404).json({ message: 'Ligne de transport introuvable' });
    }
    res.json(line);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /expeditions/transport-lines/{id}:
 *   put:
 *     tags: [Expeditions]
 *     summary: Mettre à jour une ligne de transport
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
 *         description: Ligne de transport mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransportLine'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/transport-lines/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const updated = await TransportLine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Ligne de transport introuvable' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /expeditions/transport-lines/{id}:
 *   delete:
 *     tags: [Expeditions]
 *     summary: Désactiver une ligne de transport
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Ligne de transport désactivée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransportLine'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/transport-lines/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const updated = await TransportLine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Ligne de transport introuvable' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Expeditions
/**
 * @swagger
 * /expeditions:
 *   get:
 *     tags: [Expeditions]
 *     summary: Lister les expéditions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des expéditions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { page, limit, skip } = buildPagination(req.query);
    const filters = {};

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.transportLineId) {
      filters.transportLineId = req.query.transportLineId;
    }

    if (req.query.departureFrom || req.query.departureTo) {
      filters.plannedDepartureDate = {};
      if (req.query.departureFrom) {
        filters.plannedDepartureDate.$gte = new Date(req.query.departureFrom);
      }
      if (req.query.departureTo) {
        filters.plannedDepartureDate.$lte = new Date(req.query.departureTo);
      }
    }

    if (req.query.arrivalFrom || req.query.arrivalTo) {
      filters.plannedArrivalDate = {};
      if (req.query.arrivalFrom) {
        filters.plannedArrivalDate.$gte = new Date(req.query.arrivalFrom);
      }
      if (req.query.arrivalTo) {
        filters.plannedArrivalDate.$lte = new Date(req.query.arrivalTo);
      }
    }

    if (req.query.origin || req.query.destination || req.query.transportType) {
      const lineFilters = buildTransportLineFilters(req.query);
      const matchingLines = await TransportLine.find(lineFilters).select('_id');
      const ids = matchingLines.map((line) => line._id);
      filters.transportLineId = { $in: ids };
    }

    const [items, total] = await Promise.all([
      Expedition.find(filters)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('transportLineId')
        .populate('shipments')
        .populate('quoteId'),
      Expedition.countDocuments(filters),
    ]);

    res.json({ items, total, page, pageSize: limit });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /expeditions:
 *   post:
 *     tags: [Expeditions]
 *     summary: Créer une expédition
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Expédition créée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const expedition = new Expedition(req.body);
    await expedition.save();
    const populated = await expedition.populate('transportLineId').populate('shipments');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /expeditions/{id}:
 *   get:
 *     tags: [Expeditions]
 *     summary: Détail d'une expédition
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Détail de l'expédition
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const expedition = await Expedition.findById(req.params.id)
      .populate('transportLineId')
      .populate('shipments')
      .populate('quoteId');
    if (!expedition) {
      return res.status(404).json({ message: 'Expédition introuvable' });
    }
    res.json(expedition);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /expeditions/{id}:
 *   put:
 *     tags: [Expeditions]
 *     summary: Mettre à jour une expédition
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
 *         description: Expédition mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const updated = await Expedition.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('transportLineId')
      .populate('shipments')
      .populate('quoteId');
    if (!updated) {
      return res.status(404).json({ message: 'Expédition introuvable' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
