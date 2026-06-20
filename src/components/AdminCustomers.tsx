import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";

type Customer = Record<string, unknown>;

export default function AdminCustomers(props: { onSelectCustomer: (id: string) => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.customers({ limit, offset: page * limit, search: search || undefined, kyc_status: kycFilter || undefined });
      setCustomers(result.items || []);
      setTotal(result.count || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, kycFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    load();
  };

  const kycBadge = (status: unknown) => {
    const s = String(status || "");
    const styles: Record<string, string> = {
      verified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      incomplete: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    };
    return styles[s] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  };

  const str = (v: unknown) => (v != null && v !== "" ? String(v) : null);

  if (error) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customers</h1>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>
        <button onClick={load} className="text-sm text-[var(--brand-primary)] hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{total} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-[3px] border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--brand-primary)] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          <button type="submit" className="rounded-[3px] bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)]">
            Search
          </button>
        </form>
        <select
          value={kycFilter}
          onChange={(e) => { setKycFilter(e.target.value); setPage(0); }}
          className="rounded-[3px] border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[var(--brand-primary)] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">All KYC status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">KYC</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--brand-primary)]" />
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const id = String(c.id || "");
                return (
                  <tr
                    key={id || Math.random()}
                    onClick={() => id && props.onSelectCustomer(id)}
                    className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${id ? "cursor-pointer" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{str(c.full_name) || "\u2014"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{str(c.email) || "\u2014"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{str(c.phone_number) || "\u2014"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${kycBadge(c.kyc_status)}`}>
                        {str(c.kyc_status) || "none"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {c.created_at ? new Date(c.created_at as string).toLocaleDateString() : "\u2014"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-[3px] border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page + 1} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * limit >= total}
            className="rounded-[3px] border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
