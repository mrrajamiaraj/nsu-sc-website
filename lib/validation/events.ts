import { z } from "zod";
import { optionalCalendarDateSchema, requiredString } from "./shared";

export const eventSchema = z.object({
  name: requiredString("Name"),
  // Optional for past events whose date isn't recorded; yearOnly shows just its year.
  date: optionalCalendarDateSchema,
  yearOnly: z.boolean(),
  endDate: optionalCalendarDateSchema,
  venue: z.string().trim().optional().nullable(),
  description: requiredString("Description"),
  status: z.enum(["Upcoming", "Running", "Finished"]),
  teamCount: z.coerce.number().int().nonnegative().optional().nullable(),
  participantCount: z.coerce.number().int().nonnegative().optional().nullable(),
  winners: z.string().optional().nullable(),
  runnersUp: z.string().optional().nullable(),
  prizePool: z.string().optional().nullable(),
});
