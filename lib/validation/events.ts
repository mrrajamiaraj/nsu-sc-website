import { z } from "zod";
import { calendarDateSchema, optionalCalendarDateSchema, requiredString } from "./shared";

export const eventSchema = z.object({
  name: requiredString("Name"),
  date: calendarDateSchema,
  endDate: optionalCalendarDateSchema,
  venue: requiredString("Venue"),
  description: requiredString("Description"),
  status: z.enum(["Upcoming", "Running", "Finished"]),
  teamCount: z.coerce.number().int().nonnegative().optional().nullable(),
  participantCount: z.coerce.number().int().nonnegative().optional().nullable(),
  winners: z.string().optional().nullable(),
  runnersUp: z.string().optional().nullable(),
  prizePool: z.string().optional().nullable(),
});
