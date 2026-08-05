import { z } from "zod";

export const workspaceNameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
});
export type WorkspaceNameValues = z.infer<typeof workspaceNameSchema>;

export const projectNameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
});
export type ProjectNameValues = z.infer<typeof projectNameSchema>;
