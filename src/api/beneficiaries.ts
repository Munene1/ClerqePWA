import { API_BASE_URL } from "../config/env";
import type {
  BeneficiariesResponse,
  BeneficiaryDetailResponse,
  GroupsResponse,
  ImportResult,
  SchedulesResponse,
} from "../types/beneficiary";
import { loadSession } from "../utils/storage";
import { nativeFetch } from "./nativeFetch";

function getToken(): string {
  const session = loadSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated.");
  }
  return session.access_token;
}

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await nativeFetch<Record<string, unknown>>(`${API_BASE_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
    timeout: 12000,
  });

  if (response.status < 200 || response.status >= 300) {
    const body = response.data || {};
    const detail =
      (typeof body.detail === "string" && body.detail) ||
      (typeof body.message === "string" && body.message) ||
      `Request failed (${response.status})`;
    throw new Error(detail);
  }

  return response.data as T;
}

export const beneficiariesApi = {
  list(q = "", groupId = "", limit = 100, offset = 0) {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (q) params.set("q", q);
    if (groupId) params.set("group_id", groupId);
    return apiFetch<BeneficiariesResponse>(`/beneficiaries?${params.toString()}`);
  },

  get(id: string) {
    return apiFetch<BeneficiaryDetailResponse>(`/beneficiaries/${id}`);
  },

  create(payload: Record<string, unknown>) {
    return apiFetch<{ status: string; beneficiary: Record<string, unknown> }>("/beneficiaries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: Record<string, unknown>) {
    return apiFetch<{ status: string; beneficiary: Record<string, unknown> }>(`/beneficiaries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  delete(id: string) {
    return apiFetch<{ status: string; deleted: boolean }>(`/beneficiaries/${id}`, {
      method: "DELETE",
    });
  },

  importBeneficiaries(items: Record<string, unknown>[]) {
    return apiFetch<ImportResult>("/beneficiaries/import", {
      method: "POST",
      body: JSON.stringify({ beneficiaries: items }),
    });
  },

  listGroups() {
    return apiFetch<GroupsResponse>("/beneficiaries/groups");
  },

  createGroup(payload: Record<string, unknown>) {
    return apiFetch<{ status: string; group: Record<string, unknown> }>("/beneficiaries/groups", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateGroup(id: string, payload: Record<string, unknown>) {
    return apiFetch<{ status: string; group: Record<string, unknown> }>(`/beneficiaries/groups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteGroup(id: string) {
    return apiFetch<{ status: string; deleted: boolean }>(`/beneficiaries/groups/${id}`, {
      method: "DELETE",
    });
  },

  assignGroup(beneficiaryId: string, groupId: string) {
    return apiFetch<{ status: string; membership: Record<string, unknown> }>("/beneficiaries/assign-group", {
      method: "POST",
      body: JSON.stringify({ beneficiary_id: beneficiaryId, group_id: groupId }),
    });
  },

  unassignGroup(beneficiaryId: string, groupId: string) {
    return apiFetch<{ status: string; removed: boolean }>("/beneficiaries/unassign-group", {
      method: "POST",
      body: JSON.stringify({ beneficiary_id: beneficiaryId, group_id: groupId }),
    });
  },

  listSchedules(beneficiaryId = "", groupId = "") {
    const params = new URLSearchParams();
    if (beneficiaryId) params.set("beneficiary_id", beneficiaryId);
    if (groupId) params.set("group_id", groupId);
    return apiFetch<SchedulesResponse>(`/beneficiaries/schedules?${params.toString()}`);
  },

  createSchedule(payload: Record<string, unknown>) {
    return apiFetch<{ status: string; schedule: Record<string, unknown> }>("/beneficiaries/schedules", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateSchedule(id: string, payload: Record<string, unknown>) {
    return apiFetch<{ status: string; schedule: Record<string, unknown> }>(`/beneficiaries/schedules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteSchedule(id: string) {
    return apiFetch<{ status: string; deleted: boolean }>(`/beneficiaries/schedules/${id}`, {
      method: "DELETE",
    });
  },
};
