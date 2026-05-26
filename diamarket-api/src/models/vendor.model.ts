import { Schema, model } from 'mongoose';
const VendorSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User' }, shopName: String, isActive: { type: Boolean, default: true }, marketplacePointId: { type: Schema.Types.ObjectId, ref: 'MarketplacePoint' } }, { timestamps: true });
export const Vendor = model('Vendor', VendorSchema);
