import { Card } from "@/components/common/Card";
import type { AnalyticsEvent } from "@/types/event.types";

interface EventTableProps {
  events: AnalyticsEvent[];
  isLoading: boolean;
}

export function EventTable({ events, isLoading }: EventTableProps) {
  if (isLoading) {
    return <Card className="text-small text-gray-500">Loading events…</Card>;
  }

  if (events.length === 0) {
    return (
      <Card className="text-center py-10">
        <p className="text-small text-gray-500">No events yet.</p>
        <p className="text-caption text-gray-400 mt-1">
          Events will appear here as soon as your app sends its first one.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-small">
        <thead className="bg-gray-50 dark:bg-gray-800 text-left text-caption text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3">Event</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Properties</th>
            <th className="px-4 py-3">Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-t border-gray-100 dark:border-gray-800">
              <td className="px-4 py-3 font-medium">{event.name}</td>
              <td className="px-4 py-3 text-gray-500">{event.distinct_id}</td>
              <td className="px-4 py-3 text-gray-500 font-mono text-caption">
                {Object.keys(event.properties).length > 0 ? JSON.stringify(event.properties) : "—"}
              </td>
              <td className="px-4 py-3 text-gray-500">{new Date(event.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
