import { useState } from "react";
import Icon from "./Icon";
import VoiceInterestForm from "./VoiceInterestForm";

export default function ChatInput({
  disabled,
  reconnectFailed,
  accessToken,
  onReconnect,
  onSend,
}: {
  disabled: boolean;
  reconnectFailed?: boolean;
  accessToken: string;
  onReconnect?: () => void;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [showVoiceForm, setShowVoiceForm] = useState(false);
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const showSend = text.trim().length > 0;

  return (
    <div className="mx-3 mb-3 flex items-end gap-1.5 rounded-full border border-black/6 bg-white/96 px-5 py-2 shadow-[0_8px_32px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-gray-800 dark:bg-black/96 dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!text.trim()) return;
            onSend(text.trim());
            setText("");
          }
        }}
        disabled={disabled}
        rows={1}
        style={{ color: text.trim().length > 0 ? (isDark ? "#eef7f5" : "#1f2937") : undefined }}
        className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] text-gray-800 placeholder:text-gray-400 focus:outline-none dark:text-[#eef7f5] dark:placeholder:text-[#8aa7a2]"
        placeholder={
          reconnectFailed
            ? "Disconnected from Clerqe"
            : disabled
              ? "Waiting for connection..."
              : "Message Clerqe..."
        }
      />
      {reconnectFailed ? (
        <button
          onClick={onReconnect}
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7a2f2f] text-white transition-colors hover:bg-[#8f3939] dark:bg-[#6d2929] dark:hover:bg-[#803232]"
          title="Reconnect"
        >
          <Icon name="autorenew" className="text-base" />
        </button>
      ) : (
        <div className="relative">
          <button
            type="button"
            disabled={showSend ? disabled || !text.trim() : disabled}
            onClick={() => {
              if (showSend) {
                onSend(text.trim());
                setText("");
              } else {
                setShowVoiceForm(true);
              }
            }}
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-[0_4px_12px_rgba(15,82,88,0.18)] transition-colors hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 dark:bg-[var(--brand-primary)] dark:text-white dark:shadow-[0_6px_16px_rgba(0,0,0,0.3)] dark:hover:bg-[var(--brand-primary-hover)]"
          >
            <Icon name={showSend ? "arrow_upward" : "mic"} className="text-lg" />
          </button>
          {showVoiceForm && <VoiceInterestForm accessToken={accessToken} onDismiss={() => setShowVoiceForm(false)} />}
        </div>
      )}
    </div>
  );
}
