import type { CSSProperties } from "react";

import { Card } from "@/components/common/Card";
import type { RetentionCohortRow } from "@/types/retention.types";
import { formatShortDate } from "@/utils/date.utils";

function cellStyle(pct: number | null): CSSProperties {
  if (pct === null) return { backgroundColor: "transparent" };
  const alpha = Math.max(pct / 100, 0.06);
  return { backgroundColor: `rgba(37, 99, 235, ${alpha})`, color: alpha > 0.5 ? "white" : undefined };
}

export function RetentionHeatmap({
  cohorts,
  numPeriods,
  period,
  isLoading,
}: {
  cohorts: RetentionCohortRow[];
  numPeriods: number;
  period: "day" | "week";
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Card className="text-small text-gray-500">Loading retention data…</Card>;
  }

  if (cohorts.length === 0) {
    return (
      <Card className="text-center py-10">
        <p className="text-small text-gray-500">No cohorts yet.</p>
        <p className="text-caption text-gray-400 mt-1">Retention appears once users start returning.</p>
      </Card>
    );
  }

  const unitLabel = period === "day" ? "Day" : "Week";

  return (
    <Card className="p-0 overflow-x-auto">
      <table className="text-small border-collapse">
        <thead>
          <tr>
            <th className="text-left px-4 py-3 text-caption text-gray-500 uppercase tracking-wide sticky left-0 bg-white dark:bg-gray-900">
              Cohort
            </th>
            <th className="text-right px-3 py-3 text-caption text-gray-500 uppercase tracking-wide">Users</th>
            {Array.from({ length: numPeriods }, (_, i) => (
              <th key={i} className="text-center px-2 py-3 text-caption text-gray-500 uppercase tracking-wide">
                {unitLabel} {i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((row) => (
            <tr key={row.cohort_start} className="border-t border-gray-100 dark:border-gray-800">
              <td className="px-4 py-2 font-medium sticky left-0 bg-white dark:bg-gray-900 whitespace-nowrap">
                {formatShortDate(row.cohort_start)}
              </td>
              <td className="px-3 py-2 text-right text-gray-500">{row.cohort_size}</td>
              {row.percentages.map((pct, i) => (
                <td key={i} className="p-1">
                  <div
                    className="rounded-md text-center py-2 px-1 text-caption font-medium"
                    style={cellStyle(pct)}
                  >
                    {pct === null ? "" : `${pct}%`}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
