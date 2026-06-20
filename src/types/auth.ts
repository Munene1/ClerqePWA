export type CustomerSession = {
  customer_id: string;
  session_id: string;
  access_token: string;
  token_type?: string;
  customer?: Record<string, unknown>;
  account_summary?: unknown[];
};

export type AccountNotFoundResponse = {
  status: "account_not_found";
  identifier: string;
  requires_confirmation: boolean;
  next_step: string;
  message: string;
};

export type OtpSentResponse = {
  status: "otp_sent";
  challenge_id: string;
  action_request_id?: string;
  message?: string;
};

export type SignUpFlowState = {
  flow: "signup";
  identifier: string;
  full_name: string;
  action_request_id: string;
  challenge_id: string;
  message?: string;
};

export type AuthFlowState = SignUpFlowState;

export type LoginResponse =
  | CustomerSession
  | AccountNotFoundResponse;
