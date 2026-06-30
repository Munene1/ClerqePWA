import { useCallback, useMemo, useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { beneficiariesApi } from "../api/beneficiaries";
import type { ImportPayload } from "../types/beneficiary";

type Step = "upload" | "mapping" | "preview" | "result";

const FIELD_LABELS: Record<string, string> = {
  display_name: "Name",
  phone: "Phone",
  email: "Email",
  notes: "Notes",
  groups: "Groups",
};

export default function ImportModal(props: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ created: number; skipped: number; errors: { name: string; error: string }[] } | null>(null);

  const autoMap = (nextColumns: string[]) => {
    const normalized = nextColumns.map((column) => column.toLowerCase().replace(/[\s_-]/g, ""));
    const nextMapping: Record<string, string> = {};
    for (const field of Object.keys(FIELD_LABELS)) {
      const target = field.replace(/[\s_-]/g, "");
      const index = normalized.findIndex((column) => column === target);
      if (index >= 0) nextMapping[field] = nextColumns[index];
    }
    setMapping(nextMapping);
  };

  const parseFile = useCallback((file: File) => {
    setError("");
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (response) => {
          const data = response.data as Record<string, string>[];
          if (!data.length) {
            setError("The file is empty.");
            return;
          }
          const nextColumns = Object.keys(data[0]);
          setColumns(nextColumns);
          setRows(data.slice(0, 200));
          autoMap(nextColumns);
          setStep("mapping");
        },
      });
      return;
    }

    if (extension === "xlsx" || extension === "xls") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const workbook = XLSX.read(event.target?.result, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const table = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 }) as string[][];
        if (table.length < 2) {
          setError("The file is empty.");
          return;
        }
        const nextColumns = (table[0] || []).map((value) => String(value || "").trim());
        const nextRows = table.slice(1, 201).map((row) => {
          const item: Record<string, string> = {};
          nextColumns.forEach((column, index) => {
            item[column] = String(row[index] || "");
          });
          return item;
        });
        setColumns(nextColumns);
        setRows(nextRows);
        autoMap(nextColumns);
        setStep("mapping");
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    setError("Use a CSV or Excel file.");
  }, []);

  const previewRows = useMemo(() => {
    return rows
      .map((row) => {
        const payload: ImportPayload = { display_name: "" };
        for (const [field, column] of Object.entries(mapping)) {
          const value = (row[column] || "").trim();
          if (!value) continue;
          if (field === "display_name") payload.display_name = value;
          if (field === "phone") payload.phone = value;
          if (field === "email") payload.email = value;
          if (field === "notes") payload.notes = value;
          if (field === "groups") payload.groups = value.split(",").map((item) => item.trim()).filter(Boolean);
        }
        return payload;
      })
      .filter((row) => row.display_name);
  }, [mapping, rows]);

  const submitImport = async () => {
    setImporting(true);
    setError("");
    try {
      const response = await beneficiariesApi.importBeneficiaries(previewRows as unknown as Record<string, unknown>[]);
      setResult(response);
      setStep("result");
    } catch (err) {
      setError((err as Error).message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={props.onClose}
    >
      <div
        className="w-full max-w-4xl rounded-t-[28px] border border-white/70 bg-white p-5 shadow-2xl dark:border-white/5 dark:bg-[#09100f] sm:rounded-[28px] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Import beneficiaries</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Upload a CSV or Excel file, map the columns, then review before import.
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

        {step === "upload" ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 flex w-full flex-col items-center gap-4 rounded-[28px] border-2 border-dashed border-slate-200 px-6 py-16 text-center transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] dark:border-slate-800 dark:hover:bg-white/5"
          >
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <FileUp size={28} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">Choose a CSV or Excel file</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Supported formats: CSV, XLSX, XLS</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) parseFile(file);
              }}
            />
          </button>
        ) : null}

        {step === "mapping" ? (
          <div className="mt-6">
            <div className="grid gap-3 md:grid-cols-2">
              {Object.keys(FIELD_LABELS).map((field) => (
                <div key={field} className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                    {FIELD_LABELS[field]}
                  </label>
                  <select
                    value={mapping[field] || ""}
                    onChange={(event) => setMapping((current) => ({ ...current, [field]: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:bg-slate-900"
                  >
                    <option value="">Skip</option>
                    {columns.map((column) => (
                      <option key={column} value={column}>{column}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-500">#</th>
                      {Object.values(mapping).filter(Boolean).map((column) => (
                        <th key={column} className="px-4 py-3 font-medium text-slate-500">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-t border-slate-200 dark:border-slate-800">
                        <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                        {Object.values(mapping).filter(Boolean).map((column) => (
                          <td key={`${column}-${index}`} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {row[column] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setStep("upload")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Back
              </button>
              <button
                onClick={() => setStep("preview")}
                className="rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
              >
                Review import
              </button>
            </div>
          </div>
        ) : null}

        {step === "preview" ? (
          <div className="mt-6">
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              Ready to import <strong>{previewRows.length}</strong> beneficiaries.
            </div>

            <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-800">
              <div className="max-h-[22rem] overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Phone</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Email</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Groups</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.slice(0, 20).map((row, index) => (
                      <tr key={`${row.display_name}-${index}`} className="border-t border-slate-200 dark:border-slate-800">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{row.display_name}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.phone || "—"}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.email || "—"}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.groups?.join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setStep("mapping")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Back
              </button>
              <button
                onClick={() => void submitImport()}
                disabled={importing || previewRows.length === 0}
                className="rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
              >
                {importing ? "Importing..." : `Import ${previewRows.length}`}
              </button>
            </div>
          </div>
        ) : null}

        {step === "result" && result ? (
          <div className="mt-6">
            <div className="rounded-[24px] bg-emerald-50 px-5 py-5 text-center dark:bg-emerald-950/30">
              <p className="text-3xl font-semibold text-emerald-700 dark:text-emerald-300">{result.created}</p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">beneficiaries imported</p>
              {result.skipped > 0 ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{result.skipped} skipped</p>
              ) : null}
            </div>

            {result.errors.length > 0 ? (
              <div className="mt-4 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                {result.errors.map((item, index) => (
                  <p key={`${item.name}-${index}`}>{item.name || "Row"}: {item.error}</p>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <button
                onClick={props.onClose}
                className="rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-hover)]"
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
