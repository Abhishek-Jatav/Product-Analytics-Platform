import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { alertService } from "@/services/alert.service";
import type { CreateAlertPayload } from "@/types/alert.types";

export function useAlerts(projectId: string | null) {
  return useQuery({
    queryKey: ["alerts", projectId],
    queryFn: () => alertService.list(projectId as string),
    enabled: !!projectId,
  });
}

export function useCreateAlert(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAlertPayload) => alertService.create(projectId as string, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts", projectId] }),
  });
}

export function useCheckAlert(projectId: string | null) {
  return useMutation({
    mutationFn: (ruleId: string) => alertService.check(projectId as string, ruleId),
  });
}
