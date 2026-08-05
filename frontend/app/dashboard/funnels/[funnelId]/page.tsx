"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Card } from "@/components/common/Card";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useFunnelAnalysis } from "@/hooks/useFunnels";
import { daysAgo, toDateParam } from "@/utils/date.utils";

export default function FunnelDetailPage() {
  const { currentProjectId } = useWorkspaceContext();
  const params = useParams<{ funnelId: string }>();
  const router = useRouter();
  const [rangeDays, setRangeDays] = useState(30);

  const filters = useMemo(
    () => ({ start_date: toDateParam(daysAgo(rangeDays - 1)), end_date: toDateParam(new Date()) }),
    [rangeDays]
  );

  const { data: analysis, isLoading } = useFunnelAnalysis(currentProjectId, params.funnelId, filters);

  return (
    <DashboardShell>
      <button
        onClick={() => router.push("/dashboard/funnels")}
        className="flex items-center gap-1 text-small text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4"
      >
        <ArrowLeft size={14} /> Back to funnels
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2">{analysis?.funnel.name ?? "Funnel"}</h1>
          <p className="text-small text-gray-500 mt-1">Step-by-step conversion and drop-off.</p>
        </div>
        <DateRangeFilter rangeDays={rangeDays} onChange={setRangeDays} />
      </div>

      {!isLoading && analysis && analysis.steps[0]?.users_reached === 0 ? (
        <Card className="text-center py-10 mb-4">
          <p className="text-small text-gray-500">No one has entered this funnel yet in this range.</p>
          <p className="text-caption text-gray-400 mt-1">
            Track a &quot;{analysis.funnel.steps[0]}&quot; event to start seeing data.
          </p>
        </Card>
      ) : (
        <FunnelChart steps={analysis?.steps ?? []} isLoading={isLoading} />
      )}
    </DashboardShell>
  );
}
