const appConfig = require('../../config/appConfig');

const env = appConfig.runtime.environment;
const publicUrl = (process.env.API_PUBLIC_URL || '').trim();
const devUrl = `http://localhost:${appConfig.server.port || 5000}/api`;
const serverUrl = env === 'production' && publicUrl ? publicUrl : devUrl;
const enabled = env !== 'production' || process.env.ENABLE_SWAGGER === 'true';
const secured = [{ bearerAuth: [] }];
const errorRef = { schema: { $ref: '#/components/schemas/ApiError' } };
const errors = { 400: { description: 'Bad Request', content: { 'application/json': errorRef } }, 401: { description: 'Unauthorized', content: { 'application/json': errorRef } }, 403: { description: 'Forbidden', content: { 'application/json': errorRef } }, 404: { description: 'Not Found', content: { 'application/json': errorRef } }, 500: { description: 'Server Error', content: { 'application/json': errorRef } } };
const ok = (description = 'Success', schema = { type: 'object' }) => ({ description, content: { 'application/json': { schema } } });
const created = (description = 'Created', schema = { type: 'object' }) => ({ description, content: { 'application/json': { schema } } });
const param = (name, description) => ({ name, in: 'path', required: true, description, schema: { type: 'string' } });
const route = (method, tag, summary, secure = false, params = []) => ({ [method.toLowerCase()]: { tags: [tag], summary, ...(secure ? { security: secured } : {}), parameters: params, responses: { 200: ok(), 201: created(), ...errors } } });

const routeRows = [
  ['GET','/health','Tracking','Healthcheck public',false], ['GET','/tracking/{trackingNumber}','Tracking','Suivre une expédition',false,['trackingNumber']], ['POST','/quotes/estimate','Quotes','Estimer un devis',false], ['POST','/quotes','Quotes','Créer un devis',false],
  ['POST','/auth/register','Auth','Créer un compte',false], ['POST','/auth/login','Auth','Se connecter',false], ['GET','/auth/me','Auth','Profil courant',true], ['POST','/auth/logout','Auth','Se déconnecter',true],
  ['GET','/quotes/me','Quotes','Mes devis',true], ['GET','/quotes/{id}','Quotes','Afficher un devis',true,['id']], ['GET','/admin/quotes','Admin','Lister les devis admin',true], ['GET','/admin/quotes/{id}','Admin','Afficher un devis admin',true,['id']], ['PATCH','/admin/quotes/{id}/status','Admin','Modifier le statut devis',true,['id']], ['POST','/admin/quotes/{id}/request-info','Admin','Demander des informations',true,['id']], ['POST','/admin/quotes/{id}/approve','Admin','Approuver un devis',true,['id']], ['POST','/admin/quotes/{id}/reject','Admin','Rejeter un devis',true,['id']], ['POST','/admin/quotes/{id}/convert','Admin','Convertir un devis',true,['id']],
  ['GET','/shipments/me','Shipments','Mes expéditions',true], ['GET','/shipments/{id}','Shipments','Afficher une expédition',true,['id']], ['GET','/admin/shipments','Admin','Lister les expéditions admin',true], ['GET','/admin/shipments/{id}','Admin','Afficher une expédition admin',true,['id']], ['PATCH','/admin/shipments/{id}/status','Admin','Modifier statut expédition',true,['id']], ['POST','/admin/shipments/{id}/events','Operations','Ajouter un événement',true,['id']], ['POST','/admin/shipments/{id}/incidents','Incidents','Créer un incident',true,['id']],
  ['GET','/pricing','Pricing','Lister la tarification',false], ['POST','/pricing/estimate','Pricing','Estimer la tarification',false], ['POST','/admin/pricing','Pricing','Créer une règle tarifaire',true], ['PUT','/admin/pricing/{id}','Pricing','Modifier une règle tarifaire',true,['id']], ['DELETE','/admin/pricing/{id}','Pricing','Supprimer une règle tarifaire',true,['id']],
  ['POST','/integrations/diamarket/shipping/estimate','Integrations','Estimation shipping Diamarket',true], ['POST','/integrations/diamarket/shipments','Integrations','Créer shipment Diamarket',true], ['GET','/integrations/diamarket/shipments/{trackingNumber}','Integrations','Suivi shipment Diamarket',true,['trackingNumber']]
];

const paths = Object.fromEntries(routeRows.map(([method, path, tag, summary, secure, names]) => [path, route(method, tag, summary, secure, (names || []).map((name) => param(name, `Paramètre ${name}`)))]));
paths['/quotes/estimate'].post.responses[200] = ok('Success', { $ref: '#/components/schemas/QuoteEstimate' });
paths['/tracking/{trackingNumber}'].get.responses[200] = ok('Success', { $ref: '#/components/schemas/TrackingResponse' });

const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'DiaExpress API', version: '1.0.0', description: 'API logistique DiaExpress' },
  servers: [{ url: serverUrl, description: env === 'production' ? 'Production' : 'Development' }],
  tags: ['Auth','Quotes','Shipments','Tracking','Pricing','Operations','Incidents','Notifications','Documents','Integrations','Admin'].map((name) => ({ name })),
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Quote: { type: 'object', properties: { id: { type: 'string' }, origin: { type: 'string' }, destination: { type: 'string' }, status: { type: 'string', example: 'pending' }, estimatedPrice: { type: 'number' }, currency: { type: 'string', example: 'XOF' } } },
      QuoteEstimate: { type: 'object', properties: { price: { type: 'number', example: 45000 }, currency: { type: 'string', example: 'XOF' }, transitDays: { type: 'integer', example: 3 } } },
      Shipment: { type: 'object', properties: { id: { type: 'string' }, trackingNumber: { type: 'string', example: 'DX-2026-0001' }, status: { type: 'string', example: 'in_transit' }, events: { type: 'array', items: { $ref: '#/components/schemas/ShipmentEvent' } } } },
      ShipmentEvent: { type: 'object', properties: { status: { type: 'string' }, location: { type: 'string' }, occurredAt: { type: 'string', format: 'date-time' }, note: { type: 'string' } } },
      TrackingResponse: { type: 'object', properties: { trackingNumber: { type: 'string' }, status: { type: 'string' }, shipment: { $ref: '#/components/schemas/Shipment' } } },
      PricingRule: { type: 'object', properties: { id: { type: 'string' }, zone: { type: 'string' }, basePrice: { type: 'number' }, currency: { type: 'string', example: 'XOF' } } },
      Incident: { type: 'object', properties: { id: { type: 'string' }, shipmentId: { type: 'string' }, type: { type: 'string' }, status: { type: 'string', example: 'open' } } },
      Notification: { type: 'object', properties: { id: { type: 'string' }, channel: { type: 'string', example: 'email' }, status: { type: 'string' }, subject: { type: 'string' } } },
      ApiError: { type: 'object', properties: { message: { type: 'string' }, code: { type: 'string' }, details: { type: 'object' } } }
    }
  },
  paths
};

module.exports = { swaggerSpec, swaggerEnabled: enabled };
