import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { EventFilters, EventListResult } from "@/types/event.types";

export const eventService = {
  async list(projectId: string, filters: EventFilters): Promise<EventListResult> {
    const { data } = await apiClient.get<ApiResponse<EventListResult>>(`/projects/${projectId}/events`, {
      params: filters,
    });
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async listNames(projectId: string): Promise<string[]> {
    const { data } = await apiClient.get<ApiResponse<string[]>>(`/projects/${projectId}/events/names`);
    return data.data ?? [];
  },
};
