import { z } from "zod";
import { optionalCalendarDateSchema } from "./shared";

export const registrationSchema = z
  .object({
    isOpen: z.boolean(),
    googleFormUrl: z.string().trim().optional().nullable(),
    nextIntakeDate: optionalCalendarDateSchema,
  })
  .refine((data) => !data.isOpen || !!data.googleFormUrl, {
    message: "A Google Form URL is required to open registration.",
    path: ["googleFormUrl"],
  });
