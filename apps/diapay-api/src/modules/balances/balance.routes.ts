import { Router } from 'express';
import { getBalances } from './balance.controller';
export const balanceRouter = Router();
balanceRouter.get('/', getBalances);
