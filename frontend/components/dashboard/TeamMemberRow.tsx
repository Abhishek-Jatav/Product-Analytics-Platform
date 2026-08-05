"use client";

import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { useRemoveMember, useUpdateMemberRole } from "@/hooks/useWorkspaces";
import type { WorkspaceMember } from "@/types/workspace.types";
import { getErrorMessage } from "@/utils/error.utils";

interface TeamMemberRowProps {
  member: WorkspaceMember;
  workspaceId: string;
  currentUserRole: "owner" | "admin" | "member";
  isSelf: boolean;
}

export function TeamMemberRow({ member, workspaceId, currentUserRole, isSelf }: TeamMemberRowProps) {
  const updateRole = useUpdateMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);

  const canChangeRole = currentUserRole === "owner";
  const canRemove = (currentUserRole === "owner" || currentUserRole === "admin") && member.role !== "owner";

  const handleRoleChange = async (role: "owner" | "admin" | "member") => {
    try {
      await updateRole.mutateAsync({ memberId: member.id, role });
      toast.success("Role updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update role"));
    }
  };

  const handleRemove = async () => {
    try {
      await removeMember.mutateAsync(member.id);
      toast.success("Member removed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not remove member"));
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-small font-medium">
          {member.name} {isSelf && <span className="text-caption text-gray-400">(you)</span>}
        </p>
        <p className="text-caption text-gray-500">{member.email}</p>
      </div>

      <div className="flex items-center gap-3">
        {canChangeRole ? (
          <select
            className="input-field w-28 py-1.5"
            value={member.role}
            onChange={(e) => handleRoleChange(e.target.value as "owner" | "admin" | "member")}
          >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        ) : (
          <span className="text-caption capitalize px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
            {member.role}
          </span>
        )}

        {canRemove && (
          <button
            aria-label="Remove member"
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
