import { Router } from 'express';
import { Request } from 'express';
import { categoriesController } from '../controllers/categories.controller';
import { ordersController } from '../controllers/orders.controller';
import { productsController } from '../controllers/products.controller';
import { vendorRequestsController } from '../controllers/vendor-requests.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';

const validateProduct = (req: Request) => {
  const required = ['name', 'slug', 'description', 'price', 'currency', 'category', 'vendor', 'stock'];
  for (const field of required) if (req.body[field] === undefined) return `Missing field: ${field}`;
  return null;
};
const validateCategory = (req: Request) => (!req.body.name || !req.body.slug ? 'name and slug are required' : null);
const validateVendorRequest = (req: Request) => (!req.body.userId || !req.body.businessName ? 'userId and businessName are required' : null);
const validateOrder = (req: Request) => {
  const required = ['customer', 'vendor', 'items', 'totalAmount'];
  for (const field of required) if (req.body[field] === undefined) return `Missing field: ${field}`;
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) return 'items must be a non-empty array';
  return null;
};

export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => res.json({ ok: true }));
apiRouter.get('/products', productsController.list);
apiRouter.get('/products/:slug', productsController.getBySlug);
apiRouter.post('/products', requireAuth, requireRole('admin', 'super_admin', 'vendeur'), validateRequest(validateProduct), productsController.create);
apiRouter.put('/products/:id', requireAuth, requireRole('admin', 'super_admin', 'vendeur'), productsController.update);
apiRouter.delete('/products/:id', requireAuth, requireRole('admin', 'super_admin'), productsController.remove);
apiRouter.get('/categories', categoriesController.list);
apiRouter.post('/categories', requireAuth, requireRole('admin', 'super_admin'), validateRequest(validateCategory), categoriesController.create);
apiRouter.put('/categories/:id', requireAuth, requireRole('admin', 'super_admin'), categoriesController.update);
apiRouter.delete('/categories/:id', requireAuth, requireRole('admin', 'super_admin'), categoriesController.remove);
apiRouter.post('/vendor-requests', requireAuth, validateRequest(validateVendorRequest), vendorRequestsController.create);
apiRouter.get('/vendor-requests', requireAuth, requireRole('admin', 'super_admin'), vendorRequestsController.list);
apiRouter.put('/vendor-requests/:id/approve', requireAuth, requireRole('admin', 'super_admin'), vendorRequestsController.approve);
apiRouter.put('/vendor-requests/:id/reject', requireAuth, requireRole('admin', 'super_admin'), vendorRequestsController.reject);
apiRouter.post('/orders', requireAuth, validateRequest(validateOrder), ordersController.create);
apiRouter.get('/orders', requireAuth, ordersController.list);
apiRouter.get('/orders/:id', requireAuth, ordersController.getById);
apiRouter.put('/orders/:id/status', requireAuth, requireRole('admin', 'super_admin', 'agent_logistique'), ordersController.updateStatus);
