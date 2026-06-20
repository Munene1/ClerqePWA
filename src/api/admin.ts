import { nativeFetch } from "./nativeFetch";
import { API_BASE_URL } from "../config/env";
import type {
  AdminSession,
  AdminHealth,
  AdminCustomer,
  AdminCustomerDetail,
  AdminOperationalSummary,
  AdminPaginatedResponse,
  AdminEvent,
} from "../types/admin";

const ADMIN_STORAGE_KEY = "banka_admin_session";

function getAdminToken(): string | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    return session.access_token;
  } catch {
    return null;
  }
}

function adminHeaders(): Record<string, string> {
  const token = getAdminToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function adminLogin(
  apiKey: string,
): Promise<{ status: string; admin?: { id: string; role: string }; error?: string }> {
  const { status, data } = await nativeFetch<{ access_token?: string; admin?: { id: string; role: string }; detail?: string }>(
    `${API_BASE_URL}/auth/ops`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Key": apiKey },
      body: JSON.stringify({ username: "admin" }),
      timeout: 10000,
    },
  );
  if (status === 200 && data.access_token) {
    const session: AdminSession = {
      access_token: data.access_token,
      token_type: "bearer",
      admin: data.admin!,
    };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
    return { status: "ok", admin: data.admin };
  }
  return { status: "error", error: data.detail || "Invalid admin key" };
}

export function adminLogout(): void {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

export async function adminFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const qs = params
    ? "?" + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  const { status, data } = await nativeFetch<T>(
    `${API_BASE_URL}${path}${qs}`,
    { method: "GET", headers: adminHeaders(), timeout: 15000 },
  );
  if (status === 401) {
    adminLogout();
    throw new Error("Session expired");
  }
  if (status < 200 || status >= 300) {
    const detail = (data as Record<string, unknown>)?.detail;
    throw new Error(typeof detail === "string" ? detail : `Request failed (${status})`);
  }
  return data;
}

export async function adminPost<T>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const { status, data } = await nativeFetch<T>(
    `${API_BASE_URL}${path}`,
    {
      method: "POST",
      headers: adminHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      timeout: 15000,
    },
  );
  if (status === 401) {
    adminLogout();
    throw new Error("Session expired");
  }
  return data;
}

// ── Convenience wrappers ──────────────────────────────────────────────

export const adminApi = {
  health: () => adminFetch<AdminHealth>("/admin/health"),

  operationalSummary: () =>
    adminFetch<AdminOperationalSummary>("/admin/operational-summary"),

  customers: (params?: { limit?: number; offset?: number; search?: string; kyc_status?: string }) =>
    adminFetch<AdminPaginatedResponse<AdminCustomer>>("/admin/customers", params),

  customerDetail: (id: string) =>
    adminFetch<AdminCustomerDetail>(`/admin/customers/${id}`),

  activeSessions: (params?: { limit?: number; offset?: number; customer_id?: string }) =>
    adminFetch<AdminPaginatedResponse<{ id: string; customer_id: string; status: string; started_at: string }>>(
      "/admin/active-sessions",
      params,
    ),

  events: (params?: { limit?: number; offset?: number; event_type?: string; customer_id?: string }) =>
    adminFetch<AdminPaginatedResponse<AdminEvent>>("/admin/events", params),

  auditLogs: (params?: { limit?: number; offset?: number; event_type?: string }) =>
    adminFetch<AdminPaginatedResponse<Record<string, unknown>>>("/admin/audit-logs", params),

  failedRuns: (params?: { limit?: number; offset?: number }) =>
    adminFetch<AdminPaginatedResponse<Record<string, unknown>>>("/admin/failed-runs", params),

  pendingActions: (params?: { limit?: number; offset?: number }) =>
    adminFetch<AdminPaginatedResponse<Record<string, unknown>>>("/admin/pending-action-requests", params),

  pendingEscalations: (params?: { limit?: number; offset?: number }) =>
    adminFetch<AdminPaginatedResponse<Record<string, unknown>>>("/admin/escalations", params),

  approveAction: (actionRequestId: string) =>
    adminPost<{ status: string; action_request_id: string }>(
      `/admin/action-requests/${actionRequestId}/approve`,
    ),
};
