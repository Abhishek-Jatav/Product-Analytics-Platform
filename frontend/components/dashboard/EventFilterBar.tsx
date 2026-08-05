interface EventFilterBarProps {
  eventNames: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function EventFilterBar({ eventNames, selected, onChange }: EventFilterBarProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="input-field w-auto"
      aria-label="Filter by event name"
    >
      <option value="">All events</option>
      {eventNames.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
