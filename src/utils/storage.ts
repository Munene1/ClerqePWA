import type { AuthFlowState, CustomerSession } from "../types/auth";

const SESSION_KEY = "banking_pwa_session";
const AUTH_FLOW_KEY = "banking_pwa_auth_flow";

export const saveSession = (data: CustomerSession) => {
  const safe = {
    customer_id: data.customer_id,
    session_id: data.session_id,
    access_token: data.access_token,
    token_type: data.token_type,
    customer: data.customer || {},
    account_summary: data.account_summary || [],
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
};

export const loadSession = (): CustomerSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CustomerSession;
    if (!parsed.session_id || !parsed.access_token || !parsed.customer_id) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const clearSession = () => localStorage.removeItem(SESSION_KEY);

export const saveAuthFlowState = (data: AuthFlowState) => {
  localStorage.setItem(AUTH_FLOW_KEY, JSON.stringify(data));
};

export const loadAuthFlowState = (): AuthFlowState | null => {
  const raw = localStorage.getItem(AUTH_FLOW_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthFlowState;
  } catch {
    return null;
  }
};

export const clearAuthFlowState = () => localStorage.removeItem(AUTH_FLOW_KEY);

// Chat history cache (per customer, survives page reloads)
const CHAT_HISTORY_PREFIX = "clerqe_chat_";
const CHAT_CACHE_VERSION = 1;

type HistorySnapshot = {
  version: number;
  messages: { kind: string; id: string; text: string; createdAt: string }[];
  pairCount: number;
  loadedPairs: number;
  limit: number;
  updatedAt: string;
};

export const saveChatHistory = (
  customerId: string,
  messages: { kind: string; id: string; text: string; createdAt: string }[],
  pairCount?: number,
  loadedPairs?: number,
  limit?: number,
) => {
  try {
    const prev = loadChatHistoryRaw(customerId);
    const entry: HistorySnapshot = {
      version: CHAT_CACHE_VERSION,
      messages,
      pairCount: pairCount ?? prev?.pairCount ?? 0,
      loadedPairs: loadedPairs ?? prev?.loadedPairs ?? 0,
      limit: limit ?? prev?.limit ?? 30,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${CHAT_HISTORY_PREFIX}${customerId}`, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
};

const loadChatHistoryRaw = (customerId: string): HistorySnapshot | null => {
  try {
    const raw = localStorage.getItem(`${CHAT_HISTORY_PREFIX}${customerId}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as HistorySnapshot;
    if (entry.version !== CHAT_CACHE_VERSION) {
      localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${customerId}`);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
};

export const loadChatHistory = (
  customerId: string,
): { messages: { kind: string; id: string; text: string; createdAt: string }[]; pairCount: number; loadedPairs: number; limit: number } | null => {
  const raw = loadChatHistoryRaw(customerId);
  if (!raw) return null;
  return {
    messages: raw.messages,
    pairCount: raw.pairCount,
    loadedPairs: raw.loadedPairs,
    limit: raw.limit,
  };
};

const REMEMBERED_EMAIL_KEY = "clerqe_remembered_email";

export const saveRememberedEmail = (email: string) => {
  try { localStorage.setItem(REMEMBERED_EMAIL_KEY, email); } catch { /* ignore */ }
};

export const loadRememberedEmail = (): string | null => {
  try { return localStorage.getItem(REMEMBERED_EMAIL_KEY); } catch { return null; }
};

export const clearRememberedEmail = () => {
  try { localStorage.removeItem(REMEMBERED_EMAIL_KEY); } catch { /* ignore */ }
};

export const clearChatHistory = (customerId: string) => {
  try {
    localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${customerId}`);
  } catch {
    // ignore
  }
};
