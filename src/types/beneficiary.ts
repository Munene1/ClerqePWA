export interface BeneficiaryGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface BeneficiarySchedule {
  id: string;
  beneficiary_id: string;
  amount: number;
  currency: string;
  frequency: string;
  start_date?: string;
  next_run_at?: string;
  status?: string;
}

export interface BeneficiaryDetail {
  id: string;
  customer_id: string;
  display_name: string;
  phone?: string;
  email?: string;
  notes?: string;
  destination_json?: Record<string, unknown>;
  groups?: BeneficiaryGroup[];
  schedules?: BeneficiarySchedule[];
  recent_transactions?: Record<string, unknown>[];
  created_at: string;
  updated_at?: string;
}

export interface BeneficiaryListItem {
  id: string;
  display_name: string;
  phone?: string;
  email?: string;
  destination_json?: Record<string, unknown>;
  groups?: BeneficiaryGroup[];
  created_at: string;
}

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  custom: "Custom",
};
