import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { ApiKey, Project, ProjectWithKey } from "@/types/workspace.types";

export const projectService = {
  async list(workspaceId: string): Promise<Project[]> {
    const { data } = await apiClient.get<ApiResponse<Project[]>>(
      `/workspaces/${workspaceId}/projects`,
    );
    return data.data ?? [];
  },

  async create(workspaceId: string, name: string): Promise<ProjectWithKey> {
    const { data } = await apiClient.post<ApiResponse<ProjectWithKey>>(
      `/workspaces/${workspaceId}/projects`,
      {
        name,
      },
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async getApiKey(projectId: string): Promise<ApiKey> {
    const { data } = await apiClient.get<ApiResponse<ApiKey>>(
      `/projects/${projectId}/api-key`,
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
  },
};
