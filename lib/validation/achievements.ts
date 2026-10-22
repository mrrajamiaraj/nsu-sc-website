import { z } from "zod";
import { optionalCalendarDateSchema, requiredString } from "./shared";

export const achievementSchema = z.object({
  // Both optional: club-wide achievements have no team, and some historical
  // ones have no known date.
  teamId: z.string().trim().optional().nullable(),
  title: requiredString("Title"),
  description: requiredString("Description"),
  date: optionalCalendarDateSchema,
});
