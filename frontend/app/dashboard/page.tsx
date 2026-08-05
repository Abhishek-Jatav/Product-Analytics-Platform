"use client";

import { useMemo, useState } from "react";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { ActiveUsersChart } from "@/components/charts/ActiveUsersChart";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { useDashboardSummary, useDashboardTrend } from "@/hooks/useAnalytics";
import { daysAgo, toDateParam } from "@/utils/date.utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentProjectId } = useWorkspaceContext();
  const [rangeDays, setRangeDays] = useState(30);

  const filters = useMemo(
    () => ({ start_date: toDateParam(daysAgo(rangeDays - 1)), end_date: toDateParam(new Date()) }),
    [rangeDays]
  );

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(currentProjectId, filters);
  const { data: trend, isLoading: trendLoading } = useDashboardTrend(currentProjectId, filters);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2">Welcome{user ? `, ${user.name}` : ""} 👋</h1>
          <p className="text-small text-gray-500 mt-1">Here&apos;s how your product is doing.</p>
        </div>
        <DateRangeFilter rangeDays={rangeDays} onChange={setRangeDays} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Daily Active Users" value={summaryLoading ? "—" : String(summary?.dau ?? 0)} />
        <MetricCard label="Weekly Active Users" value={summaryLoading ? "—" : String(summary?.wau ?? 0)} />
        <MetricCard label="Monthly Active Users" value={summaryLoading ? "—" : String(summary?.mau ?? 0)} />
        <MetricCard
          label="Conversion Rate"
          value={summaryLoading ? "—" : `${summary?.conversion_rate ?? 0}%`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <MetricCard label="Active Users" value={summaryLoading ? "—" : String(summary?.active_users ?? 0)} hint="Selected range" />
        <MetricCard label="New Users" value={summaryLoading ? "—" : String(summary?.new_users ?? 0)} hint="Selected range" />
        <MetricCard label="Returning Users" value={summaryLoading ? "—" : String(summary?.returning_users ?? 0)} hint="Selected range" />
        <MetricCard label="Revenue" value={summaryLoading ? "—" : `$${(summary?.revenue ?? 0).toFixed(2)}`} hint="Selected range" />
      </div>

      <div className="mt-6">
        <ActiveUsersChart points={trend?.points ?? []} isLoading={trendLoading} />
      </div>
    </DashboardShell>
  );
}
