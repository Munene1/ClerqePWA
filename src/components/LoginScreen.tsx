import ClerqeLogo from "./ClerqeLogo";
import AccountCreationPrompt from "./AccountCreationPrompt";
import OtpVerificationCard from "./OtpVerificationCard";
import PinSetupCard from "./PinSetupCard";

export default function LoginScreen(props: {
  identifier: string;
  setIdentifier: (value: string) => void;
  loading: boolean;
  error?: string | null;
  authStep: "identifier" | "signup" | "signup_otp" | "signup_pin";
  authMessage?: string | null;
  fullName?: string;
  setFullName: (value: string) => void;
  rememberedEmail?: string | null;
  onClearRememberedEmail?: () => void;
  onSubmitIdentifier: () => void;
  onConfirmAccountCreation: (fullName: string) => void;
  onSubmitOtp: (otp: string) => void;
  onSubmitPinSetup: (pin: string, confirmPin: string) => void;
  onCancelFlow: () => void;
  onClearError: () => void;
}) {
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
            onClick={() => { props.setIdentifier(props.rememberedEmail!); props.onSubmitIdentifier(); }}
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
            props.onSubmitIdentifier();
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

      {props.authStep === "signup_pin" && (
        <div key="pin" className="animate-fade-slide-in">
          <PinSetupCard loading={props.loading} onSubmit={props.onSubmitPinSetup} onCancel={props.onCancelFlow} onClearError={props.onClearError} />
        </div>
      )}
    </div>
  );

  return (
    <div className="relative flex min-h-dvh flex-col overflow-y-auto bg-white dark:bg-black">
      <div className="relative flex grow flex-col items-center justify-center px-6 pb-[calc(1rem+var(--sab,0px))] pt-[calc(1.5rem+var(--sat,0px))]">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
          <ClerqeLogo className={`mb-6 inline-block h-24 transition-all duration-500 ${props.loading ? "scale-95 opacity-70" : ""}`} />
          {form}
        </div>
      </div>
    </div>
  );
}
