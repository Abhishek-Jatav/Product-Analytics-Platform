import { Card } from "@/components/common/Card";
import type { AnalyticsEvent } from "@/types/event.types";

export function LiveEventTicker({ events }: { events: AnalyticsEvent[] }) {
  if (events.length === 0) {
    return (
      <Card className="text-center py-6 mb-4">
        <p className="text-small text-gray-500">Waiting for events…</p>
        <p className="text-caption text-gray-400 mt-1">Fire an event from your app to see it appear here instantly.</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden mb-4">
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 text-caption text-gray-500 uppercase tracking-wide">
        Live feed
      </div>
      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {events.map((event) => (
          <div key={event.id} className="px-4 py-2 flex items-center justify-between text-small">
            <div>
              <span className="font-medium">{event.name}</span>
              <span className="text-gray-500"> · {event.distinct_id}</span>
            </div>
            <span className="text-caption text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
