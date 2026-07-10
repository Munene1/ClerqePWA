type CacheEntry<T = unknown> = {
  data: T;
  timestamp: number;
};

export class DataCache {
  private store = new Map<string, CacheEntry>();
  private pending = new Map<string, Promise<unknown>>();
  private defaultTTL = 5 * 60 * 1000;

  get<T>(key: string): T | undefined {
    return this.store.get(key)?.data as T | undefined;
  }

  set<T>(key: string, data: T): void {
    this.store.set(key, { data, timestamp: Date.now() });
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  isStale(key: string, ttl?: number): boolean {
    const entry = this.store.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > (ttl ?? this.defaultTTL);
  }

  invalidate(key: string): void {
    this.store.delete(key);
    this.pending.delete(key);
  }

  invalidateAll(): void {
    this.store.clear();
    this.pending.clear();
  }

  async fetch<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const existing = this.get<T>(key);
    if (existing !== undefined && !this.isStale(key, ttl)) {
      return existing;
    }

    const p = this.pending.get(key);
    if (p) return p as Promise<T>;

    const promise = fetcher()
      .then((data) => {
        this.set(key, data);
        this.pending.delete(key);
        return data;
      })
      .catch((err) => {
        this.pending.delete(key);
        if (existing !== undefined) return existing;
        throw err;
      });

    this.pending.set(key, promise);
    return promise;
  }
}

export const dataCache = new DataCache();
