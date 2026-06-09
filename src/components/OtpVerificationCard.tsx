import { useState } from "react";
import Icon from "./Icon";

export default function OtpVerificationCard(props: {
  title?: string;
  message?: string;
  loading: boolean;
  onVerify: (otp: string) => void;
  onCancel: () => void;
  onClearError: () => void;
}) {
  const [otp, setOtp] = useState("");
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (props.loading || !otp.trim()) return;
        props.onVerify(otp.trim());
        setOtp("");
      }}
    >
      <div className="space-y-1">
        {props.title && (
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{props.title}</h2>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400">{props.message || "Enter the OTP sent to your email."}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Verification Code</label>
        <input
          value={otp}
          onChange={(e) => {
            props.onClearError();
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && otp.trim() && !props.loading) {
              props.onVerify(otp.trim());
              setOtp("");
            }
          }}
          className="w-full rounded-[3px] border border-white/30 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-ring)] dark:border-white/15 dark:text-slate-100 dark:placeholder:text-slate-400"
          placeholder="Enter code"
          inputMode="numeric"
          maxLength={6}
          disabled={props.loading}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={props.loading || !otp.trim()}
          className="flex-1 rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[var(--brand-primary)] dark:text-white dark:hover:bg-[var(--brand-primary-hover)]"
        >
          {props.loading ? "Verifying..." : "Verify"}
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
