"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { FunnelListItem } from "@/components/dashboard/FunnelListItem";
import { CreateFunnelForm } from "@/components/forms/CreateFunnelForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useFunnels } from "@/hooks/useFunnels";

export default function FunnelsPage() {
  const { currentProjectId } = useWorkspaceContext();
  const { data: funnels, isLoading } = useFunnels(currentProjectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2">Funnels</h1>
          <p className="text-small text-gray-500 mt-1">See where users drop off along a journey.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>New funnel</Button>
      </div>

      {isLoading ? (
        <Card className="text-small text-gray-500">Loading funnels…</Card>
      ) : !funnels || funnels.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-small text-gray-500">No funnels yet.</p>
          <p className="text-caption text-gray-400 mt-1">Create one to see step-by-step conversion.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {funnels.map((funnel) => (
            <FunnelListItem key={funnel.id} funnel={funnel} />
          ))}
        </div>
      )}

      <Modal title="Create a funnel" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {currentProjectId && (
          <CreateFunnelForm
            projectId={currentProjectId}
            onCreated={(funnel) => {
              setIsModalOpen(false);
              router.push(`/dashboard/funnels/${funnel.id}`);
            }}
          />
        )}
      </Modal>
    </DashboardShell>
  );
}
