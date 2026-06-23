import { z } from "zod";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

function normalizeEmail(email) {
  const parts = email.toLowerCase().trim().split("@");
  if (parts.length !== 2) return email.toLowerCase().trim();
  let [local, domain] = parts;
  // Remove plus addressing (e.g. user+tag -> user)
  local = local.split("+")[0];
  // Remove dots from the local part to prevent bypassing uniqueness check
  local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export const adminRegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleInitial: z.string().max(10, "Middle initial must be at most 10 characters").optional().or(z.literal("")),
}).superRefine(async (data, ctx) => {
  const { email, password } = data;

  try {
    // 1. Fetch existing admins
    const [existingAdmins] = await pool.query("SELECT email, password_hash FROM admins");
    
    // 2. Validate similar email addresses
    const targetNormalized = normalizeEmail(email);
    const [localNew] = email.toLowerCase().trim().split("@");

    for (const admin of existingAdmins) {
      const targetExistingNormalized = normalizeEmail(admin.email);
      const [localExisting] = admin.email.toLowerCase().trim().split("@");

      if (targetNormalized === targetExistingNormalized) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "An identical or alias email address is already registered.",
          path: ["email"],
        });
        break;
      }

      if (getLevenshteinDistance(localNew, localExisting) <= 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This email address is too similar to an existing administrator's email.",
          path: ["email"],
        });
        break;
      }
    }

    // 3. Validate password uniqueness against existing password hashes
    for (const admin of existingAdmins) {
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (isMatch) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This password has already been used by another administrator. Please choose a different password.",
          path: ["password"],
        });
        break;
      }
    }
  } catch (error) {
    console.error("Database query failed during admin registration validation:", error);
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Validation failed due to a server error.",
      path: [],
    });
  }
});
