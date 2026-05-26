import { Schema, model } from 'mongoose';

export const ORDER_STATUSES = ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export const SHIPMENT_STATUSES = ['not_created', 'estimated', 'created', 'in_transit', 'delivered', 'failed'] as const;

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['FCFA', 'USD'], default: 'FCFA' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    shipmentStatus: { type: String, enum: SHIPMENT_STATUSES, default: 'not_created', index: true },
    shippingEstimate: {
      provider: String,
      estimatedCost: Number,
      estimatedDeliveryDays: Number,
      simulated: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export const Order = model('Order', OrderSchema);
