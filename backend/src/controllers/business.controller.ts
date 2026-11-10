import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';
import {
  createWholesaleEnquiry,
  listWholesaleEnquiries,
  getWholesaleEnquiry,
  updateWholesaleEnquiry,
  deleteWholesaleEnquiry,
  getWholesaleStats,
  createDistributorApplication,
  listDistributorApplications,
  getDistributorApplication,
  updateDistributorApplication,
  deleteDistributorApplication,
  listApprovedDistributors,
  getDistributorStats,
  getBusinessOverviewStats,
} from '../services/business.service';
import type {
  CreateWholesaleEnquiryInput,
  UpdateWholesaleEnquiryInput,
  WholesaleEnquiryListQuery,
  CreateDistributorApplicationInput,
  UpdateDistributorApplicationInput,
  DistributorApplicationListQuery,
} from '../validators/business.validators';

// ─── Public Wholesale Enquiry ───────────────────────────────────────────────

export async function createWholesaleEnquiryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as CreateWholesaleEnquiryInput;
    const enquiry = await createWholesaleEnquiry(input);
    res.status(201).json({
      success: true,
      message: 'Wholesale enquiry submitted successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Admin Wholesale Controllers ───────────────────────────────────────────

export async function listWholesaleEnquiriesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as WholesaleEnquiryListQuery;
    const result = await listWholesaleEnquiries(query);
    res.json({
      success: true,
      data: result.enquiries,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getWholesaleEnquiryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id);
    const enquiry = await getWholesaleEnquiry(id);
    if (!enquiry) {
      throw new HttpError(404, 'Wholesale enquiry not found', 'NOT_FOUND');
    }
    res.json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
}

export async function updateWholesaleEnquiryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id);
    const input = req.body as UpdateWholesaleEnquiryInput;
    const updated = await updateWholesaleEnquiry(id, input);
    if (!updated) {
      throw new HttpError(404, 'Wholesale enquiry not found', 'NOT_FOUND');
    }
    res.json({
      success: true,
      message: 'Wholesale enquiry updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteWholesaleEnquiryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id);
    const deleted = await deleteWholesaleEnquiry(id);
    if (!deleted) {
      throw new HttpError(404, 'Wholesale enquiry not found', 'NOT_FOUND');
    }
    res.json({ success: true, message: 'Wholesale enquiry deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getWholesaleStatsController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getWholesaleStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

// ─── Public Distributor Application ─────────────────────────────────────────

export async function createDistributorApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as CreateDistributorApplicationInput;
    const application = await createDistributorApplication(input);
    res.status(201).json({
      success: true,
      message: 'Distributor application submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Admin Distributor Controllers ─────────────────────────────────────────

export async function listDistributorApplicationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as DistributorApplicationListQuery;
    const result = await listDistributorApplications(query);
    res.json({
      success: true,
      data: result.applications,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDistributorApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id);
    const application = await getDistributorApplication(id);
    if (!application) {
      throw new HttpError(404, 'Distributor application not found', 'NOT_FOUND');
    }
    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
}

export async function updateDistributorApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id);
    const input = req.body as UpdateDistributorApplicationInput;
    const updated = await updateDistributorApplication(id, input);
    if (!updated) {
      throw new HttpError(404, 'Distributor application not found', 'NOT_FOUND');
    }
    res.json({
      success: true,
      message: 'Distributor application updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDistributorApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id);
    const deleted = await deleteDistributorApplication(id);
    if (!deleted) {
      throw new HttpError(404, 'Distributor application not found', 'NOT_FOUND');
    }
    res.json({ success: true, message: 'Distributor application deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function listApprovedDistributorsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const search = req.query.search ? String(req.query.search).trim() : undefined;
    const status = req.query.status as 'all' | 'approved' | 'deactivated' | undefined;

    const result = await listApprovedDistributors({ page, limit, search, status });
    res.json({
      success: true,
      data: result.distributors,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDistributorStatsController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getDistributorStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

// ─── Business Overview Notification Stats ───────────────────────────────────

export async function getBusinessOverviewStatsController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getBusinessOverviewStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}
