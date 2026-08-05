interface PeriodToggleProps {
  period: "day" | "week";
  onChange: (period: "day" | "week") => void;
}

const LABELS: Record<"day" | "week", string> = { day: "Daily", week: "Weekly" };

export function PeriodToggle({ period, onChange }: PeriodToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 p-1">
      {(["day", "week"] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 rounded-md text-small font-medium transition-colors ${
            period === p
              ? "bg-primary text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {LABELS[p]}
        </button>
      ))}
    </div>
  );
}
