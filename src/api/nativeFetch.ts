import { CapacitorHttp } from "@capacitor/core";

const isNative = () => {
  try {
    const w = window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } };
    return w.Capacitor?.isNativePlatform?.() === true;
  } catch {
    return false;
  }
};

const methodMap: Record<string, (opts: any) => Promise<any>> = {
  GET: CapacitorHttp.get,
  POST: CapacitorHttp.post,
  PUT: CapacitorHttp.put,
  PATCH: CapacitorHttp.patch,
  DELETE: CapacitorHttp.delete,
};

export async function nativeFetch<T>(
  url: string,
  options: RequestInit & { timeout?: number },
): Promise<{ data: T; status: number }> {
  if (!isNative()) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), options.timeout ?? 10000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      window.clearTimeout(timeout);
      const text = await res.text();
      return { status: res.status, data: (text ? JSON.parse(text) : {}) as T };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const method = (options.method || "GET").toUpperCase();
  const nativeMethod = methodMap[method] || CapacitorHttp.request;
  const headers = (options.headers as Record<string, string>) || {};

  const opts: Record<string, any> = {
    url,
    headers,
    connectTimeout: options.timeout ?? 10000,
    readTimeout: options.timeout ?? 10000,
  };

  if (options.body && method !== "GET") {
    opts.data = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
  }

  const res = await nativeMethod(opts);
  return { status: res.status, data: res.data as T };
}
