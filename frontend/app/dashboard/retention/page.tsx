"use client";

import { useState } from "react";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { PeriodToggle } from "@/components/dashboard/PeriodToggle";
import { RetentionHeatmap } from "@/components/charts/RetentionHeatmap";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useRetentionMatrix, useRetentionSummary } from "@/hooks/useRetention";

export default function RetentionPage() {
  const { currentProjectId } = useWorkspaceContext();
  const [period, setPeriod] = useState<"day" | "week">("week");

  const { data: summary, isLoading: summaryLoading } = useRetentionSummary(currentProjectId);
  const { data: matrix, isLoading: matrixLoading } = useRetentionMatrix(currentProjectId, period);

  return (
    <DashboardShell>
      <h1 className="text-h2">Retention</h1>
      <p className="text-small text-gray-500 mt-1">How many users come back after their first visit.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <MetricCard
          label="Day 1 Retention"
          value={summaryLoading ? "—" : `${summary?.day1.rate ?? 0}%`}
          hint={summaryLoading ? undefined : `${summary?.day1.retained_users ?? 0} of ${summary?.day1.eligible_users ?? 0} users`}
        />
        <MetricCard
          label="Day 7 Retention"
          value={summaryLoading ? "—" : `${summary?.day7.rate ?? 0}%`}
          hint={summaryLoading ? undefined : `${summary?.day7.retained_users ?? 0} of ${summary?.day7.eligible_users ?? 0} users`}
        />
        <MetricCard
          label="Day 30 Retention"
          value={summaryLoading ? "—" : `${summary?.day30.rate ?? 0}%`}
          hint={summaryLoading ? undefined : `${summary?.day30.retained_users ?? 0} of ${summary?.day30.eligible_users ?? 0} users`}
        />
      </div>

      <div className="flex items-center justify-between mt-8 mb-4">
        <p className="text-small font-medium">Cohort retention</p>
        <PeriodToggle period={period} onChange={setPeriod} />
      </div>

      <RetentionHeatmap
        cohorts={matrix?.cohorts ?? []}
        numPeriods={matrix?.num_periods ?? 8}
        period={period}
        isLoading={matrixLoading}
      />
    </DashboardShell>
  );
}
