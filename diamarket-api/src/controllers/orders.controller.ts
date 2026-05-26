import { Request, Response } from 'express';
import { Order, ORDER_STATUSES } from '../models/order.model';
import { shippingService } from '../services/shipping.service';

export const ordersController = {
  async create(req: Request, res: Response) {
    const estimate = await shippingService.estimateShipping(req.body);
    const order = await Order.create({ ...req.body, shipmentStatus: 'estimated', shippingEstimate: estimate });
    return res.status(201).json({ data: order });
  },
  async list(_req: Request, res: Response) {
    const data = await Order.find().populate('customer vendor items.product').sort({ createdAt: -1 });
    return res.json({ data });
  },
  async getById(req: Request, res: Response) {
    const data = await Order.findById(req.params.id).populate('customer vendor items.product');
    if (!data) return res.status(404).json({ message: 'Order not found' });
    return res.json({ data });
  },
  async updateStatus(req: Request, res: Response) {
    if (!ORDER_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    const data = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!data) return res.status(404).json({ message: 'Order not found' });

    if (req.body.status === 'processing') {
      const shipment = await shippingService.createShipment({ orderId: data.id, estimatedCost: data.shippingEstimate?.estimatedCost || 0 });
      data.shipmentStatus = 'created';
      await data.save();
      return res.json({ data, shipment });
    }

    return res.json({ data });
  },
};
