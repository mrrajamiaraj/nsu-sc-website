import { z } from "zod";
import { requiredString } from "./shared";

export const alumniSchema = z.object({
  name: requiredString("Name"),
  classYearId: z.string().uuid("Select a class year"),
  tier: z.enum(["Executive", "Sub-Executive"]),
  team: requiredString("Team"),
  currentRole: requiredString("Current Role"),
  quote: z.string().optional().nullable(),
});

export const alumniClassYearSchema = z.object({
  label: requiredString("Label"),
});
