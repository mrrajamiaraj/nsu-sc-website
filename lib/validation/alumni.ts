import { z } from "zod";
import { requiredString } from "./shared";

export const alumniSchema = z.object({
  name: requiredString("Name"),
  graduationYear: z.coerce.number().int().min(1900).max(2100),
  tier: z.enum(["Executive", "Sub-Executive"]),
  team: requiredString("Team"),
  currentRole: requiredString("Current Role"),
  quote: z.string().optional().nullable(),
});
