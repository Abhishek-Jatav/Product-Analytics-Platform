"use client";

import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { ApiKeyCard } from "@/components/dashboard/ApiKeyCard";
import { TeamMemberRow } from "@/components/dashboard/TeamMemberRow";
import { InviteMemberForm } from "@/components/forms/InviteMemberForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useWorkspaceMembers, useWorkspaces } from "@/hooks/useWorkspaces";

export default function TeamPage() {
  const { currentWorkspaceId, currentProjectId } = useWorkspaceContext();
  const { user } = useAuth();
  const { data: workspaces } = useWorkspaces();
  const { data: members, isLoading } = useWorkspaceMembers(currentWorkspaceId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentWorkspace = workspaces?.find((w) => w.id === currentWorkspaceId);
  const currentUserRole = currentWorkspace?.role ?? "member";
  const canInvite = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2">Team</h1>
          <p className="text-small text-gray-500 mt-1">
            Who has access to {currentWorkspace?.name ?? "this workspace"}.
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setIsModalOpen(true)}>Add member</Button>
        )}
      </div>

      <div className="mb-6">
        <ApiKeyCard projectId={currentProjectId} />
      </div>

      <Card>
        {isLoading ? (
          <p className="text-small text-gray-500">Loading team…</p>
        ) : !members || members.length === 0 ? (
          <p className="text-small text-gray-500">No members found.</p>
        ) : (
          members.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              workspaceId={currentWorkspaceId as string}
              currentUserRole={currentUserRole}
              isSelf={member.user_id === user?.id}
            />
          ))
        )}
      </Card>

      <Modal
        title="Add a team member"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}>
        {currentWorkspaceId && (
          <InviteMemberForm
            workspaceId={currentWorkspaceId}
            onInvited={() => setIsModalOpen(false)}
          />
        )}
      </Modal>
    </DashboardShell>
  );
}
