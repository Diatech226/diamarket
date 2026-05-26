import { Schema, model } from 'mongoose';
const ProductSchema = new Schema({ vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' }, categoryId: { type: Schema.Types.ObjectId, ref: 'Category' }, name: String, slug: String, description: String, price: Number, currency: { type: String, enum: ['FCFA','USD'], default: 'FCFA' }, stock: Number, translations: { fr: Object, en: Object, zh: Object } }, { timestamps: true });
export const Product = model('Product', ProductSchema);
