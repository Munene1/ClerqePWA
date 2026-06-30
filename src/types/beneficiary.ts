export type BeneficiaryGroup = {
  id: string;
  customer_id?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_system?: boolean;
};

export type BeneficiarySchedule = {
  id: string;
  customer_id?: string;
  beneficiary_id?: string;
  group_id?: string;
  amount: number;
  currency: string;
  frequency: string;
  interval_days?: number;
  start_date: string;
  end_date?: string;
  next_run_at?: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
};

export type NextSchedule = {
  amount: number;
  currency: string;
  next_run_at: string;
  frequency: string;
};

export type Beneficiary = {
  id: string;
  customer_id: string;
  display_name: string;
  phone?: string;
  email?: string;
  notes?: string;
  destination_json?: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at?: string;
  groups?: BeneficiaryGroup[];
  next_schedule?: NextSchedule | null;
};

export type BeneficiaryDetail = Beneficiary & {
  schedules: BeneficiarySchedule[];
  recent_transactions: Record<string, unknown>[];
};

export type BeneficiariesResponse = {
  status: string;
  items: Beneficiary[];
  count: number;
  limit: number;
  offset: number;
};

export type BeneficiaryDetailResponse = {
  status: string;
  beneficiary: BeneficiaryDetail;
};

export type GroupsResponse = {
  status: string;
  groups: BeneficiaryGroup[];
};

export type SchedulesResponse = {
  status: string;
  schedules: BeneficiarySchedule[];
};

export type ImportPayload = {
  display_name: string;
  phone?: string;
  email?: string;
  notes?: string;
  destination_json?: Record<string, unknown>;
  groups?: string[];
};

export type ImportResult = {
  status: string;
  created: number;
  skipped: number;
  errors: { name: string; error: string }[];
};

export const FREQUENCY_LABELS: Record<string, string> = {
  once: "Once",
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  custom: "Custom",
};

export const DEFAULT_GROUP_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6",
  "#06B6D4", "#F97316", "#6366F1", "#14B8A6", "#EF4444",
  "#84CC16", "#A855F7", "#E11D48", "#0EA5E9",
];
