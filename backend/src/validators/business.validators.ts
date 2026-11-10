import { z } from 'zod';

const phoneRegex = /^[+]?[\d\s\-()]{10,20}$/;

export const createWholesaleEnquirySchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(200),
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(250),
  mobile: z
    .string()
    .trim()
    .regex(phoneRegex, 'Enter a valid mobile number (at least 10 digits)')
    .max(20),
  whatsapp: z
    .string()
    .trim()
    .regex(phoneRegex, 'Enter a valid WhatsApp number')
    .max(20)
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .max(200)
    .optional()
    .or(z.literal('')),
  state: z.string().trim().min(1, 'State is required').max(100),
  district: z.string().trim().min(1, 'District is required').max(100),
  businessType: z.string().trim().min(1, 'Business type is required').max(100),
  interestedProducts: z
    .array(z.string().trim().min(1))
    .min(1, 'Please select at least one product'),
  requiredQuantity: z.string().trim().min(1, 'Required quantity is required').max(200),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type CreateWholesaleEnquiryInput = z.infer<typeof createWholesaleEnquirySchema>;

export const updateWholesaleEnquirySchema = z.object({
  status: z
    .enum(['pending', 'contacted', 'quotation_sent', 'negotiation', 'converted', 'rejected'])
    .optional(),
  adminNotes: z.string().trim().max(3000).optional(),
});

export type UpdateWholesaleEnquiryInput = z.infer<typeof updateWholesaleEnquirySchema>;

export const wholesaleEnquiryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z
    .enum(['all', 'pending', 'contacted', 'quotation_sent', 'negotiation', 'converted', 'rejected'])
    .default('all'),
  sortBy: z.enum(['createdAt', 'enquiryId', 'businessName', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type WholesaleEnquiryListQuery = z.infer<typeof wholesaleEnquiryListQuerySchema>;

export const createDistributorApplicationSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(200),
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(250),
  mobile: z
    .string()
    .trim()
    .regex(phoneRegex, 'Enter a valid mobile number (at least 10 digits)')
    .max(20),
  whatsapp: z
    .string()
    .trim()
    .regex(phoneRegex, 'Enter a valid WhatsApp number')
    .max(20)
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .max(200)
    .optional()
    .or(z.literal('')),
  state: z.string().trim().min(1, 'State is required').max(100),
  district: z.string().trim().min(1, 'District is required').max(100),
  city: z.string().trim().min(1, 'City / Town is required').max(100),
  address: z.string().trim().min(3, 'Full business address is required').max(500),
  businessType: z.string().trim().min(1, 'Business type is required').max(100),
  distributionExperience: z.enum(['yes', 'no']),
  experienceDetails: z.string().trim().max(2000).optional().or(z.literal('')),
  interestedCategories: z
    .array(z.string().trim().min(1))
    .min(1, 'Please select at least one product category'),
  additionalInformation: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type CreateDistributorApplicationInput = z.infer<typeof createDistributorApplicationSchema>;

export const updateDistributorApplicationSchema = z.object({
  status: z
    .enum(['pending', 'under_review', 'contacted', 'approved', 'rejected', 'deactivated'])
    .optional(),
  adminNotes: z.string().trim().max(3000).optional(),
});

export type UpdateDistributorApplicationInput = z.infer<typeof updateDistributorApplicationSchema>;

export const distributorApplicationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z
    .enum(['all', 'pending', 'under_review', 'contacted', 'approved', 'rejected', 'deactivated'])
    .default('all'),
  sortBy: z.enum(['createdAt', 'applicationId', 'businessName', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type DistributorApplicationListQuery = z.infer<typeof distributorApplicationListQuerySchema>;
