import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import type { Environment } from '../config/env';
import { requireAuthenticatedAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { validateQuery } from '../middleware/validateQuery';
import {
  createWholesaleEnquirySchema,
  updateWholesaleEnquirySchema,
  wholesaleEnquiryListQuerySchema,
  createDistributorApplicationSchema,
  updateDistributorApplicationSchema,
  distributorApplicationListQuerySchema,
} from '../validators/business.validators';
import {
  createWholesaleEnquiryController,
  listWholesaleEnquiriesController,
  getWholesaleEnquiryController,
  updateWholesaleEnquiryController,
  deleteWholesaleEnquiryController,
  getWholesaleStatsController,
  createDistributorApplicationController,
  listDistributorApplicationsController,
  getDistributorApplicationController,
  updateDistributorApplicationController,
  deleteDistributorApplicationController,
  listApprovedDistributorsController,
  getDistributorStatsController,
  getBusinessOverviewStatsController,
} from '../controllers/business.controller';

export function businessRouter(env: Environment): Router {
  const router = Router();
  const authenticated = requireAuthenticatedAdmin(env);

  // Rate limiter for public business submissions (15 requests per 15 minutes per IP)
  const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many submissions from this connection. Please try again later.',
      },
    },
  });

  // ── Public Routes (Customer Wholesale Enquiry & Distributor Application) ──
  router.post(
    '/wholesale/enquiries',
    submissionLimiter,
    validateBody(createWholesaleEnquirySchema),
    createWholesaleEnquiryController
  );

  router.post(
    '/distributors/applications',
    submissionLimiter,
    validateBody(createDistributorApplicationSchema),
    createDistributorApplicationController
  );

  // ── Admin: Business Notifications Overview ────────────────────────────────
  router.get('/admin/business/stats', authenticated, getBusinessOverviewStatsController);

  // ── Admin: Wholesale Enquiries ────────────────────────────────────────────
  router.get('/admin/wholesale/enquiries/stats', authenticated, getWholesaleStatsController);
  router.get(
    '/admin/wholesale/enquiries',
    authenticated,
    validateQuery(wholesaleEnquiryListQuerySchema),
    listWholesaleEnquiriesController
  );
  router.get('/admin/wholesale/enquiries/:id', authenticated, getWholesaleEnquiryController);
  router.patch(
    '/admin/wholesale/enquiries/:id',
    authenticated,
    validateBody(updateWholesaleEnquirySchema),
    updateWholesaleEnquiryController
  );
  router.delete('/admin/wholesale/enquiries/:id', authenticated, deleteWholesaleEnquiryController);

  // ── Admin: Distributor Applications & Approved Network ───────────────────
  router.get('/admin/distributors/applications/stats', authenticated, getDistributorStatsController);
  router.get(
    '/admin/distributors/applications',
    authenticated,
    validateQuery(distributorApplicationListQuerySchema),
    listDistributorApplicationsController
  );
  router.get('/admin/distributors/approved', authenticated, listApprovedDistributorsController);
  router.get('/admin/distributors/applications/:id', authenticated, getDistributorApplicationController);
  router.patch(
    '/admin/distributors/applications/:id',
    authenticated,
    validateBody(updateDistributorApplicationSchema),
    updateDistributorApplicationController
  );
  router.delete(
    '/admin/distributors/applications/:id',
    authenticated,
    deleteDistributorApplicationController
  );

  return router;
}
