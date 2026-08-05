import { Card } from "@/components/common/Card";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
}

/** One job: display a single KPI. Composed to build the dashboard overview grid. */
export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <Card>
      <p className="text-small text-gray-500">{label}</p>
      <p className="text-h2 mt-1">{value}</p>
      {hint && <p className="text-caption text-gray-400 mt-1">{hint}</p>}
    </Card>
  );
}
