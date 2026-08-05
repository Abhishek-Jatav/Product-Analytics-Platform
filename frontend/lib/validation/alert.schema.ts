import { z } from "zod";

export const createAlertSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  metric: z.enum(["dau", "revenue", "conversion_rate"]),
  direction: z.enum(["drop", "spike"]),
  threshold_percent: z.coerce.number().gt(0, "Must be greater than 0").max(1000),
});
export type CreateAlertValues = z.infer<typeof createAlertSchema>;
