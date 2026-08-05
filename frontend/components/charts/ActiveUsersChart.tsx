"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/common/Card";
import type { TrendPoint } from "@/types/analytics.types";
import { formatShortDate } from "@/utils/date.utils";

export function ActiveUsersChart({ points, isLoading }: { points: TrendPoint[]; isLoading: boolean }) {
  if (isLoading) {
    return <Card className="h-72 text-small text-gray-500">Loading chart…</Card>;
  }

  const hasData = points.some((p) => p.active_users > 0);

  return (
    <Card>
      <p className="text-small font-medium mb-4">Active users over time</p>
      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-small text-gray-500">
          No activity in this range yet.
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-gray-400"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-gray-400" />
              <Tooltip labelFormatter={(v) => formatShortDate(String(v))} />
              <Line type="monotone" dataKey="active_users" stroke="#2563EB" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
