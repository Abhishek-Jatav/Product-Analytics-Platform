import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { funnelService } from "@/services/funnel.service";
import type { CreateFunnelPayload } from "@/types/funnel.types";

export function useFunnels(projectId: string | null) {
  return useQuery({
    queryKey: ["funnels", projectId],
    queryFn: () => funnelService.list(projectId as string),
    enabled: !!projectId,
  });
}

export function useCreateFunnel(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFunnelPayload) => funnelService.create(projectId as string, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["funnels", projectId] }),
  });
}

export function useFunnelAnalysis(
  projectId: string | null,
  funnelId: string | null,
  filters: { start_date?: string; end_date?: string }
) {
  return useQuery({
    queryKey: ["funnel-analysis", projectId, funnelId, filters],
    queryFn: () => funnelService.analyze(projectId as string, funnelId as string, filters),
    enabled: !!projectId && !!funnelId,
  });
}
