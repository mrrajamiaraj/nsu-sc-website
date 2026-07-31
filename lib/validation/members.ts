import { z } from "zod";
import { emailSchema, phoneSchema, requiredString } from "./shared";

export const memberSchema = z.object({
  name: requiredString("Name"),
  designation: requiredString("Designation"),
  tier: z.enum(["Executive", "Sub-Executive", "General"]),
  email: emailSchema,
  phone: phoneSchema,
  additionalInfo: z.string().optional().nullable(),
});
