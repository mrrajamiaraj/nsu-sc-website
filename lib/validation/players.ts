import { z } from "zod";
import { emailSchema, optionalPhoneSchema, optionalUrlSchema, requiredString } from "./shared";

export const playerSchema = z.object({
  name: requiredString("Name"),
  email: emailSchema,
  phone: optionalPhoneSchema,
  facebook: optionalUrlSchema,
  position: requiredString("Position"),
  bio: requiredString("Bio"),
});
