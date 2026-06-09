import { API_BASE_URL } from "../config/env";
import type {
  CustomerSession,
  LoginResponse,
  OtpSentResponse,
  PinSetupRequiredResponse,
  SignUpFlowState,
} from "../types/auth";

const jsonHeaders = { "Content-Type": "application/json" };
const REQUEST_TIMEOUT_MS = 10000;

type ApiErrorPayload = {
  message?: unknown;
  detail?: unknown;
  error?: unknown;
  errors?: unknown;
};

function parseResponseBody(raw: string) {
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { message: raw.trim() };
  }
}

function extractMessageFromValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => extractMessageFromValue(item))
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(", ") : null;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["message", "detail", "msg", "error"]) {
      const nested = extractMessageFromValue(record[key]);
      if (nested) return nested;
    }
    const entries = Object.entries(record)
      .map(([key, nestedValue]) => {
        const nested = extractMessageFromValue(nestedValue);
        return nested ? `${key}: ${nested}` : null;
      })
      .filter((item): item is string => Boolean(item));
    return entries.length ? entries.join(", ") : null;
  }
  return null;
}

export function extractApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof Error) {
    const message = error.message?.trim();
    if (message && message.toLowerCase() !== "failed to fetch") return message;
    return "We couldn't reach the server. Please check the connection and try again.";
  }
  return fallback;
}

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The server took too long to respond. Please try again.");
    }
    throw new Error(extractApiErrorMessage(error));
  } finally {
    window.clearTimeout(timeout);
  }

  const raw = await response.text().catch(() => "");
  const data = parseResponseBody(raw) as ApiErrorPayload & Record<string, unknown>;

  if (!response.ok) {
    const message =
      extractMessageFromValue(data.message) ||
      extractMessageFromValue(data.detail) ||
      extractMessageFromValue(data.error) ||
      extractMessageFromValue(data.errors) ||
      extractMessageFromValue(data) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function demoLogin(identifier: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/sso", { identifier });
}

export const ACCOUNT_CREATION_TERMS = `
Welcome to Clerqe

Clerqe is a conversational banking agent built to make banking simpler and easier to use.

Our mission is to help more people access banking confidently, especially customers who are underserved by complex apps, menus, language barriers, or limited access to support.

This version of Clerqe is a sandbox chat experience. You can use it to interact with simulated banking workflows such as balance checks, transaction searches, transfers, payouts, statements, and service requests.

No real money is moved in this sandbox. No live bank account is connected. No actual banking instruction is sent to a financial institution.

By creating an account, you confirm that you understand this is a sandbox environment and agree to Clerqe's Terms of Use, Privacy Policy, and Sandbox Disclaimer.
`.trim();

export async function confirmAccountCreation(
  payload: Pick<SignUpFlowState, "identifier" | "full_name">,
) {
  return request<OtpSentResponse>("/auth/account-creation/confirm", {
    ...payload,
    confirm_create_account: true,
    terms_accepted: true,
    terms_text: ACCOUNT_CREATION_TERMS,
  });
}

export async function verifyAccountCreationOtp(payload: {
  action_request_id: string;
  challenge_id: string;
  otp: string;
}) {
  return request<CustomerSession | PinSetupRequiredResponse>(
    "/auth/account-creation/verify-otp",
    payload,
  );
}

export async function setupAccountCreationPin(payload: {
  action_request_id: string;
  pin: string;
  confirm_pin: string;
}) {
  return request<CustomerSession>("/auth/account-creation/setup-pin", payload);
}
