import { z } from "zod";
import { calendarDateSchema, requiredString } from "./shared";

export const achievementSchema = z.object({
  teamId: requiredString("Team"),
  title: requiredString("Title"),
  description: requiredString("Description"),
  date: calendarDateSchema,
});
