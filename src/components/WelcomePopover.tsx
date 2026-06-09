import { useState } from "react";
import ClerqeLogo from "./ClerqeLogo";

export default function WelcomePopover({ onDismiss }: { onDismiss: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in sm:items-center">
      <div className="animate-scale-in flex max-h-[85vh] w-full max-w-xl flex-col rounded-t-[24px] border border-black/6 bg-white shadow-[0_18px_60px_rgba(15,82,88,0.14)] dark:border-white/8 dark:bg-slate-900 sm:rounded-[24px]">
        <div className="no-scrollbar overflow-y-auto px-6 pb-3 pt-7 sm:px-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <ClerqeLogo className="inline-block h-8" />
            <span className="rounded-full bg-[var(--brand-primary-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-primary)] dark:bg-white/8 dark:text-white/75">
              Sandbox Notice
            </span>
          </div>

          <div className="mb-5 space-y-2 text-left">
            <h2 className="text-[24px] font-semibold leading-8 text-slate-900 dark:text-slate-50">
              Hey there, seems like you're new here — welcome to Clerqe
            </h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Please read this, it is important.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
              Clerqe is a conversational banking agent built to make banking simpler and easier to use.
            </p>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
              Our mission is to help more people access banking confidently, especially customers who are underserved by
              complex apps, menus, language barriers, or limited access to support.
            </p>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
              This version of Clerqe is a sandbox chat experience. You can use it to interact with simulated banking
              workflows such as balance checks, transaction searches, transfers, payouts, statements, and service
              requests.
            </p>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
              No real money is moved in this sandbox. No live bank account is connected. No actual banking instruction
              is sent to a financial institution.
            </p>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
              By creating an account, you confirm that you understand this is a sandbox environment and agree to
              Clerqe&apos;s Terms of Use, Privacy Policy, and Sandbox Disclaimer.
            </p>
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-[10px] border border-black/6 bg-slate-50 p-4 text-left dark:border-white/8 dark:bg-slate-800/60">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--brand-primary)]/45 text-[var(--brand-primary)] focus:ring-[var(--brand-primary-ring)] dark:border-white/25 dark:bg-slate-800 dark:text-[var(--brand-primary)]"
            />
            <span className="text-xs leading-6 text-slate-600 dark:text-slate-400">
              I understand that Clerqe is currently a sandbox chat experience. No real money is moved, no live bank
              account is connected, and no actual banking instruction is executed. By creating an account, I agree to
              Clerqe&apos;s Terms of Use, Privacy Policy, and Sandbox Disclaimer.
            </span>
          </label>
        </div>

        <div className="border-t border-black/6 px-6 pb-6 pt-4 dark:border-white/8 sm:px-7">
          <button
            onClick={onDismiss}
            disabled={!checked}
            className="w-full rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {checked ? "Continue to sign up" : "Please confirm to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
