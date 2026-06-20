import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";

type Customer = Record<string, unknown>;
type Account = Record<string, unknown>;
type Session = Record<string, unknown>;

type Detail = {
  customer: Customer;
  accounts: Account[];
  sessions: Session[];
  sessions_total: number;
};

export default function AdminCustomerDetail(props: { customerId: string; onBack: () => void }) {
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await adminApi.customerDetail(props.customerId);
        if (!cancelled) setData(result as Detail);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [props.customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--brand-primary)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <button onClick={props.onBack} className="text-sm text-[var(--brand-primary)] hover:underline">&larr; Back</button>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error || "Not found"}</div>
      </div>
    );
  }

  const { customer, accounts, sessions, sessions_total } = data;
  const str = (v: unknown) => (v != null && v !== "" ? String(v) : null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={props.onBack} className="text-sm text-[var(--brand-primary)] hover:underline">&larr; Back</button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{str(customer.full_name) || "Unnamed"}</h1>
      </div>

      {/* Profile */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Email" value={str(customer.email)} />
          <Field label="Phone" value={str(customer.phone_number)} />
          <Field label="KYC Status" value={str(customer.kyc_status)} />
          <Field label="Date of Birth" value={str(customer.date_of_birth)} />
          <Field label="ID Type" value={str(customer.id_type)} />
          <Field label="ID Number" value={str(customer.id_number)} />
          <Field label="Nationality" value={str(customer.nationality)} />
          <Field label="Address" value={str([customer.address_line1, customer.address_line2].filter(Boolean).join(", "))} />
          <Field label="City" value={str(customer.city)} />
          <Field label="Postal Code" value={str(customer.postal_code)} />
          <Field label="Created" value={str(customer.created_at) ? new Date(customer.created_at as string).toLocaleString() : undefined} />
          <Field label="Updated" value={str(customer.updated_at) ? new Date(customer.updated_at as string).toLocaleString() : undefined} />
        </div>
      </div>

      {/* Accounts */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Accounts ({accounts?.length || 0})</h2>
        {!accounts?.length ? (
          <p className="text-sm text-gray-400">No accounts</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="pb-2">Account Number</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Balance</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {accounts.map((a, i) => (
                  <tr key={String(a.id || i)}>
                    <td className="py-2 font-mono text-xs text-gray-900 dark:text-gray-100">{str(a.account_number) || "—"}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{str(a.account_type) || "—"}</td>
                    <td className="py-2 font-medium text-gray-900 dark:text-gray-100">{str(a.currency) || ""} {a.balance ? parseFloat(String(a.balance)).toLocaleString() : "0"}</td>
                    <td className="py-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${a.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {str(a.status) || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Sessions ({sessions_total || 0})</h2>
        {!sessions?.length ? (
          <p className="text-sm text-gray-400">No sessions</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-medium text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="pb-2">Session ID</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sessions.map((s, i) => (
                  <tr key={String(s.id || i)}>
                    <td className="py-2 font-mono text-xs text-gray-900 dark:text-gray-100">{String(s.id || "").slice(0, 12) || "—"}...</td>
                    <td className="py-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                        {str(s.status) || "—"}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500 dark:text-gray-400">
                      {s.started_at ? new Date(s.started_at as string).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field(props: { label: string; value?: string | number | null }) {
  const val = props.value != null && props.value !== "" ? String(props.value) : null;
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{props.label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">{val || "\u2014"}</p>
    </div>
  );
}
