import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";

type AuditLog = Record<string, unknown>;

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const result = await adminApi.auditLogs({ limit, offset: page * limit });
      setLogs(result.items || []);
      setTotal(result.count || 0);
    } catch { /* handled */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{total} total</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center"><div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--brand-primary)]" /></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No audit logs</td></tr>
            ) : logs.map((log, i) => (
              <tr key={(log.id as string) || i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{String(log.action || "—")}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{String(log.admin_id || log.actor_id || log.actor_type || "—")}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{String(log.resource || log.resource_type || "—")}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${log.status === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : log.status === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                    {String(log.status || "—")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {log.timestamp ? new Date(log.timestamp as string).toLocaleString() : log.created_at ? new Date(log.created_at as string).toLocaleString() : "—"}
                </td>
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
