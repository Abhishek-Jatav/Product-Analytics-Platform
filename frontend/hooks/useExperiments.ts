import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { experimentService } from "@/services/experiment.service";
import type { CreateExperimentPayload } from "@/types/experiment.types";

export function useExperiments(projectId: string | null) {
  return useQuery({
    queryKey: ["experiments", projectId],
    queryFn: () => experimentService.list(projectId as string),
    enabled: !!projectId,
  });
}

export function useCreateExperiment(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExperimentPayload) => experimentService.create(projectId as string, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experiments", projectId] }),
  });
}

export function useExperimentResults(projectId: string | null, experimentId: string | null) {
  return useQuery({
    queryKey: ["experiment-results", projectId, experimentId],
    queryFn: () => experimentService.getResults(projectId as string, experimentId as string),
    enabled: !!projectId && !!experimentId,
  });
}
