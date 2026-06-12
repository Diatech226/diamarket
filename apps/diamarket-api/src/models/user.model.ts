import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    clerkId: { type: String, unique: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    passwordHash: { type: String, select: false },
    disabled: { type: Boolean, default: false },
    role: { type: String, enum: ['client', 'user', 'viewer', 'vendeur', 'marketplace_point_focal', 'agent_logistique', 'author', 'editor', 'admin', 'super_admin'], default: 'client' },
    permissions: { type: [String], default: [] },
    marketplacePointId: { type: Schema.Types.ObjectId, ref: 'MarketplacePoint' },
    countryScope: { type: [String], default: [] },
    locale: { type: String, default: 'fr' },
    preferredCurrency: { type: String, enum: ['FCFA', 'USD'], default: 'FCFA' },
  },
  { timestamps: true },
);

export const User = model('User', UserSchema);
