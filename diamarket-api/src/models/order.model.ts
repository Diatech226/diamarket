import { Schema, model } from 'mongoose';
const OrderSchema = new Schema({ customerId: { type: Schema.Types.ObjectId, ref: 'User' }, vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' }, items: [{ productId: { type: Schema.Types.ObjectId, ref: 'Product' }, quantity: Number, unitPrice: Number }], totalAmount: Number, currency: { type: String, enum: ['FCFA','USD'], default: 'FCFA' }, status: { type: String, enum: ['pending','confirmed','cancelled','shipped'], default: 'pending' } }, { timestamps: true });
export const Order = model('Order', OrderSchema);
