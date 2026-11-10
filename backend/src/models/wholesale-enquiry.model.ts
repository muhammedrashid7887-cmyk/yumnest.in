import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type WholesaleEnquiryStatus =
  | 'pending'
  | 'contacted'
  | 'quotation_sent'
  | 'negotiation'
  | 'converted'
  | 'rejected';

export interface IWholesaleEnquiry extends Document {
  enquiryId: string;
  fullName: string;
  businessName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  state: string;
  district: string;
  businessType: string;
  interestedProducts: string[];
  requiredQuantity: string;
  message?: string;
  status: WholesaleEnquiryStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const wholesaleEnquirySchema = new Schema<IWholesaleEnquiry>(
  {
    enquiryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 20,
    },
    whatsapp: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    businessType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    interestedProducts: {
      type: [String],
      required: true,
      validate: [(val: string[]) => Array.isArray(val) && val.length > 0, 'At least one product must be selected'],
    },
    requiredQuantity: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'contacted', 'quotation_sent', 'negotiation', 'converted', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
  },
  {
    timestamps: true,
    collection: 'wholesaleEnquiries',
  }
);

wholesaleEnquirySchema.index({ createdAt: -1 });

export const WholesaleEnquiryModel: Model<IWholesaleEnquiry> =
  mongoose.models.WholesaleEnquiry ||
  mongoose.model<IWholesaleEnquiry>('WholesaleEnquiry', wholesaleEnquirySchema);
