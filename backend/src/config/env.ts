import "dotenv/config";
import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .transform((val) => val.trim())
  .transform((val) => (val === "" ? undefined : val))
  .optional();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine(
      (value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      "MONGODB_URI must be a MongoDB connection URI"
    ),
  FRONTEND_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  SESSION_COOKIE_NAME: z.string().min(1).default("yumnest_admin_session"),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  SESSION_COOKIE_SECURE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  SESSION_COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().max(100).default(10),
  CLOUDINARY_CLOUD_NAME: optionalTrimmedString,
  CLOUDINARY_API_KEY: optionalTrimmedString,
  CLOUDINARY_API_SECRET: optionalTrimmedString,
  YOUTUBE_API_KEY: optionalTrimmedString,
  INSTAGRAM_ACCESS_TOKEN: optionalTrimmedString,
  ADMIN_NAME: optionalTrimmedString,
  ADMIN_EMAIL: optionalTrimmedString,
  ADMIN_PASSWORD: optionalTrimmedString,
});

export type Environment = z.infer<typeof envSchema>;

export function loadEnvironment(): Environment {
  const parsedEnvironment = envSchema.safeParse(process.env);

  if (!parsedEnvironment.success) {
    const fields = [...new Set(parsedEnvironment.error.issues.map((issue) => issue.path.join(".")).filter(Boolean))];
    throw new Error(`Invalid environment configuration: ${fields.join(", ") || "unknown field"}`);
  }

  if (parsedEnvironment.data.NODE_ENV === "production" && !parsedEnvironment.data.SESSION_COOKIE_SECURE) {
    throw new Error("Invalid environment configuration: SESSION_COOKIE_SECURE must be true in production");
  }

  if (parsedEnvironment.data.SESSION_COOKIE_SAME_SITE === "none" && !parsedEnvironment.data.SESSION_COOKIE_SECURE) {
    throw new Error("Invalid environment configuration: SESSION_COOKIE_SECURE must be true with SameSite=none");
  }

  const cloudinaryValues = [parsedEnvironment.data.CLOUDINARY_CLOUD_NAME, parsedEnvironment.data.CLOUDINARY_API_KEY, parsedEnvironment.data.CLOUDINARY_API_SECRET];
  if (cloudinaryValues.some(Boolean) && !cloudinaryValues.every(Boolean)) {
    throw new Error("Invalid environment configuration: all Cloudinary variables are required together");
  }

  return parsedEnvironment.data;
}
