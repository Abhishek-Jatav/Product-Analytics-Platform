import { z } from "zod";

export const createFunnelSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  steps: z
    .array(z.string().trim().min(1, "Step name can't be empty"))
    .min(2, "A funnel needs at least 2 steps")
    .max(10, "A funnel can have at most 10 steps"),
});
export type CreateFunnelValues = z.infer<typeof createFunnelSchema>;
