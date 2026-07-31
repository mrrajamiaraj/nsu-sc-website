import { z } from "zod";
import { calendarDateSchema, requiredString } from "./shared";

export const blogPostSchema = z.object({
  title: requiredString("Title"),
  excerpt: requiredString("Excerpt"),
  content: z.string().optional().default(""),
  category: requiredString("Category"),
  author: requiredString("Author"),
  date: calendarDateSchema,
  readTimeMinutes: z.coerce.number().int().positive(),
});
