export type AlertMetric = "dau" | "revenue" | "conversion_rate";
export type AlertDirection = "drop" | "spike";

export interface AlertRule {
  id: string;
  project_id: string;
  name: string;
  metric: AlertMetric;
  direction: AlertDirection;
  threshold_percent: number;
  created_at: string;
}

export interface CreateAlertPayload {
  name: string;
  metric: AlertMetric;
  direction: AlertDirection;
  threshold_percent: number;
}

export interface AlertCheckResult {
  rule: AlertRule;
  current_value: number;
  previous_value: number;
  percent_change: number | null;
  triggered: boolean;
  message: string;
}
