const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const appConfig = require('../../config/appConfig');

const env = appConfig.runtime.environment;
const publicUrl = (process.env.API_PUBLIC_URL || '').trim();
const devUrl = `http://localhost:${appConfig.server.port || 5000}/api`;
const serverUrl = env === 'production' && publicUrl ? publicUrl : devUrl;
const enabled = env !== 'production' || process.env.ENABLE_SWAGGER === 'true';

const errorSchema = { $ref: '#/components/schemas/ApiError' };
const namedErrorResponses = {
  BadRequest: { description: 'Bad Request', content: { 'application/json': { schema: errorSchema } } },
  Unauthorized: { description: 'Unauthorized', content: { 'application/json': { schema: errorSchema } } },
  Forbidden: { description: 'Forbidden', content: { 'application/json': { schema: errorSchema } } },
  NotFound: { description: 'Not Found', content: { 'application/json': { schema: errorSchema } } },
  ServerError: { description: 'Server Error', content: { 'application/json': { schema: errorSchema } } },
};

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'DiaExpress API',
    version: '1.0.0',
    description: 'API logistique DiaExpress',
  },
  servers: [{ url: serverUrl, description: env === 'production' ? 'Production' : 'Development' }],
  tags: [
    'Auth', 'Users', 'Quotes', 'Admin Quotes', 'Shipments', 'Tracking', 'Bookings',
    'Reservations', 'Pricing', 'Expeditions', 'Operations', 'Incidents', 'Notifications',
    'Documents', 'Addresses', 'Package Types', 'Market Points', 'Schedules', 'CMS',
    'Payments', 'Integrations', 'Admin', 'Public', 'Legacy',
  ].map((name) => ({ name })),
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    parameters: {
      IdPathParam: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Identifiant de la ressource',
        schema: { type: 'string' },
      },
    },
    responses: namedErrorResponses,
    schemas: {
      Quote: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          origin: { type: 'string' },
          destination: { type: 'string' },
          status: { type: 'string', example: 'pending' },
          estimatedPrice: { type: 'number' },
          currency: { type: 'string', example: 'XOF' },
        },
      },
      QuoteEstimate: {
        type: 'object',
        properties: {
          price: { type: 'number', example: 45000 },
          currency: { type: 'string', example: 'XOF' },
          transitDays: { type: 'integer', example: 3 },
        },
      },
      Shipment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          trackingNumber: { type: 'string', example: 'DX-2026-0001' },
          status: { type: 'string', example: 'in_transit' },
          events: { type: 'array', items: { $ref: '#/components/schemas/ShipmentEvent' } },
        },
      },
      ShipmentEvent: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          location: { type: 'string' },
          occurredAt: { type: 'string', format: 'date-time' },
          note: { type: 'string' },
        },
      },
      TrackingResponse: {
        type: 'object',
        properties: {
          trackingNumber: { type: 'string' },
          status: { type: 'string' },
          shipment: { $ref: '#/components/schemas/Shipment' },
        },
      },
      PricingRule: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          zone: { type: 'string' },
          basePrice: { type: 'number' },
          currency: { type: 'string', example: 'XOF' },
        },
      },
      Incident: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          shipmentId: { type: 'string' },
          type: { type: 'string' },
          status: { type: 'string', example: 'open' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          channel: { type: 'string', example: 'email' },
          status: { type: 'string' },
          subject: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          role: { type: 'string', example: 'client' },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          line1: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
        },
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          quoteId: { type: 'string' },
          shipmentId: { type: 'string' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string' },
          origin: { type: 'string' },
          destination: { type: 'string' },
        },
      },
      PackageType: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          allowedTransportTypes: { type: 'array', items: { type: 'string' } },
        },
      },
      MarketPoint: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
        },
      },
      Schedule: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          periodLabel: { type: 'string' },
          departureDate: { type: 'string', format: 'date-time' },
          transportType: { type: 'string' },
          status: { type: 'string' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string', example: 'XOF' },
          status: { type: 'string', example: 'pending' },
          provider: { type: 'string' },
        },
      },
      TransportLine: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          lineCode: { type: 'string' },
          origin: { type: 'string' },
          destination: { type: 'string' },
          transportTypes: { type: 'array', items: { type: 'string' } },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'object' },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJSDoc({
  definition,
  apis: [
    path.join(__dirname, '../../routes/**/*.js'),
  ],
});

module.exports = { swaggerSpec, swaggerEnabled: enabled };
