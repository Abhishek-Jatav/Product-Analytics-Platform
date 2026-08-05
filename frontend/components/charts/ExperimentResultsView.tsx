import { Trophy } from "lucide-react";

import { Card } from "@/components/common/Card";
import type { ExperimentResults } from "@/types/experiment.types";

function SignificanceBadge({ variant, results }: { variant: ExperimentResults["variants"][number]; results: ExperimentResults }) {
  if (variant.is_control) {
    return <span className="text-caption text-gray-400">Baseline</span>;
  }
  if (variant.p_value === null) {
    return <span className="text-caption text-gray-400">Not enough data</span>;
  }
  if (variant.is_significant) {
    return <span className="text-caption font-medium text-success">Significant (p={variant.p_value})</span>;
  }
  return <span className="text-caption text-gray-400">Not significant yet (p={variant.p_value})</span>;
}

export function ExperimentResultsView({ results, isLoading }: { results: ExperimentResults | undefined; isLoading: boolean }) {
  if (isLoading || !results) {
    return <Card className="text-small text-gray-500">Loading results…</Card>;
  }

  const maxRate = Math.max(1, ...results.variants.map((v) => v.conversion_rate));

  return (
    <div className="flex flex-col gap-4">
      {results.winner_variant_id && (
        <Card className="bg-success/10 border border-success/20 flex items-center gap-3">
          <Trophy size={18} className="text-success shrink-0" />
          <p className="text-small">
            <span className="font-medium">
              {results.variants.find((v) => v.variant_id === results.winner_variant_id)?.name}
            </span>{" "}
            is the winning variant, with statistically significant results.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.variants.map((variant) => (
          <Card key={variant.variant_id}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-small font-medium">{variant.name}</p>
              <SignificanceBadge variant={variant} results={results} />
            </div>

            <p className="text-h2">{variant.conversion_rate}%</p>
            <p className="text-caption text-gray-500 mt-1">
              {variant.conversions} of {variant.exposures} converted
              {variant.uplift_vs_control !== null && (
                <> · {variant.uplift_vs_control >= 0 ? "+" : ""}{variant.uplift_vs_control}pp vs control</>
              )}
            </p>

            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-3">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(variant.conversion_rate / maxRate) * 100}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
