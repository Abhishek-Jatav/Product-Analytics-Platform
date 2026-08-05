export interface Funnel {
  id: string;
  project_id: string;
  name: string;
  steps: string[];
  created_at: string;
}

export interface FunnelStepResult {
  step_index: number;
  event_name: string;
  users_reached: number;
  conversion_from_start: number;
  conversion_from_previous: number;
  drop_off: number;
  avg_time_from_previous_seconds: number | null;
}

export interface FunnelAnalysis {
  funnel: Funnel;
  start_date: string;
  end_date: string;
  steps: FunnelStepResult[];
}

export interface CreateFunnelPayload {
  name: string;
  steps: string[];
}
