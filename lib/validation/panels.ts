import { z } from "zod";
import { requiredString } from "./shared";

export const panelSchema = z.object({
  name: requiredString("Name"),
});
