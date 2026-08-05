"use client";

import { Card } from "@/components/common/Card";
import { usePreviewSegment } from "@/hooks/useSegments";
import type { Segment } from "@/types/segment.types";

function describeCondition(c: Segment["conditions"][number]): string {
  if (c.type === "property") return `${c.key} ${c.operator.replace("_", " ")} "${c.value}"`;
  return `${c.event_name} ${c.operator.replace("_", " ")}${c.operator === "never" ? "" : ` ${c.count}`}`;
}

export function SegmentListItem({ segment, projectId }: { segment: Segment; projectId: string }) {
  const { mutate, data, isPending } = usePreviewSegment(projectId);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-small font-medium">{segment.name}</p>
          <p className="text-caption text-gray-500 mt-1">{segment.conditions.map(describeCondition).join(" AND ")}</p>
        </div>
        <button onClick={() => mutate(segment.id)} className="text-caption text-primary hover:underline shrink-0 ml-4">
          {isPending ? "Calculating…" : "Preview"}
        </button>
      </div>
      {data && (
        <p className="text-small mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="font-medium">{data.matching_user_count}</span> matching users
          {data.sample_distinct_ids.length > 0 && (
            <span className="text-gray-500"> · e.g. {data.sample_distinct_ids.slice(0, 5).join(", ")}</span>
          )}
        </p>
      )}
    </Card>
  );
}
