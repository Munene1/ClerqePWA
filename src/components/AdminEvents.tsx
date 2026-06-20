import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import type { AdminEvent, AdminPaginatedResponse } from "../types/admin";

export default function AdminEvents() {
  const [data, setData] = useState<AdminPaginatedResponse<AdminEvent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const limit = 20;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.events({ limit, offset: page * limit, event_type: typeFilter || undefined });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, typeFilter]);

  const items = data?.items || [];
  const total = data?.count || 0;

  const eventColor = (type: string) => {
    if (!type) return "text-gray-600 dark:text-gray-400";
    if (type.includes("failed") || type.includes("error")) return "text-red-600 dark:text-red-400";
    if (type.includes("completed") || type.includes("resolved")) return "text-green-600 dark:text-green-400";
    if (type.includes("created") || type.includes("started")) return "text-blue-600 dark:text-blue-400";
    return "text-gray-600 dark:text-gray-400";
  };

  if (error) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Events</h1>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>
        <button onClick={load} className="text-sm text-[var(--brand-primary)] hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Events</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{total} total</p>
      </div>

      <select
        value={typeFilter}
        onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
        className="rounded-[3px] border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--brand-primary)] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="">All event types</option>
        <option value="dashboard.tool_started">Tool Started</option>
        <option value="dashboard.tool_completed">Tool Completed</option>
        <option value="dashboard.run_completed">Run Completed</option>
        <option value="dashboard.run_failed">Run Failed</option>
        <option value="dashboard.message_received">Message Received</option>
        <option value="dashboard.policy_decision">Policy Decision</option>
        <option value="dashboard.escalation_created">Escalation</option>
      </select>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center"><div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--brand-primary)]" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No events</td></tr>
            ) : items.map((e) => (
              <tr key={e.id || Math.random()} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className={`px-4 py-3 font-medium ${eventColor(e.type)}`}>{e.type || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{e.customer_id ? `${e.customer_id.slice(0, 8)}...` : "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{e.session_id ? `${e.session_id.slice(0, 8)}...` : "—"}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{e.created_at ? new Date(e.created_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-[3px] border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300">Previous</button>
          <span className="text-sm text-gray-500 dark:text-gray-400">Page {page + 1} of {Math.ceil(total / limit)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * limit >= total} className="rounded-[3px] border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300">Next</button>
        </div>
      )}
    </div>
  );
}
