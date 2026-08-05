"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { ExperimentListItem } from "@/components/dashboard/ExperimentListItem";
import { CreateExperimentForm } from "@/components/forms/CreateExperimentForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useExperiments } from "@/hooks/useExperiments";

export default function ExperimentsPage() {
  const { currentProjectId } = useWorkspaceContext();
  const { data: experiments, isLoading } = useExperiments(currentProjectId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2">Experiments</h1>
          <p className="text-small text-gray-500 mt-1">A/B test variants and see which one wins.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>New experiment</Button>
      </div>

      {isLoading ? (
        <Card className="text-small text-gray-500">Loading experiments…</Card>
      ) : !experiments || experiments.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-small text-gray-500">No experiments yet.</p>
          <p className="text-caption text-gray-400 mt-1">Create one to start comparing variants.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {experiments.map((experiment) => (
            <ExperimentListItem key={experiment.id} experiment={experiment} />
          ))}
        </div>
      )}

      <Modal title="Create an experiment" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {currentProjectId && (
          <CreateExperimentForm
            projectId={currentProjectId}
            onCreated={(experiment) => {
              setIsModalOpen(false);
              router.push(`/dashboard/experiments/${experiment.id}`);
            }}
          />
        )}
      </Modal>
    </DashboardShell>
  );
}
