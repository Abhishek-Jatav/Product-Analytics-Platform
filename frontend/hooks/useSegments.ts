import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { segmentService } from "@/services/segment.service";
import type { CreateSegmentPayload } from "@/types/segment.types";

export function useSegments(projectId: string | null) {
  return useQuery({
    queryKey: ["segments", projectId],
    queryFn: () => segmentService.list(projectId as string),
    enabled: !!projectId,
  });
}

export function useCreateSegment(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSegmentPayload) => segmentService.create(projectId as string, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["segments", projectId] }),
  });
}

export function usePreviewSegment(projectId: string | null) {
  return useMutation({
    mutationFn: (segmentId: string) => segmentService.preview(projectId as string, segmentId),
  });
}
