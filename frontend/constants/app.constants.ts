export const APP_NAME = "Product Analytics Platform";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "pap_access_token",
  REFRESH_TOKEN: "pap_refresh_token",
  THEME: "pap_theme",
  CURRENT_WORKSPACE: "pap_current_workspace",
  CURRENT_PROJECT: "pap_current_project",
} as const;

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",
  EVENTS: "/dashboard/events",
  FUNNELS: "/dashboard/funnels",
  RETENTION: "/dashboard/retention",
  EXPERIMENTS: "/dashboard/experiments",
  SEGMENTS: "/dashboard/segments",
  ALERTS: "/dashboard/alerts",
  TEAM: "/dashboard/team",
} as const;
