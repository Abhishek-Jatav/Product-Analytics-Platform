import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { Workspace, WorkspaceMember } from "@/types/workspace.types";

export const workspaceService = {
  async list(): Promise<Workspace[]> {
    const { data } = await apiClient.get<ApiResponse<Workspace[]>>("/workspaces");
    return data.data ?? [];
  },

  async create(name: string): Promise<Workspace> {
    const { data } = await apiClient.post<ApiResponse<Workspace>>("/workspaces", { name });
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data } = await apiClient.get<ApiResponse<WorkspaceMember[]>>(`/workspaces/${workspaceId}/members`);
    return data.data ?? [];
  },

  async inviteMember(workspaceId: string, email: string, role: "admin" | "member"): Promise<WorkspaceMember> {
    const { data } = await apiClient.post<ApiResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members`, {
      email,
      role,
    });
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async updateMemberRole(workspaceId: string, memberId: string, role: "owner" | "admin" | "member"): Promise<WorkspaceMember> {
    const { data } = await apiClient.patch<ApiResponse<WorkspaceMember>>(
      `/workspaces/${workspaceId}/members/${memberId}`,
      { role }
    );
    if (!data.data) throw new Error(data.message);
    return data.data;
  },

  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },
};
