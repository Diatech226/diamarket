import { Request, Response } from 'express';
import { Order, ORDER_STATUSES } from '../models/order.model';
import { Shipment } from '../models/shipment.model';
import { shippingService } from '../services/shipping';
import { getAuth } from '../middlewares/requireAuth';
import { orderScope } from '../middlewares/resource-access';

export const ordersController = {
  async create(req: Request, res: Response) {
    const auth = getAuth(req)!;
    const payload = { ...req.body, customer: auth.userId, status: 'pending', paymentStatus: 'unpaid' };
    const estimate = await shippingService.estimateShipping(payload);
    const order = await Order.create({ ...payload, shipmentStatus: 'estimated', shippingEstimate: estimate });
    return res.status(201).json({ data: order });
  },
  async list(req: Request, res: Response) {
    const data = await Order.find(orderScope(getAuth(req)!)).populate('customer vendor items.product').sort({ createdAt: -1 });
    return res.json({ data });
  },
  async getById(req: Request, res: Response) {
    const data = await Order.findOne({ _id: req.params.id, ...orderScope(getAuth(req)!) }).populate('customer vendor items.product');
    if (!data) return res.status(404).json({ message: 'Order not found' });
    return res.json({ data });
  },
  async updateStatus(req: Request, res: Response) {
    if (!ORDER_STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status' });
    const data = await Order.findOneAndUpdate({ _id: req.params.id, ...orderScope(getAuth(req)!) }, { status: req.body.status }, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ message: 'Order not found' });
    if (req.body.status === 'processing') {
      const shipment = await shippingService.createShipment({ orderId: data.id, estimatedCost: data.shippingEstimate?.estimatedCost || 0, totalAmount: data.totalAmount, currency: data.currency });
      data.shipmentStatus = 'created'; await data.save();
      await Shipment.create({ order: data.id, carrier: shipment.simulated ? 'mock' : 'external', trackingNumber: shipment.trackingNumber, status: 'created', externalProviderPayload: shipment.raw });
      return res.json({ data, shipment });
    }
    return res.json({ data });
  },
  async getPaymentStatus(req: Request, res: Response) {
    const data = await Order.findOne({ _id: req.params.id, ...orderScope(getAuth(req)!) }).select('status paymentProvider paymentStatus paymentMethod diapaySessionId diapayPaymentId checkoutUrl paidAt cancelledAt failedAt totalAmount currency');
    if (!data) return res.status(404).json({ message: 'Order not found' });
    return res.json({ data });
  },
  async syncShipmentStatus(req: Request, res: Response) {
    const order = await Order.findOne({ _id: req.params.id, ...orderScope(getAuth(req)!) });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const shipment = await Shipment.findOne({ order: order.id }).sort({ createdAt: -1 });
    if (!shipment?.trackingNumber) return res.status(404).json({ message: 'Shipment not found or tracking number unavailable' });
    const status = await shippingService.syncShipmentStatus(shipment.trackingNumber);
    order.shipmentStatus = status.shipmentStatus; order.status = status.orderStatus; await order.save();
    shipment.status = status.shipmentStatus; shipment.externalProviderPayload = status.raw; await shipment.save();
    return res.json({ data: { order, shipment, providerStatus: status.providerStatus } });
  },
};
