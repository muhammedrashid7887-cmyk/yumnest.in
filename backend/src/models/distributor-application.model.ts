import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type DistributorStatus =
  | 'pending'
  | 'under_review'
  | 'contacted'
  | 'approved'
  | 'rejected'
  | 'deactivated';

export interface IDistributorApplication extends Document {
  applicationId: string;
  fullName: string;
  businessName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  state: string;
  district: string;
  city: string;
  address: string;
  businessType: string;
  distributionExperience: 'yes' | 'no';
  experienceDetails?: string;
  interestedCategories: string[];
  additionalInformation?: string;
  status: DistributorStatus;
  adminNotes?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const distributorApplicationSchema = new Schema<IDistributorApplication>(
  {
    applicationId: {
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
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    businessType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    distributionExperience: {
      type: String,
      required: true,
      enum: ['yes', 'no'],
      default: 'no',
    },
    experienceDetails: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    interestedCategories: {
      type: [String],
      required: true,
      validate: [(val: string[]) => Array.isArray(val) && val.length > 0, 'At least one category must be selected'],
    },
    additionalInformation: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'under_review', 'contacted', 'approved', 'rejected', 'deactivated'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'distributorApplications',
  }
);

distributorApplicationSchema.index({ createdAt: -1 });

export const DistributorApplicationModel: Model<IDistributorApplication> =
  mongoose.models.DistributorApplication ||
  mongoose.model<IDistributorApplication>('DistributorApplication', distributorApplicationSchema);
