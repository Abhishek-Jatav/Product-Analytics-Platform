interface DateRangeFilterProps {
  rangeDays: number;
  onChange: (days: number) => void;
}

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export function DateRangeFilter({ rangeDays, onChange }: DateRangeFilterProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 p-1">
      {PRESETS.map((preset) => (
        <button
          key={preset.days}
          onClick={() => onChange(preset.days)}
          className={`px-3 py-1.5 rounded-md text-small font-medium transition-colors ${
            rangeDays === preset.days
              ? "bg-primary text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
