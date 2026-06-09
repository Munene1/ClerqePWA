export type BankingEvent = {
  type?: string;
  event?: string;
  event_type?: string;
  payload?: Record<string, unknown>;
  data?: Record<string, unknown>;
  id?: string;
  event_id?: string;
  correlation_id?: string;
  [key: string]: unknown;
};

export type HistoryRow = {
  id?: string;
  message?: string;
  text?: string;
  content?: string;
  role?: string;
  created_at?: string;
  createdAt?: string;
  [key: string]: unknown;
};
