import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { RetentionMatrix, RetentionSummary } from "@/types/retention.types";

export const retentionService = {
  async getSummary(projectId: string): Promise<RetentionSummary> {
    const { data } = await apiClient.get<ApiResponse<RetentionSummary>>(`/projects/${projectId}/retention/summary`);
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async getMatrix(
    projectId: string,
    params: { period: "day" | "week"; num_periods: number; max_cohorts: number }
  ): Promise<RetentionMatrix> {
    const { data } = await apiClient.get<ApiResponse<RetentionMatrix>>(`/projects/${projectId}/retention/matrix`, {
      params,
    });
    if (!data.data) throw new Error(data.message);
    return data.data;
  },
};
