import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { CreateExperimentPayload, Experiment, ExperimentResults } from "@/types/experiment.types";

export const experimentService = {
  async list(projectId: string): Promise<Experiment[]> {
    const { data } = await apiClient.get<ApiResponse<Experiment[]>>(`/projects/${projectId}/experiments`);
    return data.data ?? [];
  },

  async create(projectId: string, payload: CreateExperimentPayload): Promise<Experiment> {
    const { data } = await apiClient.post<ApiResponse<Experiment>>(`/projects/${projectId}/experiments`, payload);
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async getResults(projectId: string, experimentId: string): Promise<ExperimentResults> {
    const { data } = await apiClient.get<ApiResponse<ExperimentResults>>(
      `/projects/${projectId}/experiments/${experimentId}/results`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
  },
};
