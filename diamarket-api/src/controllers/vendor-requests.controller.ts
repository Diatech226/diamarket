import { Request, Response } from 'express';
import { VendorRequest } from '../models/vendor-request.model';
import { Vendor } from '../models/vendor.model';

export const vendorRequestsController = {
  async create(req: Request, res: Response) {
    const data = await VendorRequest.create(req.body);
    return res.status(201).json({ data });
  },
  async list(_req: Request, res: Response) {
    const data = await VendorRequest.find().populate('userId').sort({ createdAt: -1 });
    return res.json({ data });
  },
  async approve(req: Request, res: Response) {
    const request = await VendorRequest.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!request) return res.status(404).json({ message: 'Vendor request not found' });

    const vendor = await Vendor.create({ userId: request.userId, shopName: request.businessName, isActive: true });
    return res.json({ data: { request, vendor } });
  },
  async reject(req: Request, res: Response) {
    const request = await VendorRequest.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!request) return res.status(404).json({ message: 'Vendor request not found' });
    return res.json({ data: request });
  },
};
