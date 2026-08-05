"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ExperimentResultsView } from "@/components/charts/ExperimentResultsView";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useExperimentResults } from "@/hooks/useExperiments";

export default function ExperimentDetailPage() {
  const { currentProjectId } = useWorkspaceContext();
  const params = useParams<{ experimentId: string }>();
  const router = useRouter();

  const { data: results, isLoading } = useExperimentResults(currentProjectId, params.experimentId);

  return (
    <DashboardShell>
      <button
        onClick={() => router.push("/dashboard/experiments")}
        className="flex items-center gap-1 text-small text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4"
      >
        <ArrowLeft size={14} /> Back to experiments
      </button>

      <div className="mb-6">
        <h1 className="text-h2">{results?.experiment.name ?? "Experiment"}</h1>
        <p className="text-small text-gray-500 mt-1">
          {results ? `Converts on "${results.experiment.conversion_event}"` : "Loading…"}
        </p>
      </div>

      <ExperimentResultsView results={results} isLoading={isLoading} />
    </DashboardShell>
  );
}
