import { z } from "zod";
import { optionalEmailSchema, optionalPhoneSchema, optionalUrlSchema, requiredString } from "./shared";

export const memberSchema = z
  .object({
    name: requiredString("Name"),
    designation: z.string().trim().optional().nullable(),
    tier: z.enum(["Executive", "Sub-Executive", "General", "Faculty Advisor"]),
    email: optionalEmailSchema,
    phone: optionalPhoneSchema,
    facebook: optionalUrlSchema,
    linkedin: optionalUrlSchema,
    additionalInfo: z.string().optional().nullable(),
  })
  // Sub-Executive members don't always have a distinct designation.
  .refine((data) => data.tier === "Sub-Executive" || Boolean(data.designation), {
    message: "Designation is required.",
    path: ["designation"],
  })
  .refine((data) => Boolean(data.email || data.phone || data.facebook || data.linkedin), {
    message: "Provide at least one contact option: email, phone, Facebook, or LinkedIn.",
    path: ["email"],
  });
