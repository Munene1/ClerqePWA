import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

export default function AccountCreationPrompt(props: {
  message: string;
  identifier: string;
  initialFullName?: string;
  onChangeIdentifier: (value: string) => void;
  onContinue: (fullName: string) => void;
  onCancel: () => void;
  loading: boolean;
  onClearError: () => void;
}) {
  const [fullName, setFullName] = useState(props.initialFullName || "");
  const [secondaryContact, setSecondaryContact] = useState("");
  const fullNameTouchedRef = useRef(Boolean(props.initialFullName?.trim()));

  const isEmail = props.identifier.includes("@");

  useEffect(() => {
    if (props.initialFullName && props.initialFullName !== fullName) {
      setFullName(props.initialFullName);
      fullNameTouchedRef.current = true;
    }
  }, [props.initialFullName]);

  useEffect(() => {
    if (fullNameTouchedRef.current) return;
    const emailLikeValue = props.identifier.includes("@") ? props.identifier : secondaryContact;
    if (!emailLikeValue.includes("@")) return;
    const localPart = emailLikeValue.split("@")[0] || "";
    const cleaned = localPart
      .replace(/[0-9]+/g, " ")
      .replace(/[^a-zA-Z\s._-]+/g, " ")
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) return;
    const inferredName = cleaned
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
    if (inferredName && inferredName !== fullName) {
      setFullName(inferredName);
    }
  }, [props.identifier, secondaryContact, fullName]);

  return (
    <form
      className="space-y-5 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        if (props.loading || !fullName.trim() || !secondaryContact.trim()) return;
        props.onContinue(fullName.trim());
      }}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Create Your Account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{props.message}</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {isEmail ? "Email Address" : "Phone Number"}
          </label>
          <input
            value={props.identifier}
            onChange={(e) => {
              props.onClearError();
              props.onChangeIdentifier(e.target.value);
            }}
            type={isEmail ? "email" : "tel"}
            className="w-full rounded-[3px] border border-[color:var(--brand-primary)]/45 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary-ring)] dark:border-[color:var(--brand-primary)]/35 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-[var(--brand-primary)]"
            placeholder={isEmail ? "your@email.com" : "+1234567890"}
            disabled={props.loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {isEmail ? "Phone Number" : "Email Address"}
          </label>
          <input
            value={secondaryContact}
            onChange={(e) => {
              props.onClearError();
              setSecondaryContact(e.target.value);
            }}
            type={isEmail ? "tel" : "email"}
            className="w-full rounded-[3px] border border-[color:var(--brand-primary)]/45 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary-ring)] dark:border-[color:var(--brand-primary)]/35 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-[var(--brand-primary)]"
            placeholder={isEmail ? "+1234567890" : "your@email.com"}
            disabled={props.loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => {
              props.onClearError();
              fullNameTouchedRef.current = true;
              setFullName(e.target.value);
            }}
            className="w-full rounded-[3px] border border-[color:var(--brand-primary)]/45 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary-ring)] dark:border-[color:var(--brand-primary)]/35 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-[var(--brand-primary)]"
            placeholder="John Doe"
            disabled={props.loading}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={props.loading || !fullName.trim() || !secondaryContact.trim()}
          className="flex-1 rounded-[3px] bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[var(--brand-primary)] dark:text-white dark:hover:bg-[var(--brand-primary-hover)]"
        >
          {props.loading ? "Creating account..." : "Create Account"}
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
