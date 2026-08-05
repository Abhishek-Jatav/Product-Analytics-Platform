export interface DashboardSummary {
  start_date: string;
  end_date: string;
  dau: number;
  wau: number;
  mau: number;
  active_users: number;
  new_users: number;
  returning_users: number;
  revenue: number;
  conversion_rate: number;
}

export interface TrendPoint {
  date: string;
  active_users: number;
}

export interface DashboardTrend {
  points: TrendPoint[];
}

export interface DashboardFilters {
  start_date?: string;
  end_date?: string;
}
