import { z } from "zod";
import { optionalPhoneSchema, optionalUrlSchema, requiredString } from "./shared";

export const alumniSchema = z.object({
  name: requiredString("Name"),
  classYearId: z.string().uuid("Select a class year"),
  tier: z.enum(["Executive", "Sub-Executive"]),
  team: z.string().trim().optional().nullable(),
  currentRole: z.string().trim().optional().nullable(),
  quote: z.string().optional().nullable(),
  facebook: optionalUrlSchema,
  phone: optionalPhoneSchema,
});

export const alumniClassYearSchema = z.object({
  label: requiredString("Label"),
});
