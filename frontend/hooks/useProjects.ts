import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectService } from "@/services/project.service";

export function useProjects(workspaceId: string | null) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: () => projectService.list(workspaceId as string),
    enabled: !!workspaceId,
  });
}

export function useCreateProject(workspaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => projectService.create(workspaceId as string, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] }),
  });
}
