import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PencilLine, Trash2 } from "lucide-react";
import { beneficiariesApi } from "../api/beneficiaries";
import GroupPopover from "../components/GroupPopover";
import { FREQUENCY_LABELS, type BeneficiaryDetail, type BeneficiaryGroup, type BeneficiarySchedule } from "../types/beneficiary";

function detailLabel(detail: BeneficiaryDetail): string {
  const kind = String((detail.destination_json || {}).kind || "").toLowerCase();
  if (kind === "bill_beneficiary") return "Bill payment beneficiary";
  if (kind === "transfer_recipient") return "Transfer beneficiary";
  return "Saved beneficiary";
}

function detailRows(detail: BeneficiaryDetail): Array<{ label: string; value: string }> {
  const destination = detail.destination_json || {};
  const rows = [
    { label: "Phone", value: detail.phone || String(destination.recipient_phone || "") },
    { label: "Email", value: detail.email || String(destination.recipient_email || "") },
    { label: "Merchant", value: String(destination.merchant_name || "") },
    { label: "Account", value: String(destination.recipient_account_number || destination.account_ref || destination.transfer_target || "") },
    { label: "Recipient", value: String(destination.recipient_name || "") },
  ];
  return rows.filter((row) => row.value);
}

export default function BeneficiaryDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<BeneficiaryDetail | null>(null);
  const [groups, setGroups] = useState<BeneficiaryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [detailResponse, groupResponse] = await Promise.all([
        beneficiariesApi.get(id),
        beneficiariesApi.listGroups(),
      ]);
      const beneficiary = detailResponse.beneficiary;
      setDetail(beneficiary);
      setGroups(groupResponse.groups);
      setForm({
        display_name: beneficiary.display_name,
        phone: beneficiary.phone || "",
        email: beneficiary.email || "",
        notes: beneficiary.notes || "",
      });
    } catch (err) {
      setError((err as Error).message || "Unable to load beneficiary.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const infoRows = useMemo(() => (detail ? detailRows(detail) : []), [detail]);

  const save = async () => {
    if (!id || !form.display_name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await beneficiariesApi.update(id, {
        display_name: form.display_name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setEditing(false);
      await load();
    } catch (err) {
      setError((err as Error).message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const archive = async () => {
    if (!id) return;
    setDeleting(true);
    setError("");
    try {
      await beneficiariesApi.delete(id);
      navigate("/beneficiaries");
    } catch (err) {
      setError((err as Error).message || "Unable to archive beneficiary.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[32rem] items-center justify-center rounded-[28px] border border-white/70 bg-white/88 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-200" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
        {error || "Beneficiary not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 sm:px-4">
      <section className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              onClick={() => navigate("/beneficiaries")}
              className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{detailLabel(detail)}</p>
            {editing ? (
              <input
                value={form.display_name}
                onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))}
                className="mt-2 w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-2xl font-semibold text-slate-900 outline-none focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
              />
            ) : (
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {detail.display_name}
              </h1>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      display_name: detail.display_name,
                      phone: detail.phone || "",
                      email: detail.email || "",
                      notes: detail.notes || "",
                    });
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
              >
                <PencilLine size={16} />
                Edit
              </button>
            )}
            <button
              onClick={archive}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-950/35"
            >
              <Trash2 size={16} />
              {deleting ? "Archiving..." : "Archive"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Phone</label>
                {editing ? (
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
                  />
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300">{detail.phone || "—"}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Email</label>
                {editing ? (
                  <input
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
                  />
                ) : (
                  <p className="break-words text-sm text-slate-700 dark:text-slate-300">{detail.email || "—"}</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {infoRows.map((row) => (
                <div key={row.label} className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-950">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{row.label}</p>
                  <p className="mt-2 break-words text-sm text-slate-700 dark:text-slate-300">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Notes</label>
              {editing ? (
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
                />
              ) : (
                <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  {detail.notes || "No notes saved."}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Recent activity</h2>
            {(detail.recent_transactions || []).length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No linked activity yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {(detail.recent_transactions || []).slice(-5).reverse().map((transaction: Record<string, unknown>, index: number) => (
                  <div
                    key={`${transaction.created_at || "tx"}-${index}`}
                    className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {String(transaction.content || "Transaction")}
                    </p>
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      {transaction.created_at ? new Date(String(transaction.created_at)).toLocaleString() : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Groups</h2>
              <div className="relative">
                <button
                  onClick={() => setShowPopover((current) => !current)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Manage
                </button>
                {showPopover ? (
                  <GroupPopover
                    beneficiaryId={id!}
                    selectedGroupIds={(detail.groups || []).map((group) => group.id)}
                    allGroups={groups}
                    onGroupsChanged={load}
                    onClose={() => setShowPopover(false)}
                  />
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(detail.groups || []).length > 0 ? (
                (detail.groups || []).map((group) => (
                  <span
                    key={group.id}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: `${group.color || "#64748b"}18`,
                      color: group.color || "#475569",
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: group.color || "#64748b" }}
                    />
                    {group.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No groups assigned.</p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Schedules</h2>
            {(detail.schedules || []).length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No schedules yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {(detail.schedules || []).map((schedule: BeneficiarySchedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {schedule.currency} {schedule.amount.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {FREQUENCY_LABELS[schedule.frequency] || schedule.frequency}
                    </p>
                    {schedule.next_run_at ? (
                      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                        Next run {new Date(schedule.next_run_at).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
