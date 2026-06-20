import { useState } from "react";
import { adminLogin } from "../api/admin";

export default function AdminLoginScreen(props: { onLogin: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || loading) return;
    setLoading(true);
    setError(null);
    const result = await adminLogin(apiKey.trim());
    setLoading(false);
    if (result.status === "ok") {
      props.onLogin();
    } else {
      setError(result.error || "Invalid admin key");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm animate-fade-slide-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-primary)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Clerqe Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter your admin API key to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              className="w-full rounded-[3px] border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary-ring)] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
              placeholder="Admin API key"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setError(null); }}
            />
          </div>

          {error && (
            <div className="rounded-[3px] bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !apiKey.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
