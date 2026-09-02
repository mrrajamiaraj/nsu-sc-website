import { z } from "zod";
import { optionalEmailSchema, optionalPhoneSchema, optionalUrlSchema, requiredString } from "./shared";

export const memberSchema = z
  .object({
    name: requiredString("Name"),
    designation: requiredString("Designation"),
    tier: z.enum(["Executive", "Sub-Executive", "General"]),
    email: optionalEmailSchema,
    phone: optionalPhoneSchema,
    facebook: optionalUrlSchema,
    linkedin: optionalUrlSchema,
    additionalInfo: z.string().optional().nullable(),
  })
  .refine((data) => Boolean(data.email || data.phone || data.facebook || data.linkedin), {
    message: "Provide at least one contact option: email, phone, Facebook, or LinkedIn.",
    path: ["email"],
  });
