import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { beneficiariesApi } from "../api/beneficiaries";
import Icon from "../components/Icon";
import { useCachedList } from "../hooks/useCachedList";
import type { BeneficiaryGroup, BeneficiaryListItem } from "../types/beneficiary";

function parseCSV(text: string): { display_name: string; phone?: string; email?: string }[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const nameIdx = header.findIndex((h) => h.includes("name"));
  const phoneIdx = header.findIndex((h) => h.includes("phone") || h.includes("mobile") || h.includes("tel"));
  const emailIdx = header.findIndex((h) => h.includes("email") || h.includes("mail"));
  if (nameIdx === -1) return [];
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    return {
      display_name: cols[nameIdx] || "",
      phone: phoneIdx >= 0 ? cols[phoneIdx] || undefined : undefined,
      email: emailIdx >= 0 ? cols[emailIdx] || undefined : undefined,
    };
  }).filter((b) => b.display_name);
}

function BeneficiaryRow({ b, onSelect, selected }: { b: BeneficiaryListItem; onSelect: () => void; selected?: boolean }) {
  const groups = b.groups || [];
  const visibleGroups = groups.slice(0, 2);
  const overflowCount = groups.length - visibleGroups.length;
  const initial = (b.display_name || "?").charAt(0).toUpperCase();
  const dest = b.destination_json || {};
  const destPhone = dest.recipient_phone as string | undefined;
  const destAccount = (dest.recipient_account_number || dest.account_ref) as string | undefined;
  const destEmail = dest.recipient_email as string | undefined;
  const subtitle = b.phone || destPhone || destAccount || b.email || destEmail || null;
  return (
    <button onClick={onSelect} className={`flex w-full items-center gap-3 border-b border-gray-100/50 px-1 py-1 text-left transition-colors dark:border-gray-800/50 ${selected ? "bg-gray-50 dark:bg-gray-900" : ""}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary-soft)] text-sm font-semibold text-[var(--brand-primary)] dark:bg-[#0f2623] dark:text-white">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900 dark:text-gray-100">{b.display_name.length > 20 ? `${b.display_name.slice(0, 20)}…` : b.display_name}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {groups.length > 0 && (
        <div className="flex shrink-0 items-center gap-1">
          {visibleGroups.map((g) => (
            <span key={g.id} className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {g.name}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-gray-700 dark:text-gray-500">
              +{overflowCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

export default function BeneficiaryListPage({ accessToken, onSelect, selectedId }: { accessToken: string; onSelect?: (id: string) => void; selectedId?: string | null }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryListItem[]>([]);
  const [groups, setGroups] = useState<BeneficiaryGroup[]>([]);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [groupFilterOpen, setGroupFilterOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const groupFilterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { root: container, rootMargin: "-1px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const fetcher = useCallback(async () => {
    const [listData, allGroups] = await Promise.all([
      beneficiariesApi.list(accessToken, {
        q: search || undefined,
        group_id: groupFilter || undefined,
        limit: 500,
      }),
      beneficiariesApi.listGroups(accessToken),
    ]);
    return { items: listData.items, groups: allGroups };
  }, [accessToken, search, groupFilter]);

  const cacheKey = `beneficiaries:${accessToken}:${search}:${groupFilter}`;
  const { data: listData, loading, refresh } = useCachedList(cacheKey, fetcher);

  useEffect(() => {
    if (listData) {
      setBeneficiaries(listData.items);
      setGroups(listData.groups);
    }
  }, [listData]);

  useEffect(() => {
    if (!groupFilterOpen) return;
    const handler = (e: MouseEvent) => {
      if (groupFilterRef.current && !groupFilterRef.current.contains(e.target as Node)) {
        setGroupFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [groupFilterOpen]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(reader.result as string);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const rows = parseCSV(csvText);
    if (rows.length === 0) return;
    setImportResult(null);
    try {
      const result = await beneficiariesApi.importCSV(accessToken, rows);
      setImportResult(result);
      if (result.errors.length === 0) {
        setCsvText("");
        setImportOpen(false);
        refresh();
      }
    } catch {
      setImportResult({ imported: 0, errors: ["Import failed. Check your data and try again."] });
    }
  };

  const filtered = beneficiaries;

  return (
    <div ref={containerRef} className="flex h-screen h-dvh flex-col overflow-y-auto no-scrollbar bg-white dark:bg-[#080808]">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-[#080808]">
        <div className="flex items-center gap-1.5 px-1 pt-[calc(0.75rem+var(--sat,0px))] h-11">
          <button
            onClick={() => navigate("/")}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:bg-gray-200 md:hidden dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:active:bg-gray-700"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1
            className={`truncate text-base font-bold text-gray-900 transition-opacity duration-300 ease-out dark:text-gray-100 ${collapsed ? "opacity-100" : "opacity-0"}`}
          >
            People
          </h1>
          <div className={`ml-auto overflow-hidden transition-all duration-300 ease-out ${collapsed ? "w-8 opacity-100" : "w-0 opacity-0"}`}>
            <button
              onClick={() => sentinelRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="flex h-8 w-8 items-center justify-center"
            >
              <Icon name="search" className="text-sm text-gray-400" />
            </button>
          </div>
        </div>

        <div className={`grid transition-all duration-300 ease-out ${collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
          <div className="min-h-0 overflow-hidden">
            <h1 className="px-1 pb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              People ({filtered.length})
            </h1>
          </div>
        </div>

        <div className={`grid transition-all duration-300 ease-out ${collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
          <div className="min-h-0 overflow-hidden">
            <div className="flex items-center gap-2 px-1 pb-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gray-400 dark:border-gray-600 dark:bg-[#111] dark:text-gray-200 dark:focus:border-gray-500"
              />
              <div ref={groupFilterRef} className="relative shrink-0">
                <button
                  onClick={() => setGroupFilterOpen((p) => !p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    groupFilter
                      ? "bg-[var(--brand-primary)] text-white"
                      : "border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-300"
                  }`}
                  aria-label="Filter by group"
                >
                  <Icon name="filter" className="text-sm" />
                </button>
                {groupFilterOpen && (
                  <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#1a1a1a]">
                    <button
                      onClick={() => { setGroupFilter(""); setGroupFilterOpen(false); }}
                      className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors ${
                        !groupFilter
                          ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon name={!groupFilter ? "check" : ""} className="mr-2 w-4 text-xs" />
                      All groups
                    </button>
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => { setGroupFilter(g.id); setGroupFilterOpen(false); }}
                        className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors ${
                          groupFilter === g.id
                            ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                            : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon name={groupFilter === g.id ? "check" : ""} className="mr-2 w-4 text-xs" />
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setImportOpen(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-600 active:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-300 dark:active:bg-gray-800"
                aria-label="Import CSV"
              >
                <Icon name="plus" className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={sentinelRef} className="h-px" />

      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-gray-400 dark:text-gray-500">{search || groupFilter ? "No matching people" : "No people yet"}</p>
            {!search && !groupFilter && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Import a CSV file to get started.</p>
            )}
          </div>
        ) : (
          <>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((b) => (
                  <BeneficiaryRow
                    key={b.id}
                    b={b}
                    selected={b.id === selectedId}
                    onSelect={() => { onSelect ? onSelect(b.id) : navigate(`/beneficiaries/${b.id}`); }}
                  />
                ))}
              </div>
          </>
        )}
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => { setImportOpen(false); setImportResult(null); }}>
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#111]" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Import People</h2>

            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="mb-3 block w-full text-sm text-gray-500 file:mr-3 file:rounded file:border file:border-gray-300 file:bg-white file:px-3 file:py-1 file:text-sm file:text-gray-700 dark:text-gray-400 dark:file:border-gray-600 dark:file:bg-[#1a1a1a] dark:file:text-gray-300" />

            <textarea
              value={csvText}
              onChange={(e) => { setCsvText(e.target.value); setImportResult(null); }}
              placeholder="Or paste CSV here (name, phone, email)..."
              rows={5}
              className="mb-3 w-full resize-none rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-600 dark:bg-[#111] dark:text-gray-200 dark:focus:border-gray-500"
            />

            {importResult && (
              <div className="mb-3 rounded border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-[#1a1a1a]">
                <p className="font-medium text-gray-900 dark:text-gray-100">{importResult.imported} imported</p>
                {importResult.errors.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-xs text-red-500">
                    {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setImportOpen(false); setImportResult(null); }}
                className="flex-1 rounded border border-gray-300 bg-white py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!csvText.trim() || parseCSV(csvText).length === 0}
                className="flex-1 rounded border border-gray-300 bg-white py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:bg-[#1a1a1a] dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
