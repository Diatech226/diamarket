import { Request, Response } from 'express';
import { VendorRequest } from '../models/vendor-request.model';
import { Vendor } from '../models/vendor.model';
import { User } from '../models/user.model';

const requestStatuses = ['pending', 'approved', 'rejected'];
const PUBLIC_SUCCESS_MESSAGE = 'Votre demande vendeur a été envoyée.';
const VALIDATION_MESSAGE = 'Veuillez renseigner les informations obligatoires.';

const cleanString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const cleanOptionalString = (value: unknown) => {
  const cleaned = cleanString(value);
  return cleaned || undefined;
};
const cleanEmail = (value: unknown) => cleanString(value).toLowerCase();
const isValidEmail = (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value: string) => !value || /^[+()\d\s.-]{6,32}$/.test(value);

export const validatePublicVendorRequest = (req: Request) => {
  const businessName = cleanString(req.body.businessName);
  const businessEmail = cleanEmail(req.body.businessEmail ?? req.body.email);
  const phone = cleanString(req.body.phone);
  const honeypot = cleanString(req.body.website ?? req.body.companyWebsite ?? req.body._gotcha);

  if (honeypot) return VALIDATION_MESSAGE;
  if (!businessName || (!businessEmail && !phone)) return VALIDATION_MESSAGE;
  if (!isValidEmail(businessEmail) || !isValidPhone(phone)) return VALIDATION_MESSAGE;
  return null;
};

export const vendorRequestsController = {
  async create(req: Request, res: Response) {
    const auth = (req as Request & { auth?: { userId: string } }).auth;
    const businessEmail = cleanEmail(req.body.businessEmail ?? req.body.email);
    const phone = cleanOptionalString(req.body.phone);
    const businessName = cleanString(req.body.businessName);
    const payload = {
      userId: auth?.userId || undefined,
      businessName,
      businessEmail: businessEmail || undefined,
      phone,
      country: cleanOptionalString(req.body.country),
      city: cleanOptionalString(req.body.city),
      notes: cleanOptionalString(req.body.notes),
      requestedCommissionRate: req.body.requestedCommissionRate,
      status: 'pending',
    };

    const duplicateFilter = {
      status: 'pending',
      $or: [
        ...(businessEmail ? [{ businessEmail }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    };
    const existing = duplicateFilter.$or.length > 0 ? await VendorRequest.findOne(duplicateFilter) : null;
    const data = existing || await VendorRequest.create(payload);

    return res.status(existing ? 200 : 201).json({
      success: true,
      message: PUBLIC_SUCCESS_MESSAGE,
      data: { id: data._id },
    });
  },
  async list(req: Request, res: Response) {
    const filter: Record<string, unknown> = {};
    if (req.query.status && requestStatuses.includes(String(req.query.status))) filter.status = req.query.status;
    const data = await VendorRequest.find(filter).populate('userId reviewedBy').sort({ createdAt: -1 });
    return res.json({ success: true, data });
  },
  async getById(req: Request, res: Response) {
    const data = await VendorRequest.findById(req.params.id).populate('userId reviewedBy');
    if (!data) return res.status(404).json({ success: false, message: 'Vendor request not found' });
    return res.json({ success: true, data });
  },
  async approve(req: Request, res: Response) {
    const auth = (req as Request & { auth?: { userId: string } }).auth;
    const request = await VendorRequest.findByIdAndUpdate(req.params.id, { status: 'approved', adminComment: req.body.adminComment, $push: { decisionHistory: { action: 'approved', comment: req.body.adminComment, decidedBy: auth?.userId, decidedAt: new Date() } }, reviewedBy: auth?.userId, reviewedAt: new Date() }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Vendor request not found' });
    const vendor = request.userId ? await Vendor.findOneAndUpdate({ userId: request.userId }, { shopName: request.businessName, status: 'active', isActive: true, commissionRate: request.requestedCommissionRate ?? undefined, phone: request.phone, country: request.country, city: request.city }, { new: true, upsert: true, runValidators: true }) : null;
    if (request.userId) await User.findByIdAndUpdate(request.userId, { role: 'vendor' }, { runValidators: true });
    return res.json({ success: true, data: { request, vendor } });
  },
  async reject(req: Request, res: Response) {
    const auth = (req as Request & { auth?: { userId: string } }).auth;
    const request = await VendorRequest.findByIdAndUpdate(req.params.id, { status: 'rejected', adminComment: req.body.adminComment, $push: { decisionHistory: { action: 'rejected', comment: req.body.adminComment, decidedBy: auth?.userId, decidedAt: new Date() } }, reviewedBy: auth?.userId, reviewedAt: new Date() }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Vendor request not found' });
    return res.json({ success: true, data: request });
  },
  async updateStatus(req: Request, res: Response) {
    if (req.body.status === 'approved') return vendorRequestsController.approve(req, res);
    if (req.body.status === 'rejected') return vendorRequestsController.reject(req, res);
    return res.status(400).json({ success: false, message: 'Invalid vendor request status' });
  },
  async remove(req: Request, res: Response) {
    const data = await VendorRequest.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Vendor request not found' });
    return res.json({ success: true, data: { id: data._id } });
  },
};
