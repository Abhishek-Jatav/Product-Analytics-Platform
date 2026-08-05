export interface AnalyticsEvent {
  id: string;
  name: string;
  distinct_id: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

export interface EventListResult {
  items: AnalyticsEvent[];
  total: number;
  page: number;
  page_size: number;
}

export interface EventFilters {
  event_name?: string;
  page?: number;
  page_size?: number;
}
