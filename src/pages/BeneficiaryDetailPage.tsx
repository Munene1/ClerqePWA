import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { beneficiariesApi } from "../api/beneficiaries";
import { useCachedList } from "../hooks/useCachedList";
import type { BeneficiaryDetail, BeneficiarySchedule } from "../types/beneficiary";
import { FREQUENCY_LABELS } from "../types/beneficiary";

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 px-4 py-4 last:border-b-0 dark:border-gray-800">
      {title && <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</p>}
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-20 shrink-0 text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <span className="min-w-0 break-words text-sm text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}

export default function BeneficiaryDetailPage({ accessToken, idOverride, onBack, compact }: { accessToken: string; idOverride?: string; onBack?: () => void; compact?: boolean }) {
  const paramsId = useParams<{ id: string }>().id;
  const id = idOverride || paramsId;
  const navigate = useNavigate();
  const [detail, setDetail] = useState<BeneficiaryDetail | null>(null);

  const fetcher = useCallback(async () => {
    return beneficiariesApi.get(accessToken, id!);
  }, [accessToken, id]);

  const cacheKey = `beneficiary:${accessToken}:${id}`;
  const { data, loading, error } = useCachedList(cacheKey, fetcher);

  useEffect(() => {
    if (data) setDetail(data);
  }, [data]);

  useEffect(() => {
    if (error && !loading) {
      if (onBack) onBack();
      else navigate("/beneficiaries", { replace: true });
    }
  }, [error, loading, onBack, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white dark:bg-[#080808]">
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!detail) return null;

  const dest = detail.destination_json || {};
  const fallbackPhone = dest.recipient_phone as string | undefined;
  const fallbackEmail = dest.recipient_email as string | undefined;
  const accountNumber = (dest.recipient_account_number || dest.account_ref) as string | undefined;
  const merchantName = dest.merchant_name as string | undefined;

  return (
    <div className={`${compact ? "" : "mx-auto min-h-dvh max-w-2xl"} bg-white dark:bg-[#080808] ${compact ? "h-full overflow-y-auto no-scrollbar" : ""}`}>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-[#080808]">
        <div className="flex items-center px-4 pt-[calc(0.75rem+var(--sat,0px))] h-11">
          {!compact && (
            <button
              onClick={() => { onBack ? onBack() : navigate("/beneficiaries"); }}
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:active:bg-gray-700 ${onBack ? "" : "md:hidden"}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {!compact && onBack && <span className="ml-1 text-sm font-medium text-gray-900 dark:text-gray-100">Detail</span>}
        </div>
        <div className="px-4 pb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{detail.display_name.length > 30 ? `${detail.display_name.slice(0, 30)}…` : detail.display_name}</h1>
        </div>
      </div>

      <div>
        <Section title="Contact">
          {(detail.phone || fallbackPhone) && <Row label="Phone" value={detail.phone || fallbackPhone || ""} />}
          {(detail.email || fallbackEmail) && <Row label="Email" value={detail.email || fallbackEmail || ""} />}
          {accountNumber && <Row label="Account" value={accountNumber} />}
          {merchantName && <Row label="Merchant" value={merchantName} />}
          <Row label="Notes" value={detail.notes || "—"} />
        </Section>

        <Section title="Groups">
          {(detail.groups || []).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(detail.groups || []).map((g) => (
                <span
                  key={g.id}
                  className="inline-block rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400"
                >
                  {g.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">None</p>
          )}
        </Section>

        <Section title="Schedules">
          {(detail.schedules || []).length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No schedules</p>
          ) : (
            <div className="space-y-1.5">
              {(detail.schedules || []).map((s: BeneficiarySchedule) => (
                <div key={s.id} className="rounded border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {s.currency} {s.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {FREQUENCY_LABELS[s.frequency] || s.frequency}
                    {s.next_run_at && <span> &middot; Next {new Date(s.next_run_at).toLocaleDateString()}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recent transactions">
          {(detail.recent_transactions || []).length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No transactions yet</p>
          ) : (
            <div className="space-y-1.5">
              {(detail.recent_transactions || []).slice(-5).reverse().map((txn: Record<string, unknown>, i: number) => (
                <div key={i} className="rounded border border-gray-200 px-3 py-2 dark:border-gray-700">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {String(txn.content ?? "").slice(0, 120) || "Transaction"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    {txn.created_at ? new Date(txn.created_at as string).toLocaleString() : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
