const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { SiteSettings, CmsService, PopularRoute, FaqItem, HomepageContent, Testimonial, CaseStudy, NewsletterSubscriber, NewsletterCampaign, QuoteLead, MarketingCta } = require('../models/CmsContent');

const router = express.Router();
const admin = [requireAuth, requireRole('admin')];
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const parseList = (value) => Array.isArray(value) ? value : String(value || '').split(',').map((v) => v.trim()).filter(Boolean);

const settingsPayload = (body) => ({
  ...body,
  coveredCountries: body.coveredCountries ? parseList(body.coveredCountries) : undefined,
});
const getSettings = () => SiteSettings.findOneAndUpdate({ key: 'default' }, { $setOnInsert: { key: 'default' } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
const getHomepage = () => HomepageContent.findOneAndUpdate({ key: 'default' }, { $setOnInsert: { key: 'default' } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
const activeQuery = (req) => req.query.includeInactive === 'true' ? {} : { isActive: true };
const sort = { displayOrder: 1, createdAt: -1 };

/**
 * @swagger
 * /public/site-settings:
 *   get:
 *     tags: [CMS]
 *     summary: Récupérer les paramètres publics du site
 *     responses:
 *       200:
 *         description: Paramètres du site
 */
router.get('/public/site-settings', async (_req, res, next) => { try { ok(res, await getSettings()); } catch (e) { next(e); } });
/**
 * @swagger
 * /public/services:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les services publics
 *     responses:
 *       200:
 *         description: Liste des services
 */
router.get('/public/services', async (req, res, next) => { try { ok(res, await CmsService.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
/**
 * @swagger
 * /public/popular-routes:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les routes populaires publiques
 *     responses:
 *       200:
 *         description: Liste des routes populaires
 */
router.get('/public/popular-routes', async (req, res, next) => { try { ok(res, await PopularRoute.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
/**
 * @swagger
 * /public/faq:
 *   get:
 *     tags: [CMS]
 *     summary: Lister la foire aux questions publique
 *     responses:
 *       200:
 *         description: Liste des questions fréquentes
 */
router.get('/public/faq', async (req, res, next) => { try { ok(res, await FaqItem.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
/**
 * @swagger
 * /public/testimonials:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les témoignages publics
 *     responses:
 *       200:
 *         description: Liste des témoignages
 */
router.get('/public/testimonials', async (req, res, next) => { try { ok(res, await Testimonial.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
/**
 * @swagger
 * /public/case-studies:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les études de cas publiques
 *     responses:
 *       200:
 *         description: Liste des études de cas
 */
router.get('/public/case-studies', async (req, res, next) => { try { ok(res, await CaseStudy.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
/**
 * @swagger
 * /public/marketing-ctas:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les appels à l'action marketing publics
 *     responses:
 *       200:
 *         description: Liste des appels à l'action
 */
router.get('/public/marketing-ctas', async (req, res, next) => { try { ok(res, await MarketingCta.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
/**
 * @swagger
 * /public/newsletter/subscribe:
 *   post:
 *     tags: [CMS]
 *     summary: S'abonner à la newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Abonnement créé ou mis à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/public/newsletter/subscribe', async (req, res, next) => { try { ok(res, await NewsletterSubscriber.findOneAndUpdate({ email: req.body.email }, req.body, { upsert: true, new: true, setDefaultsOnInsert: true }), 201); } catch (e) { next(e); } });
/**
 * @swagger
 * /public/quote-leads:
 *   post:
 *     tags: [CMS]
 *     summary: Créer un lead de demande de devis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Lead créé
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/public/quote-leads', async (req, res, next) => { try { ok(res, await QuoteLead.create(req.body), 201); } catch (e) { next(e); } });

/**
 * @swagger
 * /public/homepage:
 *   get:
 *     tags: [CMS]
 *     summary: Récupérer le contenu agrégé de la page d'accueil
 *     responses:
 *       200:
 *         description: Contenu de la page d'accueil
 */
router.get('/public/homepage', async (_req, res, next) => { try { const [homepage, services, popularRoutes, faq, settings] = await Promise.all([getHomepage(), CmsService.find({ isActive: true }).sort(sort).lean(), PopularRoute.find({ isActive: true }).sort(sort).lean(), FaqItem.find({ isActive: true }).sort(sort).limit(6).lean(), getSettings()]); ok(res, { ...homepage, services, popularRoutes, faq, settings }); } catch (e) { next(e); } });

/**
 * @swagger
 * /admin/site-settings:
 *   get:
 *     tags: [CMS]
 *     summary: Récupérer les paramètres du site (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Paramètres du site
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/admin/site-settings', ...admin, async (_req, res, next) => { try { ok(res, await getSettings()); } catch (e) { next(e); } });
/**
 * @swagger
 * /admin/site-settings:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour les paramètres du site
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Paramètres mis à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/admin/site-settings', ...admin, async (req, res, next) => { try { ok(res, await SiteSettings.findOneAndUpdate({ key: 'default' }, { $set: settingsPayload(req.body) }, { upsert: true, new: true, setDefaultsOnInsert: true })); } catch (e) { next(e); } });
/**
 * @swagger
 * /admin/homepage:
 *   get:
 *     tags: [CMS]
 *     summary: Récupérer le contenu de la page d'accueil (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Contenu de la page d'accueil
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/admin/homepage', ...admin, async (_req, res, next) => { try { ok(res, await getHomepage()); } catch (e) { next(e); } });
/**
 * @swagger
 * /admin/homepage:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour le contenu de la page d'accueil
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Contenu mis à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/admin/homepage', ...admin, async (req, res, next) => { try { ok(res, await HomepageContent.findOneAndUpdate({ key: 'default' }, { $set: req.body }, { upsert: true, new: true, setDefaultsOnInsert: true })); } catch (e) { next(e); } });

function crud(path, Model) {
  router.get(`/admin/${path}`, ...admin, async (_req, res, next) => { try { ok(res, await Model.find({}).sort(sort).lean()); } catch (e) { next(e); } });
  router.post(`/admin/${path}`, ...admin, async (req, res, next) => { try { ok(res, await Model.create(req.body), 201); } catch (e) { next(e); } });
  router.put(`/admin/${path}/:id`, ...admin, async (req, res, next) => { try { ok(res, await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })); } catch (e) { next(e); } });
  router.delete(`/admin/${path}/:id`, ...admin, async (req, res, next) => { try { await Model.findByIdAndDelete(req.params.id); ok(res, { deleted: true }); } catch (e) { next(e); } });
}
/**
 * @swagger
 * /admin/services:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les services (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des services
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [CMS]
 *     summary: Créer un service
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Service créé
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /admin/services/{id}:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour un service
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
 *         description: Service mis à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [CMS]
 *     summary: Supprimer un service
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Service supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
crud('services', CmsService);
/**
 * @swagger
 * /admin/popular-routes:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les routes populaires (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des routes populaires
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [CMS]
 *     summary: Créer une route populaire
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Route populaire créée
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /admin/popular-routes/{id}:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour une route populaire
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
 *         description: Route populaire mise à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [CMS]
 *     summary: Supprimer une route populaire
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Route populaire supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
crud('popular-routes', PopularRoute);
/**
 * @swagger
 * /admin/faq:
 *   get:
 *     tags: [CMS]
 *     summary: Lister la foire aux questions (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des questions fréquentes
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [CMS]
 *     summary: Créer une question fréquente
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Question créée
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /admin/faq/{id}:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour une question fréquente
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
 *         description: Question mise à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [CMS]
 *     summary: Supprimer une question fréquente
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Question supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
crud('faq', FaqItem);
/**
 * @swagger
 * /admin/testimonials:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les témoignages (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des témoignages
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [CMS]
 *     summary: Créer un témoignage
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Témoignage créé
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /admin/testimonials/{id}:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour un témoignage
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
 *         description: Témoignage mis à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [CMS]
 *     summary: Supprimer un témoignage
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Témoignage supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
crud('testimonials', Testimonial);
/**
 * @swagger
 * /admin/case-studies:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les études de cas (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des études de cas
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [CMS]
 *     summary: Créer une étude de cas
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Étude de cas créée
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /admin/case-studies/{id}:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour une étude de cas
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
 *         description: Étude de cas mise à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [CMS]
 *     summary: Supprimer une étude de cas
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Étude de cas supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
crud('case-studies', CaseStudy);
/**
 * @swagger
 * /admin/newsletter/subscribers:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les abonnés à la newsletter
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des abonnés
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [CMS]
 *     summary: Créer un abonné à la newsletter
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Abonné créé
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /admin/newsletter/subscribers/{id}:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour un abonné à la newsletter
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
 *         description: Abonné mis à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [CMS]
 *     summary: Supprimer un abonné à la newsletter
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Abonné supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
crud('newsletter/subscribers', NewsletterSubscriber);
/**
 * @swagger
 * /admin/newsletter/campaigns:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les campagnes de newsletter
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des campagnes
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [CMS]
 *     summary: Créer une campagne de newsletter
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Campagne créée
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /admin/newsletter/campaigns/{id}:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour une campagne de newsletter
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
 *         description: Campagne mise à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [CMS]
 *     summary: Supprimer une campagne de newsletter
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Campagne supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
crud('newsletter/campaigns', NewsletterCampaign);
/**
 * @swagger
 * /admin/quote-leads:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les leads de devis (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des leads de devis
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [CMS]
 *     summary: Créer un lead de devis (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Lead créé
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /admin/quote-leads/{id}:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour un lead de devis
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
 *         description: Lead mis à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [CMS]
 *     summary: Supprimer un lead de devis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Lead supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
crud('quote-leads', QuoteLead);
/**
 * @swagger
 * /admin/marketing/ctas:
 *   get:
 *     tags: [CMS]
 *     summary: Lister les appels à l'action marketing (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des appels à l'action
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [CMS]
 *     summary: Créer un appel à l'action marketing
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Appel à l'action créé
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 * /admin/marketing/ctas/{id}:
 *   put:
 *     tags: [CMS]
 *     summary: Mettre à jour un appel à l'action marketing
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
 *         description: Appel à l'action mis à jour
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [CMS]
 *     summary: Supprimer un appel à l'action marketing
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdPathParam'
 *     responses:
 *       200:
 *         description: Appel à l'action supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
crud('marketing/ctas', MarketingCta);

module.exports = router;
