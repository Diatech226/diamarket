import { Request, Response } from 'express';
import { createMarketplacePayout, createSplitPayment, createVendorAccount, getVendorWallet, listMarketplaceLedger, listMarketplaceState, refundEscrow, releaseEscrow } from '../services/marketplace-store';
import { sandboxState } from '../services/checkout-store';

function handle(error: unknown, res: Response) {
  const status = typeof error === 'object' && error !== null && 'status' in error ? Number((error as { status: number }).status) : 500;
  const message = error instanceof Error ? error.message : 'Internal server error';
  res.status(status).json({ error: { message } });
}

function merchantFrom(req: Request) {
  return sandboxState.resolveMerchant(req.header('authorization') ?? undefined);
}

export const marketplaceOverview = async (_req: Request, res: Response) => res.json(listMarketplaceState());

export const splitPayment = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await createSplitPayment(req.body, merchantFrom(req)));
  } catch (error) {
    handle(error, res);
  }
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    res.status(201).json(createVendorAccount(req.body));
  } catch (error) {
    handle(error, res);
  }
};

export const getVendorWalletController = async (req: Request, res: Response) => {
  try {
    res.json(getVendorWallet(req.params.id));
  } catch (error) {
    handle(error, res);
  }
};

export const createPayoutController = async (req: Request, res: Response) => {
  try {
    res.status(201).json(createMarketplacePayout(req.body));
  } catch (error) {
    handle(error, res);
  }
};

export const releaseEscrowController = async (req: Request, res: Response) => {
  try {
    res.json(releaseEscrow(req.body));
  } catch (error) {
    handle(error, res);
  }
};

export const refundEscrowController = async (req: Request, res: Response) => {
  try {
    res.json(refundEscrow(req.body));
  } catch (error) {
    handle(error, res);
  }
};

export const marketplaceLedger = async (_req: Request, res: Response) => res.json(listMarketplaceLedger());
