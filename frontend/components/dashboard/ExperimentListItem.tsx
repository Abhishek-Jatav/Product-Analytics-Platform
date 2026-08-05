import Link from "next/link";

import { Card } from "@/components/common/Card";
import type { Experiment } from "@/types/experiment.types";

export function ExperimentListItem({ experiment }: { experiment: Experiment }) {
  return (
    <Link href={`/dashboard/experiments/${experiment.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <p className="text-small font-medium">{experiment.name}</p>
          <span className="text-caption capitalize px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
            {experiment.status}
          </span>
        </div>
        <p className="text-caption text-gray-500 mt-1">
          {experiment.variants.map((v) => v.name).join(" vs ")} · converts on &quot;{experiment.conversion_event}&quot;
        </p>
      </Card>
    </Link>
  );
}
