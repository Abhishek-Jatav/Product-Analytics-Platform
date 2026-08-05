import { ArrowDown } from "lucide-react";

import { Card } from "@/components/common/Card";
import type { FunnelStepResult } from "@/types/funnel.types";
import { formatDuration } from "@/utils/date.utils";

export function FunnelChart({ steps, isLoading }: { steps: FunnelStepResult[]; isLoading: boolean }) {
  if (isLoading) {
    return <Card className="text-small text-gray-500">Loading funnel…</Card>;
  }

  const maxUsers = Math.max(1, ...steps.map((s) => s.users_reached));

  return (
    <div className="flex flex-col">
      {steps.map((step, index) => (
        <div key={step.step_index}>
          <Card>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-small font-medium">
                  {index + 1}. {step.event_name}
                </p>
                <p className="text-caption text-gray-500">
                  {step.users_reached} users · {step.conversion_from_start}% of start
                </p>
              </div>
              {index > 0 && (
                <div className="text-right">
                  <p className="text-small font-medium">{step.conversion_from_previous}%</p>
                  <p className="text-caption text-gray-500">from previous step</p>
                </div>
              )}
            </div>
            <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(step.users_reached / maxUsers) * 100}%` }}
              />
            </div>
          </Card>

          {index < steps.length - 1 &&
            (() => {
              const next = steps[index + 1];
              if (!next) return null;
              return (
                <div className="flex items-center justify-center gap-2 py-2 text-caption text-gray-400">
                  <ArrowDown size={14} />
                  {next.drop_off > 0 && <span>{next.drop_off} dropped off</span>}
                  {next.avg_time_from_previous_seconds != null && (
                    <span>· avg {formatDuration(next.avg_time_from_previous_seconds)} to next</span>
                  )}
                </div>
              );
            })()}
        </div>
      ))}
    </div>
  );
}
