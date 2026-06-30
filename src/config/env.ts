function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function browserOrigin(): string | null {
  if (typeof window === "undefined") return null;
  const origin = window.location?.origin;
  if (!origin || origin === "null" || origin.startsWith("capacitor://")) return null;
  return trimTrailingSlash(origin);
}

const resolvedApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  browserOrigin() ||
  "https://clerqe.com";

const resolvedWsBase =
  import.meta.env.VITE_WS_BASE_URL ||
  resolvedApiBase.replace(/^http/i, "ws");

export const API_BASE_URL = trimTrailingSlash(resolvedApiBase);
export const WS_BASE_URL = trimTrailingSlash(resolvedWsBase);
