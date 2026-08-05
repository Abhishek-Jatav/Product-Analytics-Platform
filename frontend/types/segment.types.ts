export type ConditionOperator = "equals" | "not_equals" | "contains" | "at_least" | "exactly" | "never";

export interface SegmentCondition {
  type: "property" | "event";
  key?: string;
  operator: ConditionOperator;
  value?: string;
  event_name?: string;
  count?: number;
}

export interface Segment {
  id: string;
  project_id: string;
  name: string;
  conditions: SegmentCondition[];
  created_at: string;
}

export interface CreateSegmentPayload {
  name: string;
  conditions: SegmentCondition[];
}

export interface SegmentPreview {
  segment: Segment;
  matching_user_count: number;
  sample_distinct_ids: string[];
}
