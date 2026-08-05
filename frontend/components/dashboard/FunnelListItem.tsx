import Link from "next/link";

import { Card } from "@/components/common/Card";
import type { Funnel } from "@/types/funnel.types";

export function FunnelListItem({ funnel }: { funnel: Funnel }) {
  return (
    <Link href={`/dashboard/funnels/${funnel.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <p className="text-small font-medium">{funnel.name}</p>
        <p className="text-caption text-gray-500 mt-1">{funnel.steps.join(" → ")}</p>
      </Card>
    </Link>
  );
}
