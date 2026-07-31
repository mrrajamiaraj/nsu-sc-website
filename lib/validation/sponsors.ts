import { z } from "zod";
import { requiredString } from "./shared";

export const sponsorSchema = z.object({
  name: requiredString("Name"),
});
