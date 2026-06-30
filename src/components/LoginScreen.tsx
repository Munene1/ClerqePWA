import { useNavigate } from "react-router-dom";
import ClerqeLogo from "./ClerqeLogo";
import AccountCreationPrompt from "./AccountCreationPrompt";
import OtpVerificationCard from "./OtpVerificationCard";

export default function LoginScreen(props: {
  identifier: string;
  setIdentifier: (value: string) => void;
  loading: boolean;
  error?: string | null;
  authStep: "identifier" | "signup" | "signup_otp";
  authMessage?: string | null;
  fullName?: string;
  setFullName: (value: string) => void;
  rememberedEmail?: string | null;
  onClearRememberedEmail?: () => void;
  onSubmitIdentifier: (email?: string) => void;
  onConfirmAccountCreation: (fullName: string) => void;
  onSubmitOtp: (otp: string) => void;
  onCancelFlow: () => void;
  onClearError: () => void;
}) {
  const navigate = useNavigate();
  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name[0]}***@${domain}`;
  };

  const fieldset = (
    <>
      {props.rememberedEmail && props.authStep === "identifier" ? (
        <div key="remembered" className="animate-fade-slide-in space-y-5">
          <div className="rounded-[8px] border border-gray-200 bg-white/80 p-4 text-center dark:border-gray-700 dark:bg-white/5">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-300" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{maskEmail(props.rememberedEmail)}</p>
            <button
              type="button"
              onClick={() => { props.onClearRememberedEmail?.(); props.onClearError(); }}
              className="mt-1 text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
            >
              Not you?
            </button>
          </div>

          <button
            onClick={() => { props.onSubmitIdentifier(props.rememberedEmail!); }}
            disabled={props.loading}
            className="flex w-full items-center justify-center gap-2 rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {props.loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {props.loading ? "Signing in..." : "Continue"}
          </button>
        </div>
      ) : props.authStep === "identifier" ? (
        <form
          key="identifier"
          className="animate-fade-slide-in space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (props.loading || !props.identifier.trim()) return;
             props.onSubmitIdentifier(props.identifier);
          }}
        >
          <div>
            <input
              type="email"
              autoFocus
              className="w-full rounded-[3px] border border-[color:var(--brand-primary)]/45 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary-ring)] dark:border-[color:var(--brand-primary)]/35 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-[var(--brand-primary)]"
              placeholder="Enter your email address"
              value={props.identifier}
              onChange={(e) => {
                props.onClearError();
                props.setIdentifier(e.target.value);
              }}
              disabled={props.loading}
            />
          </div>

          <button
            type="submit"
            disabled={props.loading || !props.identifier.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {props.loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {props.loading ? "Signing in..." : "Continue"}
          </button>

          {props.error && (
            <div className="rounded-[3px] border border-slate-900/8 bg-white/12 px-3 py-2.5 text-left text-[13px] leading-5 text-slate-700 backdrop-blur-[1px] animate-fade-in dark:border-white/8 dark:bg-white/5 dark:text-slate-300">
              {props.error}
            </div>
          )}
        </form>
      ) : null}
    </>
  );

  const form = (
    <div className="w-full max-w-sm text-left">
      {fieldset}

      {props.authStep === "signup" && (
        <div key="signup" className="animate-fade-slide-in">
          <AccountCreationPrompt
          message={props.authMessage || "No account found for that identifier."}
          identifier={props.identifier}
          initialFullName={props.fullName}
          onChangeIdentifier={props.setIdentifier}
          loading={props.loading}
          onContinue={props.onConfirmAccountCreation}
          onCancel={props.onCancelFlow}
          onClearError={props.onClearError}
        />
        </div>
      )}

      {props.authStep === "signup_otp" && (
        <div key="otp" className="animate-fade-slide-in">
          <OtpVerificationCard
          title="Verify account"
          message={props.authMessage || "Enter the OTP sent to your email."}
          loading={props.loading}
          onVerify={props.onSubmitOtp}
          onCancel={props.onCancelFlow}
          onClearError={props.onClearError}
        />
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(15,82,88,0.12),_transparent_35%),linear-gradient(180deg,#fbfdfd_0%,#f3f6f6_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(20,60,57,0.4),_transparent_30%),linear-gradient(180deg,#050908_0%,#020907_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/55 to-transparent dark:from-white/[0.03]" />
      <div className="flex grow flex-col items-center justify-center px-6 pt-[calc(1.5rem+var(--sat,0px))]">
        <div className="w-full max-w-md rounded-[32px] border border-white/80 bg-white/90 p-6 text-left shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/5 dark:bg-[#09100f]/88 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <ClerqeLogo className={`inline-block h-24 transition-all duration-500 ${props.loading ? "scale-95 opacity-70" : ""}`} />
            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Secure conversational banking, starting with your email.
            </p>
          </div>
          {form}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2.5 pb-[calc(1rem+var(--sab,0px))] pt-3">
        {props.authStep === "identifier" && (
          <button
            onClick={() => navigate("/introducing-clerqe")}
            className="group flex items-center gap-1 text-xs text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline dark:text-gray-300 dark:hover:text-gray-100"
          >
            Read the story
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
        <div className="flex flex-col items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <span>We are powered by</span>
          <img src="/nvidia-inception-logo-dark-text-transparentbg.png" alt="NVIDIA" className="h-16 block dark:hidden" />
          <img src="/NVIDIA_Inception_dark-bg-white-text.jpg" alt="NVIDIA" className="h-16 hidden dark:block" />
        </div>
      </div>
    </div>
  );
}
