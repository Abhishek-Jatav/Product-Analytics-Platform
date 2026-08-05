import { z } from "zod";

export const createExperimentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  conversion_event: z.string().min(1, "Conversion event is required").max(120),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Variant name can't be empty"),
        traffic_allocation: z.coerce.number().int().min(1).max(100),
      })
    )
    .min(2, "An experiment needs at least 2 variants")
    .max(6, "An experiment can have at most 6 variants")
    .refine((variants) => variants.reduce((sum, v) => sum + v.traffic_allocation, 0) === 100, {
      message: "Traffic allocations must add up to 100%",
    }),
});
export type CreateExperimentValues = z.infer<typeof createExperimentSchema>;
