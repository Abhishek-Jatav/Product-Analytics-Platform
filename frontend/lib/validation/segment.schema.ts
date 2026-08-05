import { z } from "zod";

const propertyCondition = z.object({
  type: z.literal("property"),
  key: z.string().trim().min(1, "Property key is required"),
  operator: z.enum(["equals", "not_equals", "contains"]),
  value: z.string().trim().min(1, "Value is required"),
});

const eventCondition = z.object({
  type: z.literal("event"),
  event_name: z.string().trim().min(1, "Event name is required"),
  operator: z.enum(["at_least", "exactly", "never"]),
  count: z.coerce.number().int().min(0).default(1),
});

export const createSegmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  conditions: z.array(z.discriminatedUnion("type", [propertyCondition, eventCondition])).min(1, "Add at least one condition"),
});
export type CreateSegmentValues = z.infer<typeof createSegmentSchema>;
