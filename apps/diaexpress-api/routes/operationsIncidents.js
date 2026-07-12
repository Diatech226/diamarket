const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const svc = require('../services/operationsIncidentService');
const router = express.Router();
router.use(requireAuth, requireRole('admin'));
/**
 * @swagger
 * /admin/operations/incidents:
 *   get:
 *     tags: [Operations]
 *     summary: Lister les incidents
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des incidents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Incident'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/incidents', async (req,res,next)=>{ try { res.json({items: await svc.listIncidents(req.query)}); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/incidents:
 *   post:
 *     tags: [Operations]
 *     summary: Créer un incident
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Incident créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/incidents', async (req,res,next)=>{ try { res.status(201).json(await svc.createIncident(req.body, req.identity || {})); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/incidents/{id}:
 *   get:
 *     tags: [Operations]
 *     summary: Récupérer un incident par id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Incident
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/incidents/:id', async (req,res,next)=>{ try { const items=await svc.listIncidents({limit:500}); const item=items.find(i=>String(i._id)===req.params.id); if(!item) return res.status(404).json({message:'Incident introuvable'}); res.json(item); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/incidents/{id}:
 *   patch:
 *     tags: [Operations]
 *     summary: Mettre à jour un incident
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
 *         description: Incident mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/incidents/:id', async (req,res,next)=>{ try { res.json(await svc.updateIncident(req.params.id, req.body)); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/incidents/{id}/resolve:
 *   patch:
 *     tags: [Operations]
 *     summary: Résoudre un incident
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
 *         description: Incident résolu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/incidents/:id/resolve', async (req,res,next)=>{ try { res.json(await svc.resolveIncident(req.params.id, req.body)); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/hubs:
 *   get:
 *     tags: [Operations]
 *     summary: Lister les hubs
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des hubs
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/hubs', async (_req,res,next)=>{ try { res.json({items: await svc.listHubs()}); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/hubs:
 *   post:
 *     tags: [Operations]
 *     summary: Créer un hub
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Hub créé
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/hubs', async (req,res,next)=>{ try { res.status(201).json(await svc.upsertHub(req.body)); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/hubs/{id}:
 *   patch:
 *     tags: [Operations]
 *     summary: Mettre à jour un hub
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
 *         description: Hub mis à jour
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/hubs/:id', async (req,res,next)=>{ try { res.json(await svc.upsertHub(req.body, req.params.id)); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/alerts:
 *   get:
 *     tags: [Operations]
 *     summary: Lister les alertes opérationnelles
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des alertes
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/alerts', async (_req,res,next)=>{ try { const snap=await svc.operationsSnapshot(); res.json({items:snap.alerts}); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/sla:
 *   get:
 *     tags: [Operations]
 *     summary: Récupérer les indicateurs SLA
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Indicateurs SLA
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/sla', async (_req,res,next)=>{ try { const snap=await svc.operationsSnapshot(); res.json(snap.sla); } catch(e){ next(e); } });
/**
 * @swagger
 * /admin/operations/board:
 *   get:
 *     tags: [Operations]
 *     summary: Récupérer le tableau de bord opérationnel complet
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Instantané des opérations
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/board', async (_req,res,next)=>{ try { res.json(await svc.operationsSnapshot()); } catch(e){ next(e); } });
module.exports = router;
