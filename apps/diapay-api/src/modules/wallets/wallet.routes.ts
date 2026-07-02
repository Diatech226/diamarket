import { Router } from 'express';
import { getWallet, listWallets } from './wallet.controller';
export const walletRouter = Router();
walletRouter.get('/', listWallets);
walletRouter.get('/:id', getWallet);
