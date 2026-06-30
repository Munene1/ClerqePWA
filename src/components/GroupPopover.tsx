import { useEffect, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { beneficiariesApi } from "../api/beneficiaries";
import type { BeneficiaryGroup } from "../types/beneficiary";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#EF4444",
  "#84CC16",
  "#A855F7",
];

export default function GroupPopover(props: {
  beneficiaryId: string;
  selectedGroupIds: string[];
  allGroups: BeneficiaryGroup[];
  onGroupsChanged: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(props.selectedGroupIds);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        props.onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [props.onClose]);

  const toggle = async (groupId: string) => {
    setSaving(true);
    try {
      const isSelected = selected.includes(groupId);
      if (isSelected) {
        await beneficiariesApi.unassignGroup(props.beneficiaryId, groupId);
        setSelected((current) => current.filter((id) => id !== groupId));
      } else {
        await beneficiariesApi.assignGroup(props.beneficiaryId, groupId);
        setSelected((current) => [...current, groupId]);
      }
      props.onGroupsChanged();
    } finally {
      setSaving(false);
    }
  };

  const createAndAssign = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const response = await beneficiariesApi.createGroup({
        name: newName.trim(),
        color: newColor,
      });
      const created = response.group as unknown as BeneficiaryGroup;
      await beneficiariesApi.assignGroup(props.beneficiaryId, created.id);
      setSelected((current) => [...current, created.id]);
      setCreating(false);
      setNewName("");
      props.onGroupsChanged();
    } finally {
      setSaving(false);
    }
  };

  const filteredGroups = props.allGroups.filter((group) =>
    !search || group.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-[19rem] rounded-[24px] border border-white/70 bg-white p-4 shadow-2xl dark:border-white/5 dark:bg-[#09100f]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Groups</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Organize this beneficiary.</p>
        </div>
        <button
          onClick={props.onClose}
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
        >
          <X size={14} />
        </button>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search groups"
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
      />

      <div className="mt-3 max-h-56 space-y-1 overflow-y-auto">
        {filteredGroups.map((group) => (
          <button
            key={group.id}
            onClick={() => void toggle(group.id)}
            disabled={saving}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60 dark:hover:bg-slate-900"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: group.color || "#64748b" }}
            />
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{group.name}</span>
            {selected.includes(group.id) ? <Check size={16} className="text-emerald-500" /> : null}
          </button>
        ))}
      </div>

      {creating ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="New group name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-primary)] dark:border-slate-800 dark:bg-[#0f1716] dark:text-slate-50"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  newColor === color ? "border-slate-900 dark:border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setCreating(false)}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0f1716] dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={() => void createAndAssign()}
              disabled={saving}
              className="flex-1 rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary-soft)]"
        >
          <Plus size={15} />
          Create group
        </button>
      )}
    </div>
  );
}
