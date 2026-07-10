import { API_BASE_URL } from "../config/env";
import { nativeFetch } from "./nativeFetch";
import type { BeneficiaryDetail, BeneficiaryGroup, BeneficiaryListItem } from "../types/beneficiary";

const BASE = `${API_BASE_URL}/beneficiaries`;

function authHeaders(token: string): Record<string, string> {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export const beneficiariesApi = {
  async list(
    token: string,
    params?: { q?: string; group_id?: string; limit?: number; offset?: number },
  ): Promise<{ items: BeneficiaryListItem[]; count: number; limit: number; offset: number }> {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.group_id) qs.set("group_id", params.group_id);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    const url = `${BASE}?${qs.toString()}`;
    const { data } = await nativeFetch<{ status: string; items: BeneficiaryListItem[]; count: number; limit: number; offset: number }>(
      url,
      { method: "GET", headers: authHeaders(token), timeout: 10000 },
    );
    return data;
  },

  async get(token: string, id: string): Promise<BeneficiaryDetail> {
    const { data } = await nativeFetch<{ status: string; beneficiary: BeneficiaryDetail }>(
      `${BASE}/${id}`,
      { method: "GET", headers: authHeaders(token), timeout: 10000 },
    );
    return data.beneficiary;
  },

  async create(
    token: string,
    payload: { display_name: string; phone?: string; email?: string; notes?: string; group_ids?: string[] },
  ): Promise<BeneficiaryDetail> {
    const { data } = await nativeFetch<{ status: string; beneficiary: BeneficiaryDetail }>(
      BASE,
      { method: "POST", headers: authHeaders(token), body: JSON.stringify(payload), timeout: 10000 },
    );
    return data.beneficiary;
  },

  async update(
    token: string,
    id: string,
    payload: { display_name?: string; phone?: string; email?: string; notes?: string },
  ): Promise<BeneficiaryDetail> {
    const { data } = await nativeFetch<{ status: string; beneficiary: BeneficiaryDetail }>(
      `${BASE}/${id}`,
      { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(payload), timeout: 10000 },
    );
    return data.beneficiary;
  },

  async delete(token: string, id: string): Promise<void> {
    await nativeFetch(`${BASE}/${id}`, { method: "DELETE", headers: authHeaders(token), timeout: 10000 });
  },

  async importCSV(token: string, beneficiaries: { display_name: string; phone?: string; email?: string }[]): Promise<{ imported: number; errors: string[] }> {
    const { data } = await nativeFetch<{ status: string; imported: number; errors: string[] }>(
      `${BASE}/import`,
      { method: "POST", headers: authHeaders(token), body: JSON.stringify({ beneficiaries }), timeout: 15000 },
    );
    return data;
  },

  async listGroups(token: string): Promise<BeneficiaryGroup[]> {
    const { data } = await nativeFetch<{ status: string; groups: BeneficiaryGroup[] }>(
      `${BASE}/groups`,
      { method: "GET", headers: authHeaders(token), timeout: 10000 },
    );
    return data.groups;
  },
};
