import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import type { AdminHealth, AdminOperationalSummary } from "../types/admin";

function StatCard(props: { label: string; value: number | string; color?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{props.label}</p>
      <p className={`mt-1 text-2xl font-bold ${props.color || "text-gray-900 dark:text-gray-100"}`}>
        {props.value}
      </p>
    </div>
  );
}

function StatusDot(props: { status: string }) {
  const color = props.status === "ok" ? "bg-green-500" : props.status === "healthy" ? "bg-green-500" : "bg-yellow-500";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export default function AdminDashboard() {
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [summary, setSummary] = useState<AdminOperationalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [h, s] = await Promise.all([adminApi.health(), adminApi.operationalSummary()]);
      setHealth(h);
      setSummary(s);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--brand-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">System overview and health</p>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Active Workflows" value={summary.active_workflows} />
          <StatCard label="Pending Actions" value={summary.pending_actions} color={summary.pending_actions > 0 ? "text-amber-600" : undefined} />
          <StatCard label="Reconciliation" value={summary.actions_requiring_reconciliation} color={summary.actions_requiring_reconciliation > 0 ? "text-red-600" : undefined} />
          <StatCard label="Auth Challenges" value={summary.pending_auth_challenges} />
          <StatCard label="Escalations" value={summary.pending_escalations} color={summary.pending_escalations > 0 ? "text-amber-600" : undefined} />
          <StatCard label="Failed Runs" value={summary.failed_runs} color={summary.failed_runs > 0 ? "text-red-600" : undefined} />
        </div>
      )}

      {/* Health checks */}
      {health && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">System Health</h2>
            <StatusDot status={health.status} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{health.status}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {health.checks.database && (
              <div className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <StatusDot status={health.checks.database.status} />
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Database</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {health.checks.database.latency_ms != null
                      ? `${health.checks.database.latency_ms}ms`
                      : health.checks.database.error || "unknown"}
                  </p>
                </div>
              </div>
            )}
            {health.checks.redis && (
              <div className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <StatusDot status={health.checks.redis.status} />
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Redis</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {health.checks.redis.latency_ms != null
                      ? `${health.checks.redis.latency_ms}ms`
                      : health.checks.redis.error || "unknown"}
                  </p>
                </div>
              </div>
            )}
            {health.checks.summary && (
              <div className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Customers</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {health.checks.summary.total_customers} total, {health.checks.summary.active_sessions} active sessions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => load()}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}
