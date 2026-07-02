import { Request, Response } from 'express';
import { balanceService } from './balance.service';
export function getBalances(_req: Request, res: Response) { res.json(balanceService.getBalances()); }
