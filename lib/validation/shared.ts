import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email address");

// Digits, spaces, +, -, parentheses; 7-20 characters.
const PHONE_PATTERN = /^[0-9+\-() ]{7,20}$/;

// Optional variants: empty/omitted is valid, but a non-empty value is still format-checked.
export const optionalEmailSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((value) => !value || z.string().email().safeParse(value).success, "Enter a valid email address");

export const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (value) => !value || PHONE_PATTERN.test(value),
    "Enter a valid phone number (digits, spaces, +, -, parentheses; 7-20 characters)",
  );

export const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((value) => !value || z.string().url().safeParse(value).success, "Enter a valid URL");

// Rejects impossible dates (e.g. 2026-02-30) that `new Date()` would silently roll forward.
function isValidCalendarDate(value: string): boolean {
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

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Image must be JPG, PNG, or WebP.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be 10MB or smaller.";
  }
  return null;
}

const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;

export function validateVideoFile(file: File): string | null {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
    return "Video must be MP4 or WebM.";
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return "Video must be 50MB or smaller.";
  }
  return null;
}

export const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`);
