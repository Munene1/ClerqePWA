import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";

type Session = { id: string; customer_id: string; status: string; started_at: string };

export default function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const result = await adminApi.activeSessions({ limit, offset: page * limit });
      setSessions(result.items || []);
      setTotal(result.count || 0);
    } catch { /* handled */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Sessions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{total} active</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Session ID</th>
              <th className="px-4 py-3">Customer ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center"><div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--brand-primary)]" /></td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No active sessions</td></tr>
            ) : sessions.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-gray-100">{s.id.slice(0, 12)}...</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{s.customer_id.slice(0, 12)}...</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">{s.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{s.started_at ? new Date(s.started_at).toLocaleString() : "—"}</td>
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
