"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Card } from "@/components/common/Card";
import { useCheckAlert } from "@/hooks/useAlerts";
import type { AlertRule } from "@/types/alert.types";

const METRIC_LABELS: Record<string, string> = { dau: "Daily Active Users", revenue: "Revenue", conversion_rate: "Conversion Rate" };

export function AlertListItem({ rule, projectId }: { rule: AlertRule; projectId: string }) {
  const { mutate, data, isPending } = useCheckAlert(projectId);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-small font-medium">{rule.name}</p>
          <p className="text-caption text-gray-500 mt-1">
            Alerts when {METRIC_LABELS[rule.metric]} {rule.direction}s by {rule.threshold_percent}%+ day over day
          </p>
        </div>
        <button onClick={() => mutate(rule.id)} className="text-caption text-primary hover:underline shrink-0 ml-4">
          {isPending ? "Checking…" : "Check now"}
        </button>
      </div>

      {data && (
        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          {data.triggered ? (
            <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
          )}
          <p className="text-small">
            {data.message}
            <span className="text-caption text-gray-500 block mt-0.5">
              Yesterday: {data.previous_value} · Today: {data.current_value}
            </span>
          </p>
        </div>
      )}
    </Card>
  );
}
