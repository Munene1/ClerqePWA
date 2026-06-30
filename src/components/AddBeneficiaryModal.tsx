import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { beneficiariesApi } from "../api/beneficiaries";
import type { BeneficiaryGroup } from "../types/beneficiary";

export default function AddBeneficiaryModal(props: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [groups, setGroups] = useState<BeneficiaryGroup[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    email: "",
    notes: "",
    group_ids: [] as string[],
  });

  useEffect(() => {
    void beneficiariesApi.listGroups().then((response) => setGroups(response.groups)).catch(() => undefined);
  }, []);

  const toggleGroup = (groupId: string) => {
    setForm((current) => ({
      ...current,
      group_ids: current.group_ids.includes(groupId)
        ? current.group_ids.filter((id) => id !== groupId)
        : [...current.group_ids, groupId],
    }));
  };

  const save = async () => {
    if (!form.display_name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await beneficiariesApi.create({
        display_name: form.display_name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
        group_ids: form.group_ids,
      });
      props.onSaved();
    } catch (err) {
      setError((err as Error).message || "Unable to save beneficiary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={props.onClose}
    >
      <div
        className="w-full max-w-2xl rounded-t-[28px] border border-white/70 bg-white p-5 shadow-2xl dark:border-white/5 dark:bg-[#09100f] sm:rounded-[28px] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Add beneficiary</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Save a person or merchant for faster future payments.
            </p>
          </div>
          <button
            onClick={props.onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Name</label>
            <input
              value={form.display_name}
              onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Phone</label>
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
              placeholder="+254..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Email</label>
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Notes</label>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
              placeholder="Optional notes"
            />
          </div>
        </div>

        {groups.length > 0 ? (
          <div className="mt-6">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Groups</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    form.group_ids.includes(group.id)
                      ? "bg-[var(--brand-primary)] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={props.onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save beneficiary"}
          </button>
        </div>
      </div>
    </div>
  );
}
