import { useQuery } from "@tanstack/react-query";

import { projectService } from "@/services/project.service";

export function useApiKey(projectId: string | null) {
  return useQuery({
    queryKey: ["api-key", projectId],
    queryFn: () => projectService.getApiKey(projectId as string),
    enabled: !!projectId,
  });
}
