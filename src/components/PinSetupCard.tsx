import { useState } from "react";
import Icon from "./Icon";

export default function PinSetupCard(props: {
  loading: boolean;
  onSubmit: (pin: string, confirmPin: string) => void;
  onCancel: () => void;
  onClearError: () => void;
}) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const pinsMatch = pin === confirmPin && pin.length > 0;
  const canSubmit = !props.loading && pin.trim().length > 0 && confirmPin.trim().length > 0 && pinsMatch;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        props.onSubmit(pin.trim(), confirmPin.trim());
        setPin("");
        setConfirmPin("");
      }}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Set Your PIN</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Create a secure 4-digit PIN to complete your account setup.</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Create PIN</label>
          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                props.onClearError();
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
              }}
              className="w-full rounded-[3px] border border-white/30 bg-transparent px-4 py-3 pr-10 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-ring)] dark:border-white/15 dark:text-slate-100 dark:placeholder:text-slate-400"
              placeholder="Enter PIN"
              maxLength={4}
              disabled={props.loading}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Icon name={showPin ? "visibility_off" : "visibility"} className="text-base" />
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm PIN</label>
          <input
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            value={confirmPin}
            onChange={(e) => {
              props.onClearError();
              setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4));
            }}
            className={`w-full rounded-[3px] border border-white/30 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-ring)] dark:border-white/15 dark:text-slate-100 dark:placeholder:text-slate-400 ${
              confirmPin.length > 0 && !pinsMatch
                ? "bg-red-50 dark:bg-red-900/20"
                : ""
            }`}
            placeholder="Confirm PIN"
            maxLength={4}
            disabled={props.loading}
          />
          {confirmPin.length > 0 && !pinsMatch && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">PINs do not match</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!canSubmit}
            className="flex-1 rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[var(--brand-primary)] dark:text-white dark:hover:bg-[var(--brand-primary-hover)]"
        >
          {props.loading ? "Saving PIN..." : "Save PIN"}
        </button>
        <button
          type="button"
          disabled={props.loading}
          onClick={props.onCancel}
          className="rounded-[3px] bg-[var(--brand-primary-soft)] px-4 py-3 text-sm font-medium text-[var(--brand-primary)] transition-opacity hover:opacity-80 dark:bg-slate-800 dark:text-slate-300"
        >
          <Icon name="arrow_back" className="text-base" />
        </button>
      </div>
    </form>
  );
}
