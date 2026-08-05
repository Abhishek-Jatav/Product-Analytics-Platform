"use client";

import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { SegmentListItem } from "@/components/dashboard/SegmentListItem";
import { CreateSegmentForm } from "@/components/forms/CreateSegmentForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useSegments } from "@/hooks/useSegments";

export default function SegmentsPage() {
  const { currentProjectId } = useWorkspaceContext();
  const { data: segments, isLoading } = useSegments(currentProjectId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2">Segments</h1>
          <p className="text-small text-gray-500 mt-1">Group users by properties or behavior.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>New segment</Button>
      </div>

      {isLoading ? (
        <Card className="text-small text-gray-500">Loading segments…</Card>
      ) : !segments || segments.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-small text-gray-500">No segments yet.</p>
          <p className="text-caption text-gray-400 mt-1">Create one to group users by properties or behavior.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {segments.map((segment) => (
            <SegmentListItem key={segment.id} segment={segment} projectId={currentProjectId as string} />
          ))}
        </div>
      )}

      <Modal title="Create a segment" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {currentProjectId && (
          <CreateSegmentForm projectId={currentProjectId} onCreated={() => setIsModalOpen(false)} />
        )}
      </Modal>
    </DashboardShell>
  );
}
