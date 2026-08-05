export interface RetentionRatePoint {
  eligible_users: number;
  retained_users: number;
  rate: number;
}

export interface RetentionSummary {
  as_of: string;
  day1: RetentionRatePoint;
  day7: RetentionRatePoint;
  day30: RetentionRatePoint;
}

export interface RetentionCohortRow {
  cohort_start: string;
  cohort_size: number;
  percentages: (number | null)[];
}

export interface RetentionMatrix {
  period: "day" | "week";
  num_periods: number;
  cohorts: RetentionCohortRow[];
}
