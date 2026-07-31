import { z } from "zod";
import { emailSchema, requiredString } from "./shared";

export const playerSchema = z.object({
  name: requiredString("Name"),
  email: emailSchema,
  position: requiredString("Position"),
  bio: requiredString("Bio"),
});
