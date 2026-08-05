import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { CreateSegmentPayload, Segment, SegmentPreview } from "@/types/segment.types";

export const segmentService = {
  async list(projectId: string): Promise<Segment[]> {
    const { data } = await apiClient.get<ApiResponse<Segment[]>>(`/projects/${projectId}/segments`);
    return data.data ?? [];
  },

  async create(projectId: string, payload: CreateSegmentPayload): Promise<Segment> {
    const { data } = await apiClient.post<ApiResponse<Segment>>(`/projects/${projectId}/segments`, payload);
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async preview(projectId: string, segmentId: string): Promise<SegmentPreview> {
    const { data } = await apiClient.get<ApiResponse<SegmentPreview>>(
      `/projects/${projectId}/segments/${segmentId}/preview`
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
  },
};
