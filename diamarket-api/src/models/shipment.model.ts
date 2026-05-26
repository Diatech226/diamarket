import { Schema, model } from 'mongoose';
const ShipmentSchema = new Schema({ orderId: { type: Schema.Types.ObjectId, ref: 'Order' }, logisticsAgentId: { type: Schema.Types.ObjectId, ref: 'User' }, carrier: String, trackingNumber: String, status: { type: String, enum: ['pending','in_transit','delivered'], default: 'pending' }, externalProviderPayload: Schema.Types.Mixed }, { timestamps: true });
export const Shipment = model('Shipment', ShipmentSchema);
