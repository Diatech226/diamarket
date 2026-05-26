import { Router } from 'express';
import { baseController } from '../controllers/base.controller';
import { clerkAuthPlaceholder } from '../middlewares/auth.middleware';

const entities = ['users','vendor-requests','vendors','products','categories','slides','orders','shipments','settings','currency-rates','marketplace-points'];

export const apiRouter = Router();
apiRouter.get('/health', baseController.health);

entities.forEach((entity) => {
  apiRouter.get(`/${entity}`, clerkAuthPlaceholder, baseController.notImplemented(`GET /${entity}`));
  apiRouter.post(`/${entity}`, clerkAuthPlaceholder, baseController.notImplemented(`POST /${entity}`));
});
