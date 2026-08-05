"use client";

import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { AlertListItem } from "@/components/dashboard/AlertListItem";
import { CreateAlertForm } from "@/components/forms/CreateAlertForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useAlerts } from "@/hooks/useAlerts";

export default function AlertsPage() {
  const { currentProjectId } = useWorkspaceContext();
  const { data: rules, isLoading } = useAlerts(currentProjectId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2">Alerts</h1>
          <p className="text-small text-gray-500 mt-1">Get flagged when a metric moves sharply, day over day.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>New alert</Button>
      </div>

      {isLoading ? (
        <Card className="text-small text-gray-500">Loading alerts…</Card>
      ) : !rules || rules.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-small text-gray-500">No alert rules yet.</p>
          <p className="text-caption text-gray-400 mt-1">Create one to watch for drops or spikes.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((rule) => (
            <AlertListItem key={rule.id} rule={rule} projectId={currentProjectId as string} />
          ))}
        </div>
      )}

      <Modal title="Create an alert" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {currentProjectId && <CreateAlertForm projectId={currentProjectId} onCreated={() => setIsModalOpen(false)} />}
      </Modal>
    </DashboardShell>
  );
}
