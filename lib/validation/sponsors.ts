import { z } from "zod";
import { requiredString } from "./shared";

export const SPONSOR_CATEGORIES = ["Corporate", "Media"] as const;

export const sponsorSchema = z.object({
  name: requiredString("Name"),
  category: z.enum(SPONSOR_CATEGORIES),
});
