import { z } from "zod";
import { optionalCalendarDateSchema, optionalUrlSchema, requiredString } from "./shared";

const optionalCount = z.coerce.number().int().nonnegative().optional().nullable();

export const eventSchema = z
  .object({
    name: requiredString("Name"),
    seriesId: z.string().uuid().optional().nullable(),
    seasonNumber: z.coerce.number().int().positive("Season must be 1 or more").optional().nullable(),
    // Optional for past events whose date isn't recorded; yearOnly shows just its year.
    date: optionalCalendarDateSchema,
    yearOnly: z.boolean(),
    endDate: optionalCalendarDateSchema,
    venue: z.string().trim().optional().nullable(),
    description: requiredString("Description"),
    status: z.enum(["Upcoming", "Running", "Finished"]),
    registrationOpens: optionalCalendarDateSchema,
    registrationDeadline: optionalCalendarDateSchema,
    registrationUrl: optionalUrlSchema,
    teamCount: optionalCount,
    participantCount: optionalCount,
    matchCount: optionalCount,
    winners: z.string().optional().nullable(),
    runnersUp: z.string().optional().nullable(),
    secondRunnerUp: z.string().optional().nullable(),
    manOfTournament: z.string().optional().nullable(),
    prizePool: z.string().optional().nullable(),
    prizeFirst: z.string().optional().nullable(),
    prizeSecond: z.string().optional().nullable(),
    prizeThird: z.string().optional().nullable(),
  })
  .refine(
    (data) => !data.registrationOpens || !data.registrationDeadline || data.registrationOpens <= data.registrationDeadline,
    { message: "Registration deadline must be on or after the opening date." },
  );

export const eventSeriesSchema = z.object({
  name: requiredString("Name"),
  abbreviation: requiredString("Abbreviation").max(8, "Keep the abbreviation to 8 characters or fewer"),
  sport: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
});
