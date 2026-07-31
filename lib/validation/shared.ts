import { z } from "zod";

// FR-47
export const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email address");

// FR-48: digits, spaces, +, -, parentheses; 7-20 chars
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .regex(/^[0-9+\-() ]{7,20}$/, "Enter a valid phone number (digits, spaces, +, -, parentheses; 7-20 characters)");

// FR-51: reject invalid calendar dates (e.g. 2026-02-30) that `new Date()` would silently roll forward.
export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export const calendarDateSchema = z
  .string()
  .min(1, "Date is required")
  .refine(isValidCalendarDate, "Enter a valid calendar date (YYYY-MM-DD)");

export const optionalCalendarDateSchema = z
  .string()
  .optional()
  .nullable()
  .refine((value) => !value || isValidCalendarDate(value), "Enter a valid calendar date (YYYY-MM-DD)");

// FR-50: JPG/PNG/WebP, max 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Image must be JPG, PNG, or WebP.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

export const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`);
