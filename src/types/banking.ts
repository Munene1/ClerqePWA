export type SocketConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error"
  | "closed"
  | "reconnect_failed";

export type ClarificationOption = {
  id?: string;
  label: string;
  value?: string;
  type?: "account" | "card" | "beneficiary" | "date_range" | string;
  description?: string;
};

