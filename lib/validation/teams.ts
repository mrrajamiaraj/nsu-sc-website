import { z } from "zod";
import { requiredString } from "./shared";

export const teamSchema = z.object({
  name: requiredString("Name"),
  description: requiredString("Description"),
  nickname: z.string().optional().nullable(),
  achievement: z.string().optional().nullable(),
});
