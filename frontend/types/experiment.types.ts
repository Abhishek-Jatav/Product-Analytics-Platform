export interface Variant {
  id: string;
  name: string;
  traffic_allocation: number;
  is_control: boolean;
}

export interface Experiment {
  id: string;
  project_id: string;
  name: string;
  conversion_event: string;
  status: string;
  variants: Variant[];
  created_at: string;
}

export interface VariantInput {
  name: string;
  traffic_allocation: number;
}

export interface CreateExperimentPayload {
  name: string;
  conversion_event: string;
  variants: VariantInput[];
}

export interface VariantResult {
  variant_id: string;
  name: string;
  is_control: boolean;
  exposures: number;
  conversions: number;
  conversion_rate: number;
  uplift_vs_control: number | null;
  p_value: number | null;
  is_significant: boolean;
}

export interface ExperimentResults {
  experiment: Experiment;
  variants: VariantResult[];
  winner_variant_id: string | null;
}
