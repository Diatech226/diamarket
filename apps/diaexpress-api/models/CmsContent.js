const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true, trim: true },
  metaTitle: String,
  metaDescription: String,
  openGraphImage: String,
  keywords: [String],
  canonical: String,
  robots: { type: String, default: 'index,follow' },
}, { timestamps: true });

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },
  companyName: { type: String, default: 'DiaExpress' },
  slogan: { type: String, default: 'Logistique premium internationale' },
  logo: String,
  favicon: String,
  primaryColor: { type: String, default: '#0f5fff' },
  supportPhone: String,
  supportEmail: String,
  whatsapp: String,
  address: String,
  openingHours: String,
  socialLinks: { type: mongoose.Schema.Types.Mixed, default: {} },
  coveredCountries: [String],
  primaryCurrency: { type: String, default: 'EUR' },
  seo: [seoSchema],
}, { timestamps: true });

const cmsServiceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  icon: String,
  image: String,
  transportType: { type: String, default: 'air' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

const popularRouteSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  transport: { type: String, default: 'air' },
  estimatedDelay: String,
  indicativePrice: String,
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'general' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });


const testimonialSchema = new mongoose.Schema({
  client: { type: String, required: true },
  photo: String,
  company: String,
  comment: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

const caseStudySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'fret commercial' },
  summary: { type: String, default: '' },
  result: String,
  route: String,
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: String,
  country: String,
  status: { type: String, default: 'subscribed' },
}, { timestamps: true });

const newsletterCampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: String,
  status: { type: String, default: 'draft' },
  sentAt: Date,
}, { timestamps: true });

const quoteLeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  country: String,
  need: { type: String, required: true },
  source: { type: String, default: 'quote-lead' },
  status: { type: String, default: 'new' },
}, { timestamps: true });

const marketingCtaSchema = new mongoose.Schema({
  label: { type: String, required: true },
  href: { type: String, required: true },
  placement: { type: String, default: 'homepage' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

const homepageSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },
  heroTitle: { type: String, default: 'Expédiez vos colis en toute confiance' },
  heroSubtitle: { type: String, default: 'DiaExpress orchestre vos expéditions aériennes, maritimes et routières avec suivi temps réel.' },
  heroImage: String,
  primaryCtaLabel: { type: String, default: 'Demander un devis' },
  primaryCtaHref: { type: String, default: '/quote-request' },
  trackingCtaLabel: { type: String, default: 'Suivre un colis' },
  trackingCtaHref: { type: String, default: '/track-shipment' },
  stats: { type: [mongoose.Schema.Types.Mixed], default: [] },
  testimonials: { type: [mongoose.Schema.Types.Mixed], default: [] },
  seo: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = {
  SiteSettings: mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema),
  CmsService: mongoose.models.CmsService || mongoose.model('CmsService', cmsServiceSchema),
  PopularRoute: mongoose.models.PopularRoute || mongoose.model('PopularRoute', popularRouteSchema),
  FaqItem: mongoose.models.FaqItem || mongoose.model('FaqItem', faqSchema),
  HomepageContent: mongoose.models.HomepageContent || mongoose.model('HomepageContent', homepageSchema),
  Testimonial: mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema),
  CaseStudy: mongoose.models.CaseStudy || mongoose.model('CaseStudy', caseStudySchema),
  NewsletterSubscriber: mongoose.models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema),
  NewsletterCampaign: mongoose.models.NewsletterCampaign || mongoose.model('NewsletterCampaign', newsletterCampaignSchema),
  QuoteLead: mongoose.models.QuoteLead || mongoose.model('QuoteLead', quoteLeadSchema),
  MarketingCta: mongoose.models.MarketingCta || mongoose.model('MarketingCta', marketingCtaSchema),
};
