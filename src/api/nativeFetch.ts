const isNative = () => {
  try {
    const w = window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } };
    return w.Capacitor?.isNativePlatform?.() === true;
  } catch {
    return false;
  }
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

  const { Http } = await import("@capacitor-community/http");
  const res = await Http.request({
    url,
    method: (options.method as string) || "GET",
    headers: (options.headers as Record<string, string>) || {},
    data: options.body ? JSON.parse(options.body as string) : undefined,
    connectTimeout: options.timeout ?? 10000,
    readTimeout: options.timeout ?? 10000,
  });
  return { status: res.status, data: res.data as T };
}
