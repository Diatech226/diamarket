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

router.get('/public/site-settings', async (_req, res, next) => { try { ok(res, await getSettings()); } catch (e) { next(e); } });
router.get('/public/services', async (req, res, next) => { try { ok(res, await CmsService.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
router.get('/public/popular-routes', async (req, res, next) => { try { ok(res, await PopularRoute.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
router.get('/public/faq', async (req, res, next) => { try { ok(res, await FaqItem.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
router.get('/public/testimonials', async (req, res, next) => { try { ok(res, await Testimonial.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
router.get('/public/case-studies', async (req, res, next) => { try { ok(res, await CaseStudy.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
router.get('/public/marketing-ctas', async (req, res, next) => { try { ok(res, await MarketingCta.find(activeQuery(req)).sort(sort).lean()); } catch (e) { next(e); } });
router.post('/public/newsletter/subscribe', async (req, res, next) => { try { ok(res, await NewsletterSubscriber.findOneAndUpdate({ email: req.body.email }, req.body, { upsert: true, new: true, setDefaultsOnInsert: true }), 201); } catch (e) { next(e); } });
router.post('/public/quote-leads', async (req, res, next) => { try { ok(res, await QuoteLead.create(req.body), 201); } catch (e) { next(e); } });

router.get('/public/homepage', async (_req, res, next) => { try { const [homepage, services, popularRoutes, faq, settings] = await Promise.all([getHomepage(), CmsService.find({ isActive: true }).sort(sort).lean(), PopularRoute.find({ isActive: true }).sort(sort).lean(), FaqItem.find({ isActive: true }).sort(sort).limit(6).lean(), getSettings()]); ok(res, { ...homepage, services, popularRoutes, faq, settings }); } catch (e) { next(e); } });

router.get('/admin/site-settings', ...admin, async (_req, res, next) => { try { ok(res, await getSettings()); } catch (e) { next(e); } });
router.put('/admin/site-settings', ...admin, async (req, res, next) => { try { ok(res, await SiteSettings.findOneAndUpdate({ key: 'default' }, { $set: settingsPayload(req.body) }, { upsert: true, new: true, setDefaultsOnInsert: true })); } catch (e) { next(e); } });
router.get('/admin/homepage', ...admin, async (_req, res, next) => { try { ok(res, await getHomepage()); } catch (e) { next(e); } });
router.put('/admin/homepage', ...admin, async (req, res, next) => { try { ok(res, await HomepageContent.findOneAndUpdate({ key: 'default' }, { $set: req.body }, { upsert: true, new: true, setDefaultsOnInsert: true })); } catch (e) { next(e); } });

function crud(path, Model) {
  router.get(`/admin/${path}`, ...admin, async (_req, res, next) => { try { ok(res, await Model.find({}).sort(sort).lean()); } catch (e) { next(e); } });
  router.post(`/admin/${path}`, ...admin, async (req, res, next) => { try { ok(res, await Model.create(req.body), 201); } catch (e) { next(e); } });
  router.put(`/admin/${path}/:id`, ...admin, async (req, res, next) => { try { ok(res, await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })); } catch (e) { next(e); } });
  router.delete(`/admin/${path}/:id`, ...admin, async (req, res, next) => { try { await Model.findByIdAndDelete(req.params.id); ok(res, { deleted: true }); } catch (e) { next(e); } });
}
crud('services', CmsService);
crud('popular-routes', PopularRoute);
crud('faq', FaqItem);
crud('testimonials', Testimonial);
crud('case-studies', CaseStudy);
crud('newsletter/subscribers', NewsletterSubscriber);
crud('newsletter/campaigns', NewsletterCampaign);
crud('quote-leads', QuoteLead);
crud('marketing/ctas', MarketingCta);

module.exports = router;
