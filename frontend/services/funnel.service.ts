import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { CreateFunnelPayload, Funnel, FunnelAnalysis } from "@/types/funnel.types";

export const funnelService = {
  async list(projectId: string): Promise<Funnel[]> {
    const { data } = await apiClient.get<ApiResponse<Funnel[]>>(`/projects/${projectId}/funnels`);
    return data.data ?? [];
  },

  async create(projectId: string, payload: CreateFunnelPayload): Promise<Funnel> {
    const { data } = await apiClient.post<ApiResponse<Funnel>>(`/projects/${projectId}/funnels`, payload);
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async analyze(
    projectId: string,
    funnelId: string,
    filters: { start_date?: string; end_date?: string }
  ): Promise<FunnelAnalysis> {
    const { data } = await apiClient.get<ApiResponse<FunnelAnalysis>>(
      `/projects/${projectId}/funnels/${funnelId}/analysis`,
      { params: filters }
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
  },
};
