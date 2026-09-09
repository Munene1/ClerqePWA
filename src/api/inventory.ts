import { API_BASE_URL } from "../config/env";

export type InventoryBusiness = {
  shop_id: string;
  name: string;
  location?: string | null;
};

export type InventoryConnectionState = {
  status: "not_checked" | "no_match" | "available" | "multiple_matches" | "connected";
  connection_id?: string;
  business?: InventoryBusiness | { name: string; location?: string | null } | null;
  businesses?: InventoryBusiness[];
  message?: string;
};

async function inventoryRequest(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<InventoryConnectionState> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(data.detail || data.message || "Inventory connection request failed."));
  }
  return data as InventoryConnectionState;
}

export function discoverInventoryConnection(token: string): Promise<InventoryConnectionState> {
  return inventoryRequest(token, "/inventory/connection");
}

export function connectInventoryBusiness(token: string, shopId: string): Promise<InventoryConnectionState> {
  return inventoryRequest(token, "/inventory/connect", {
    method: "POST",
    body: JSON.stringify({ shop_id: shopId }),
  });
}
