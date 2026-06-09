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
  onSubmitIdentifier: () => void;
  onConfirmAccountCreation: (fullName: string) => void;
  onSubmitOtp: (otp: string) => void;
  onSubmitPinSetup: (pin: string, confirmPin: string) => void;
  onCancelFlow: () => void;
  onClearError: () => void;
}) {

  const form = (
    <div className="w-full max-w-sm text-left">
      {props.authStep === "identifier" && (
        <form
          className="space-y-5"
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
            className="w-full rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[var(--brand-primary)] dark:text-white dark:hover:bg-[var(--brand-primary-hover)]"
          >
            {props.loading ? "Signing in..." : "Continue"}
          </button>

          {props.error && (
            <div className="rounded-[3px] border border-slate-900/8 bg-white/12 px-3 py-2.5 text-left text-[13px] leading-5 text-slate-700 backdrop-blur-[1px] dark:border-white/8 dark:bg-white/5 dark:text-slate-300">
              {props.error}
            </div>
          )}
        </form>
      )}

      {props.authStep === "signup" && (
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
      )}

      {props.authStep === "signup_otp" && (
        <OtpVerificationCard
          title="Verify account"
          message={props.authMessage || "Enter the OTP sent to your email."}
          loading={props.loading}
          onVerify={props.onSubmitOtp}
          onCancel={props.onCancelFlow}
          onClearError={props.onClearError}
        />
      )}

      {props.authStep === "signup_pin" && (
        <PinSetupCard loading={props.loading} onSubmit={props.onSubmitPinSetup} onCancel={props.onCancelFlow} onClearError={props.onClearError} />
      )}
    </div>
  );

  return (
    <div className="relative flex min-h-dvh flex-col overflow-y-auto bg-[linear-gradient(180deg,_#ffffff_0%,_#eef5f5_20%,_#c6dddd_48%,_#6e9fa1_74%,_#1c666c_90%,_#0f5258_100%)] dark:bg-[linear-gradient(180deg,_#020907_0%,_#051412_34%,_#0a211e_68%,_#102f2b_100%)]">
      <div className="pointer-events-none fixed right-[-4rem] top-[-2rem] h-96 w-96 rounded-full bg-[#77b3b3]/16 blur-3xl dark:bg-[#3a6763]/12" />
      <div className="pointer-events-none fixed bottom-[-5rem] left-[18%] h-80 w-80 rounded-full bg-white/22 blur-3xl dark:bg-[#0f2a27]/18" />
      <div className="relative flex grow flex-col items-center justify-center px-6 pb-[calc(1rem+var(--sab,0px))] pt-[calc(1.5rem+var(--sat,0px))]">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
          <ClerqeLogo className="mb-6 inline-block h-12" />
          {form}
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-sm px-6 pb-8 text-center">
        <p className="text-sm font-medium leading-relaxed text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)] dark:text-white/90">
          Banking, but you can actually just{" "}
          <em className="not-italic font-semibold text-white">talk</em>{" "}
          to it. No forms, no phone trees, no tapping through a dozen menus just to pay a bill.
        </p>
        <a
          href="/introducing-clerqe"
          className="mt-2 inline-block text-sm font-semibold text-white underline decoration-white/45 underline-offset-4 transition-colors hover:text-white hover:decoration-white dark:text-white/90 dark:decoration-white/40 dark:hover:text-white dark:hover:decoration-white"
        >
          Read the full story &rarr;
        </a>
      </div>
    </div>
  );
}
