import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { DashboardFilters, DashboardSummary, DashboardTrend } from "@/types/analytics.types";

export const analyticsService = {
  async getSummary(projectId: string, filters: DashboardFilters): Promise<DashboardSummary> {
    const { data } = await apiClient.get<ApiResponse<DashboardSummary>>(`/projects/${projectId}/analytics/summary`, {
      params: filters,
    });
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async getTrend(projectId: string, filters: DashboardFilters): Promise<DashboardTrend> {
    const { data } = await apiClient.get<ApiResponse<DashboardTrend>>(`/projects/${projectId}/analytics/trend`, {
      params: filters,
    });
    if (!data.data) throw new Error(data.message);
    return data.data;
  },
};
