import { useQuery } from "@tanstack/react-query";

import { retentionService } from "@/services/retention.service";

export function useRetentionSummary(projectId: string | null) {
  return useQuery({
    queryKey: ["retention-summary", projectId],
    queryFn: () => retentionService.getSummary(projectId as string),
    enabled: !!projectId,
  });
}

export function useRetentionMatrix(projectId: string | null, period: "day" | "week") {
  return useQuery({
    queryKey: ["retention-matrix", projectId, period],
    queryFn: () => retentionService.getMatrix(projectId as string, { period, num_periods: 8, max_cohorts: 8 }),
    enabled: !!projectId,
  });
}
