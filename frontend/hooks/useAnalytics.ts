import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "@/services/analytics.service";
import type { DashboardFilters } from "@/types/analytics.types";

export function useDashboardSummary(projectId: string | null, filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard-summary", projectId, filters],
    queryFn: () => analyticsService.getSummary(projectId as string, filters),
    enabled: !!projectId,
  });
}

export function useDashboardTrend(projectId: string | null, filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard-trend", projectId, filters],
    queryFn: () => analyticsService.getTrend(projectId as string, filters),
    enabled: !!projectId,
  });
}
