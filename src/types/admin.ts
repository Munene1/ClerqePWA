export type AdminSession = {
  access_token: string;
  token_type: string;
  admin: { id: string; role: string };
};

export type AdminHealthCheck = {
  status: string;
  latency_ms?: number;
  error?: string;
};

export type AdminHealth = {
  status: "healthy" | "degraded";
  checks: {
    database?: AdminHealthCheck;
    redis?: AdminHealthCheck;
    summary?: { total_customers: number; active_sessions: number };
  };
};

export type AdminCustomer = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  kyc_status: string;
  onboarding_required: boolean;
  date_of_birth?: string;
  id_type?: string;
  id_number?: string;
  nationality?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
};

export type AdminAccount = {
  id: string;
  customer_id: string;
  account_number: string;
  account_type: string;
  balance: string;
  currency: string;
  status: string;
};

export type AdminSessionInfo = {
  id: string;
  customer_id: string;
  status: string;
  started_at: string;
  last_active_at: string;
};

export type AdminCustomerDetail = {
  customer: AdminCustomer;
  accounts: AdminAccount[];
  sessions: AdminSessionInfo[];
  sessions_total: number;
};

export type AdminOperationalSummary = {
  active_workflows: number;
  pending_actions: number;
  actions_requiring_reconciliation: number;
  pending_auth_challenges: number;
  pending_escalations: number;
  failed_runs: number;
};

export type AdminEvent = {
  id: string;
  type: string;
  session_id: string;
  customer_id: string;
  agent_run_id: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type AdminPaginatedResponse<T> = {
  items: T[];
  count: number;
  limit: number;
  offset: number;
};
