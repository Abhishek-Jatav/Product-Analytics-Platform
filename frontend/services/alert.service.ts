import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { AlertCheckResult, AlertRule, CreateAlertPayload } from "@/types/alert.types";

export const alertService = {
  async list(projectId: string): Promise<AlertRule[]> {
    const { data } = await apiClient.get<ApiResponse<AlertRule[]>>(`/projects/${projectId}/alerts`);
    return data.data ?? [];
  },

  async create(projectId: string, payload: CreateAlertPayload): Promise<AlertRule> {
    const { data } = await apiClient.post<ApiResponse<AlertRule>>(`/projects/${projectId}/alerts`, payload);
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async check(projectId: string, ruleId: string): Promise<AlertCheckResult> {
    const { data } = await apiClient.get<ApiResponse<AlertCheckResult>>(
      `/projects/${projectId}/alerts/${ruleId}/check`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
  },
};
