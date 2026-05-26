import { Schema, model } from 'mongoose';
const VendorRequestSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User' }, businessName: String, status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' } }, { timestamps: true });
export const VendorRequest = model('VendorRequest', VendorRequestSchema);
