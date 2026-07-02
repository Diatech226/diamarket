import { Request, Response } from 'express';
import { walletService } from './wallet.service';
export function listWallets(_req: Request, res: Response) { res.json(walletService.listWallets()); }
export function getWallet(req: Request, res: Response) { const wallet = walletService.getWallet(req.params.id); if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found', error: { code: 'WALLET_NOT_FOUND' } }); return res.json(wallet); }
