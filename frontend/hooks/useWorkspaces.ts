import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { workspaceService } from "@/services/workspace.service";

export function useWorkspaces() {
  return useQuery({ queryKey: ["workspaces"], queryFn: workspaceService.list });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => workspaceService.create(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}

export function useWorkspaceMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => workspaceService.listMembers(workspaceId as string),
    enabled: !!workspaceId,
  });
}

export function useInviteMember(workspaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: "admin" | "member" }) =>
      workspaceService.inviteMember(workspaceId as string, email, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] }),
  });
}

export function useUpdateMemberRole(workspaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: "owner" | "admin" | "member" }) =>
      workspaceService.updateMemberRole(workspaceId as string, memberId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] }),
  });
}

export function useRemoveMember(workspaceId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => workspaceService.removeMember(workspaceId as string, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] }),
  });
}
