import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, Plus, Search, Upload, Users } from "lucide-react";
import { beneficiariesApi } from "../api/beneficiaries";
import AddBeneficiaryModal from "../components/AddBeneficiaryModal";
import GroupPopover from "../components/GroupPopover";
import ImportModal from "../components/ImportModal";
import type { Beneficiary, BeneficiaryGroup } from "../types/beneficiary";

function formatIdentifier(beneficiary: Beneficiary): string {
  if (beneficiary.phone && beneficiary.email) return `${beneficiary.phone} • ${beneficiary.email}`;
  return beneficiary.phone || beneficiary.email || "No contact details saved";
}

function beneficiaryKind(beneficiary: Beneficiary): string {
  const kind = String((beneficiary.destination_json || {}).kind || "").toLowerCase();
  if (kind === "bill_beneficiary") return "Bill payment";
  if (kind === "transfer_recipient") return "Transfer";
  return "Saved";
}

export default function BeneficiaryListPage() {
  const navigate = useNavigate();
  const fabRef = useRef<HTMLDivElement>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [groups, setGroups] = useState<BeneficiaryGroup[]>([]);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [error, setError] = useState("");
  const [popoverTarget, setPopoverTarget] = useState<{ beneficiaryId: string; groupIds: string[] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [beneficiaryResponse, groupResponse] = await Promise.all([
        beneficiariesApi.list(search, filterGroup),
        beneficiariesApi.listGroups(),
      ]);
      setBeneficiaries(beneficiaryResponse.items);
      setGroups(groupResponse.groups);
    } catch (err) {
      setError((err as Error).message || "Unable to load beneficiaries.");
    } finally {
      setLoading(false);
    }
  }, [filterGroup, search]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setShowFab(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupedCount = useMemo(
    () => beneficiaries.filter((item) => (item.groups || []).length > 0).length,
    [beneficiaries],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 sm:px-4">
      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saved beneficiaries</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                {beneficiaries.length}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                People and merchants you can reuse for transfers, payments, and schedules.
              </p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Grouped</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{groupedCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Landmark size={18} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">Groups</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{groups.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/88 p-4 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, phone, or email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] lg:hidden"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        {groups.length > 0 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterGroup("")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                !filterGroup
                  ? "bg-[var(--brand-primary)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              All
            </button>
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setFilterGroup(group.id === filterGroup ? "" : group.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  filterGroup === group.id
                    ? "bg-[var(--brand-primary)] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/88 p-3 shadow-sm dark:border-white/5 dark:bg-[#0a1110]/88 sm:p-4">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-200" />
          </div>
        ) : beneficiaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 px-6 py-20 text-center dark:border-slate-800">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <Users size={26} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">No beneficiaries yet</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Add people or merchants you pay often so future requests can resolve faster.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setShowAdd(true)}
                className="rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
              >
                Add beneficiary
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Import file
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {beneficiaries.map((beneficiary) => (
              <article
                key={beneficiary.id}
                className="relative rounded-[24px] border border-slate-200/70 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-slate-700"
              >
                <button
                  onClick={() => navigate(`/beneficiaries/${beneficiary.id}`)}
                  className="absolute inset-0 rounded-[24px]"
                  aria-label={`Open ${beneficiary.display_name}`}
                />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                          {beneficiary.display_name}
                        </h2>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                          {beneficiaryKind(beneficiary)}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
                        {formatIdentifier(beneficiary)}
                      </p>
                    </div>

                    <div className="relative z-20">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setPopoverTarget(
                            popoverTarget?.beneficiaryId === beneficiary.id
                              ? null
                              : {
                                  beneficiaryId: beneficiary.id,
                                  groupIds: (beneficiary.groups || []).map((group) => group.id),
                                },
                          );
                        }}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {(beneficiary.groups || []).length > 0
                          ? `${beneficiary.groups?.length} group${beneficiary.groups && beneficiary.groups.length > 1 ? "s" : ""}`
                          : "Assign group"}
                      </button>
                      {popoverTarget?.beneficiaryId === beneficiary.id ? (
                        <GroupPopover
                          beneficiaryId={beneficiary.id}
                          selectedGroupIds={(beneficiary.groups || []).map((group) => group.id)}
                          allGroups={groups}
                          onGroupsChanged={load}
                          onClose={() => setPopoverTarget(null)}
                        />
                      ) : null}
                    </div>
                  </div>

                  {beneficiary.notes ? (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {beneficiary.notes}
                    </p>
                  ) : null}

                  {(beneficiary.groups || []).length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(beneficiary.groups || []).map((group) => (
                        <span
                          key={group.id}
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
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
                      ))}
                    </div>
                  ) : null}

                  {beneficiary.next_schedule ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      Next schedule: <strong>{beneficiary.next_schedule.currency} {beneficiary.next_schedule.amount.toLocaleString()}</strong>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div ref={fabRef} className="fixed bottom-[calc(1rem+var(--sab,0px))] right-4 z-30 lg:hidden">
        {showFab ? (
          <div className="mb-3 flex flex-col items-end gap-2">
            <button
              onClick={() => {
                setShowAdd(true);
                setShowFab(false);
              }}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-lg dark:bg-slate-950 dark:text-slate-200"
            >
              Add beneficiary
            </button>
            <button
              onClick={() => {
                setShowImport(true);
                setShowFab(false);
              }}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-lg dark:bg-slate-950 dark:text-slate-200"
            >
              Import file
            </button>
          </div>
        ) : null}
        <button
          onClick={() => setShowFab((value) => !value)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-[0_18px_40px_rgba(15,82,88,0.28)] transition hover:bg-[var(--brand-primary-hover)]"
        >
          <Plus size={22} />
        </button>
      </div>

      {showAdd ? (
        <AddBeneficiaryModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            void load();
          }}
        />
      ) : null}
      {showImport ? (
        <ImportModal
          onClose={() => {
            setShowImport(false);
            void load();
          }}
        />
      ) : null}
    </div>
  );
}
