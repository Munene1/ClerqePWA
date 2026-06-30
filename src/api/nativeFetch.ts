import { CapacitorHttp } from "@capacitor/core";
import { API_BASE_URL } from "../config/env";

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

const FALLBACK_BASE = "https://clerqe.com";
const isLocalBase = API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1") || API_BASE_URL.includes("::1");
let fallbackBase: string | null = null;

function replaceBase(url: string, newBase: string): string {
  return url.replace(API_BASE_URL, newBase);
}

async function doFetch(url: string, options: RequestInit & { timeout?: number }): Promise<{ data: any; status: number }> {
  if (isNative()) {
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
    return { status: res.status, data: res.data };
  }

  const controller = new AbortController();
  const id = window.setTimeout(() => controller.abort(), options.timeout ?? 10000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    window.clearTimeout(id);
    const text = await res.text();
    return { status: res.status, data: (text ? JSON.parse(text) : {}) };
  } finally {
    window.clearTimeout(id);
  }
}

export async function nativeFetch<T>(
  url: string,
  options: RequestInit & { timeout?: number },
): Promise<{ data: T; status: number }> {
  if (!isLocalBase) {
    return doFetch(url, options);
  }

  const effectiveBase = fallbackBase || API_BASE_URL;
  const effectiveUrl = effectiveBase === API_BASE_URL ? url : replaceBase(url, effectiveBase);

  try {
    return await doFetch(effectiveUrl, { ...options, timeout: options.timeout ?? 3000 });
  } catch (err) {
    if (fallbackBase) throw err;
    fallbackBase = FALLBACK_BASE;
    const fallbackUrl = replaceBase(url, FALLBACK_BASE);
    return doFetch(fallbackUrl, { ...options, timeout: options.timeout ?? 10000 });
  }
}
