import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { API_BASE_URL } from "../config/env";
import Icon from "./Icon";

const LANGUAGES = [
  { value: "kenyanese", label: "Kenyanese — street English + Swahili" },
  { value: "kiswahili", label: "Kiswahili" },
  { value: "english", label: "English" },
];

const INDUSTRIES = [
  "Banking & Finance",
  "Microfinance / SACCOs",
  "Mobile Money & Fintech",
  "Agriculture",
  "Retail & E-commerce",
  "Transport & Logistics",
  "Healthcare",
  "Education",
  "Government & Public Sector",
  "Real Estate",
  "Manufacturing",
  "Telecommunications",
  "Other",
];

const USE_CASES = ["Personal", "Business", "Enterprise"];

export default function VoiceInterestForm({
  accessToken,
  onDismiss,
}: {
  accessToken: string;
  onDismiss: () => void;
}) {
  const [language, setLanguage] = useState("");
  const [industry, setIndustry] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyOnList, setAlreadyOnList] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/voice/waitlist/status`, {
          signal: abort.signal,
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.status === 200) {
          const data = await res.json();
          if (data.status === "registered") setAlreadyOnList(true);
        }
      } catch {
      } finally {
        setChecking(false);
      }
    })();
    return () => abort.abort();
  }, [accessToken]);

  const valid = language && industry && useCase;

  const handleSubmit = async () => {
    if (!valid) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/voice/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ language, industry, useCase }),
      });
      if (res.status === 409) {
        setAlreadyOnList(true);
      } else if (!res.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  const showForm = !checking && !submitted && !alreadyOnList;
  const showDone = (submitted || alreadyOnList) && !checking;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/50" onClick={onDismiss}>
      <div
        className="absolute bottom-0 left-0 right-0 mx-auto flex h-[85vh] w-full max-w-xl flex-col rounded-t-[24px] border border-black/6 bg-white shadow-[0_18px_60px_rgba(15,82,88,0.14)] sm:bottom-auto sm:top-1/2 sm:h-[80vh] sm:-translate-y-1/2 sm:rounded-[24px] dark:border-white/8 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto [overscroll-behavior:contain] px-6 pt-7 sm:px-7">
          {checking && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                Checking...
              </div>
            </div>
          )}

          {(submitted || alreadyOnList) && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-primary-soft)] dark:bg-white/8">
                <Icon name="check_circle" className="text-3xl text-[var(--brand-primary)] dark:text-white/75" filled />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {alreadyOnList ? "Already on the list" : "You're on the list"}
              </h2>
              <p className="max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-400">
                {alreadyOnList
                  ? "You're already signed up for voice updates. We'll notify you when it becomes available."
                  : "We'll let you know when voice chat is ready. Thanks for your interest."}
              </p>
            </div>
          )}

          {showForm && (
            <>
              <div className="sticky top-0 z-10 mb-1 flex items-center justify-between bg-white pb-1 dark:bg-slate-900">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Voice chat is coming</h2>
                <button
                  onClick={onDismiss}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <Icon name="close" className="text-lg" />
                </button>
              </div>

              <div className="space-y-5">
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-50">Preferred language</legend>
                  <div className="space-y-2">
                    {LANGUAGES.map((lang) => (
                      <label
                        key={lang.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-sm transition-colors ${
                          language === lang.value
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] dark:border-white/25 dark:bg-slate-800"
                            : "border-black/6 bg-slate-50 dark:border-white/8 dark:bg-slate-800/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="language"
                          value={lang.value}
                          checked={language === lang.value}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="h-4 w-4 text-[var(--brand-primary)] focus:ring-[var(--brand-primary-ring)]"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{lang.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-50">Industry</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map((ind) => (
                      <label
                        key={ind}
                        className={`flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm transition-colors ${
                          industry === ind
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] dark:border-white/25 dark:bg-slate-800"
                            : "border-black/6 bg-slate-50 dark:border-white/8 dark:bg-slate-800/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="industry"
                          value={ind}
                          checked={industry === ind}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="h-4 w-4 shrink-0 text-[var(--brand-primary)] focus:ring-[var(--brand-primary-ring)]"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{ind}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-50">Use case</legend>
                  <div className="flex gap-2">
                    {USE_CASES.map((uc) => (
                      <label
                        key={uc}
                        className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-4 py-3 text-sm transition-colors ${
                          useCase === uc
                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] dark:border-white/25 dark:bg-slate-800"
                            : "border-black/6 bg-slate-50 dark:border-white/8 dark:bg-slate-800/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="useCase"
                          value={uc}
                          checked={useCase === uc}
                          onChange={(e) => setUseCase(e.target.value)}
                          className="h-4 w-4 text-[var(--brand-primary)] focus:ring-[var(--brand-primary-ring)]"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{uc}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </>
          )}
        </div>

        {showForm && (
          <div className="shrink-0 border-t border-black/6 px-6 pb-6 pt-4 dark:border-white/8 sm:px-7">
            <button
              onClick={handleSubmit}
              disabled={!valid || sending}
              className="w-full rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "Sending..." : "Keep me posted"}
            </button>
          </div>
        )}

        {showDone && (
          <div className="shrink-0 border-t border-black/6 px-6 pb-6 pt-4 dark:border-white/8 sm:px-7">
            <button
              onClick={onDismiss}
              className="w-full rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
