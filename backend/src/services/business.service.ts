import mongoose from 'mongoose';
import {
  WholesaleEnquiryModel,
  type IWholesaleEnquiry,
  type WholesaleEnquiryStatus,
} from '../models/wholesale-enquiry.model';
import {
  DistributorApplicationModel,
  type IDistributorApplication,
  type DistributorStatus,
} from '../models/distributor-application.model';
import type {
  CreateWholesaleEnquiryInput,
  UpdateWholesaleEnquiryInput,
  WholesaleEnquiryListQuery,
  CreateDistributorApplicationInput,
  UpdateDistributorApplicationInput,
  DistributorApplicationListQuery,
} from '../validators/business.validators';
import { HttpError } from '../utils/httpError';

// ─── ID Generators ──────────────────────────────────────────────────────────

async function generateEnquiryId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `WNQ-${year}-`;

  const last = await WholesaleEnquiryModel.findOne(
    { enquiryId: { $regex: `^${prefix}` } },
    { enquiryId: 1 },
    { sort: { createdAt: -1 } }
  ).lean();

  let nextSeq = 1;
  if (last?.enquiryId) {
    const parts = last.enquiryId.split('-');
    const lastSeq = parseInt(parts[2] ?? '0', 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

async function generateApplicationId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DST-${year}-`;

  const last = await DistributorApplicationModel.findOne(
    { applicationId: { $regex: `^${prefix}` } },
    { applicationId: 1 },
    { sort: { createdAt: -1 } }
  ).lean();

  let nextSeq = 1;
  if (last?.applicationId) {
    const parts = last.applicationId.split('-');
    const lastSeq = parseInt(parts[2] ?? '0', 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

// ─── Wholesale Service ──────────────────────────────────────────────────────

export async function createWholesaleEnquiry(
  input: CreateWholesaleEnquiryInput
): Promise<IWholesaleEnquiry> {
  // Guard against duplicate rapid submissions within 2 minutes from same mobile
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const recentDuplicate = await WholesaleEnquiryModel.findOne({
    mobile: input.mobile,
    businessName: input.businessName,
    createdAt: { $gte: twoMinutesAgo },
  }).lean();

  if (recentDuplicate) {
    throw new HttpError(
      429,
      'A recent wholesale enquiry has already been submitted. Our team will contact you shortly.',
      'DUPLICATE_SUBMISSION'
    );
  }

  const enquiryId = await generateEnquiryId();

  const enquiry = new WholesaleEnquiryModel({
    enquiryId,
    fullName: input.fullName,
    businessName: input.businessName,
    mobile: input.mobile,
    whatsapp: input.whatsapp || undefined,
    email: input.email || undefined,
    state: input.state,
    district: input.district,
    businessType: input.businessType,
    interestedProducts: input.interestedProducts,
    requiredQuantity: input.requiredQuantity,
    message: input.message || undefined,
    status: 'pending',
  });

  return enquiry.save();
}

export async function listWholesaleEnquiries(
  query: WholesaleEnquiryListQuery
): Promise<{ enquiries: IWholesaleEnquiry[]; total: number; page: number; limit: number }> {
  const filter: Record<string, unknown> = {};

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.search?.trim()) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { enquiryId: regex },
      { fullName: regex },
      { businessName: regex },
      { mobile: regex },
      { district: regex },
      { state: regex },
      { businessType: regex },
    ];
  }

  const sortField = query.sortBy || 'createdAt';
  const sortDir = query.sortOrder === 'asc' ? 1 : -1;

  const [enquiries, total] = await Promise.all([
    WholesaleEnquiryModel.find(filter)
      .sort({ [sortField]: sortDir })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<IWholesaleEnquiry[]>(),
    WholesaleEnquiryModel.countDocuments(filter),
  ]);

  return { enquiries, total, page: query.page, limit: query.limit };
}

export async function getWholesaleEnquiry(idOrEnquiryId: string): Promise<IWholesaleEnquiry | null> {
  if (mongoose.isValidObjectId(idOrEnquiryId)) {
    return WholesaleEnquiryModel.findById(idOrEnquiryId).lean<IWholesaleEnquiry>();
  }
  return WholesaleEnquiryModel.findOne({ enquiryId: idOrEnquiryId }).lean<IWholesaleEnquiry>();
}

export async function updateWholesaleEnquiry(
  idOrEnquiryId: string,
  input: UpdateWholesaleEnquiryInput
): Promise<IWholesaleEnquiry | null> {
  const filter = mongoose.isValidObjectId(idOrEnquiryId)
    ? { _id: idOrEnquiryId }
    : { enquiryId: idOrEnquiryId };

  const update: Record<string, unknown> = {};
  if (input.status !== undefined) update.status = input.status;
  if (input.adminNotes !== undefined) update.adminNotes = input.adminNotes;

  return WholesaleEnquiryModel.findOneAndUpdate(filter, { $set: update }, { new: true }).lean<IWholesaleEnquiry>();
}

export async function deleteWholesaleEnquiry(idOrEnquiryId: string): Promise<boolean> {
  const filter = mongoose.isValidObjectId(idOrEnquiryId)
    ? { _id: idOrEnquiryId }
    : { enquiryId: idOrEnquiryId };

  const result = await WholesaleEnquiryModel.deleteOne(filter);
  return result.deletedCount === 1;
}

export async function getWholesaleStats(): Promise<{
  total: number;
  pending: number;
  contacted: number;
  quotation_sent: number;
  negotiation: number;
  converted: number;
  rejected: number;
}> {
  const [total, pending, contacted, quotation_sent, negotiation, converted, rejected] = await Promise.all([
    WholesaleEnquiryModel.countDocuments(),
    WholesaleEnquiryModel.countDocuments({ status: 'pending' }),
    WholesaleEnquiryModel.countDocuments({ status: 'contacted' }),
    WholesaleEnquiryModel.countDocuments({ status: 'quotation_sent' }),
    WholesaleEnquiryModel.countDocuments({ status: 'negotiation' }),
    WholesaleEnquiryModel.countDocuments({ status: 'converted' }),
    WholesaleEnquiryModel.countDocuments({ status: 'rejected' }),
  ]);

  return { total, pending, contacted, quotation_sent, negotiation, converted, rejected };
}

// ─── Distributor Service ───────────────────────────────────────────────────

export async function createDistributorApplication(
  input: CreateDistributorApplicationInput
): Promise<IDistributorApplication> {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const recentDuplicate = await DistributorApplicationModel.findOne({
    mobile: input.mobile,
    businessName: input.businessName,
    createdAt: { $gte: twoMinutesAgo },
  }).lean();

  if (recentDuplicate) {
    throw new HttpError(
      429,
      'A distributor application from this number has recently been submitted. Our team will review and contact you.',
      'DUPLICATE_SUBMISSION'
    );
  }

  const applicationId = await generateApplicationId();

  const application = new DistributorApplicationModel({
    applicationId,
    fullName: input.fullName,
    businessName: input.businessName,
    mobile: input.mobile,
    whatsapp: input.whatsapp || undefined,
    email: input.email || undefined,
    state: input.state,
    district: input.district,
    city: input.city,
    address: input.address,
    businessType: input.businessType,
    distributionExperience: input.distributionExperience,
    experienceDetails: input.experienceDetails || undefined,
    interestedCategories: input.interestedCategories,
    additionalInformation: input.additionalInformation || undefined,
    status: 'pending',
  });

  return application.save();
}

export async function listDistributorApplications(
  query: DistributorApplicationListQuery
): Promise<{ applications: IDistributorApplication[]; total: number; page: number; limit: number }> {
  const filter: Record<string, unknown> = {};

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.search?.trim()) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { applicationId: regex },
      { fullName: regex },
      { businessName: regex },
      { mobile: regex },
      { district: regex },
      { city: regex },
      { state: regex },
      { businessType: regex },
    ];
  }

  const sortField = query.sortBy || 'createdAt';
  const sortDir = query.sortOrder === 'asc' ? 1 : -1;

  const [applications, total] = await Promise.all([
    DistributorApplicationModel.find(filter)
      .sort({ [sortField]: sortDir })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<IDistributorApplication[]>(),
    DistributorApplicationModel.countDocuments(filter),
  ]);

  return { applications, total, page: query.page, limit: query.limit };
}

export async function getDistributorApplication(idOrAppId: string): Promise<IDistributorApplication | null> {
  if (mongoose.isValidObjectId(idOrAppId)) {
    return DistributorApplicationModel.findById(idOrAppId).lean<IDistributorApplication>();
  }
  return DistributorApplicationModel.findOne({ applicationId: idOrAppId }).lean<IDistributorApplication>();
}

export async function updateDistributorApplication(
  idOrAppId: string,
  input: UpdateDistributorApplicationInput
): Promise<IDistributorApplication | null> {
  const filter = mongoose.isValidObjectId(idOrAppId)
    ? { _id: idOrAppId }
    : { applicationId: idOrAppId };

  const update: Record<string, unknown> = {};
  if (input.status !== undefined) {
    update.status = input.status;
    if (input.status === 'approved') {
      update.approvedAt = new Date();
    }
  }
  if (input.adminNotes !== undefined) update.adminNotes = input.adminNotes;

  return DistributorApplicationModel.findOneAndUpdate(filter, { $set: update }, { new: true }).lean<IDistributorApplication>();
}

export async function deleteDistributorApplication(idOrAppId: string): Promise<boolean> {
  const filter = mongoose.isValidObjectId(idOrAppId)
    ? { _id: idOrAppId }
    : { applicationId: idOrAppId };

  const result = await DistributorApplicationModel.deleteOne(filter);
  return result.deletedCount === 1;
}

export async function listApprovedDistributors(query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'approved' | 'deactivated';
}): Promise<{ distributors: IDistributorApplication[]; total: number }> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 50;

  const filter: Record<string, unknown> = {
    status: query.status && query.status !== 'all' ? query.status : { $in: ['approved', 'deactivated'] },
  };

  if (query.search?.trim()) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { applicationId: regex },
      { fullName: regex },
      { businessName: regex },
      { mobile: regex },
      { city: regex },
      { district: regex },
      { state: regex },
    ];
  }

  const [distributors, total] = await Promise.all([
    DistributorApplicationModel.find(filter)
      .sort({ approvedAt: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<IDistributorApplication[]>(),
    DistributorApplicationModel.countDocuments(filter),
  ]);

  return { distributors, total };
}

export async function getDistributorStats(): Promise<{
  total: number;
  pending: number;
  under_review: number;
  contacted: number;
  approved: number;
  rejected: number;
  deactivated: number;
}> {
  const [total, pending, under_review, contacted, approved, rejected, deactivated] = await Promise.all([
    DistributorApplicationModel.countDocuments(),
    DistributorApplicationModel.countDocuments({ status: 'pending' }),
    DistributorApplicationModel.countDocuments({ status: 'under_review' }),
    DistributorApplicationModel.countDocuments({ status: 'contacted' }),
    DistributorApplicationModel.countDocuments({ status: 'approved' }),
    DistributorApplicationModel.countDocuments({ status: 'rejected' }),
    DistributorApplicationModel.countDocuments({ status: 'deactivated' }),
  ]);

  return { total, pending, under_review, contacted, approved, rejected, deactivated };
}

// ─── Business Notification Stats (Dashboard badges) ─────────────────────────

export async function getBusinessOverviewStats(): Promise<{
  pendingWholesaleCount: number;
  pendingDistributorCount: number;
  totalPendingBusiness: number;
}> {
  const [pendingWholesaleCount, pendingDistributorCount] = await Promise.all([
    WholesaleEnquiryModel.countDocuments({ status: 'pending' }),
    DistributorApplicationModel.countDocuments({ status: 'pending' }),
  ]);

  return {
    pendingWholesaleCount,
    pendingDistributorCount,
    totalPendingBusiness: pendingWholesaleCount + pendingDistributorCount,
  };
}
