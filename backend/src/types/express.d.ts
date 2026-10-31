import type { AdminRole } from "../models/admin.model";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        name: string;
        email: string;
        role: AdminRole;
      };
    }
  }
}

export {};
