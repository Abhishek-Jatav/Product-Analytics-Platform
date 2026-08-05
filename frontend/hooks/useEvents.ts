import { useQuery } from "@tanstack/react-query";

import { eventService } from "@/services/event.service";
import type { EventFilters } from "@/types/event.types";

export function useEvents(projectId: string | null, filters: EventFilters) {
  return useQuery({
    queryKey: ["events", projectId, filters],
    queryFn: () => eventService.list(projectId as string, filters),
    enabled: !!projectId,
  });
}

export function useEventNames(projectId: string | null) {
  return useQuery({
    queryKey: ["event-names", projectId],
    queryFn: () => eventService.listNames(projectId as string),
    enabled: !!projectId,
  });
}
