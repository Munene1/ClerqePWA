import { useState } from "react";
import type { ChatMessage } from "../types/chat";
import { formatTime } from "../utils/formatTime";
import Icon from "./Icon";
import MarkdownRenderer from "./MarkdownRenderer";

function maskText(text: string): string {
  return text.replace(/./g, (c) => (/\d/.test(c) ? "*" : c)).slice(0, -1) + text.slice(-1);
}

export default function MessageBubble({
  message,
  showTimestamp = true,
  masked = false,
}: {
  message: Extract<ChatMessage, { kind: "user" | "assistant" | "assistant_pending" | "error" }>;
  showTimestamp?: boolean;
  masked?: boolean;
}) {
  const [unmasked, setUnmasked] = useState(false);
  const [copied, setCopied] = useState(false);
  const mine = message.kind === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silent
    }
  };
  const bubbleClass =
    message.kind === "error"
      ? "rounded-[4px] border border-black/6 bg-black/[0.035] px-3.5 py-2.5 text-gray-600 dark:border-white/8 dark:bg-white/[0.035] dark:text-gray-300"
      : mine
        ? "rounded-[6px] bg-[#43B5A5] px-2.5 py-[7px] text-white dark:bg-[#3AA594] dark:text-white"
        : "bg-transparent text-gray-800 dark:text-gray-100";
  const label = mine ? "You" : "Clerqe";
  const displayText = masked && !unmasked ? maskText(message.text) : message.text;
  return (
    <div className={`chat-entry flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col gap-0.5 ${mine ? "max-w-[88%]" : "w-full"}`}>
        {showTimestamp && (
          <div className={`flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 ${mine ? "justify-end pr-0.5" : "justify-start"}`}>
            <span className="font-medium text-gray-500 dark:text-gray-400">{label}</span>
            <span>{formatTime(message.createdAt)}</span>
            {message.kind !== "assistant_pending" && message.kind !== "error" && (
              <button
                onClick={handleCopy}
                className="rounded-[3px] p-0.5 text-gray-500 opacity-75 transition-colors hover:bg-black/5 hover:text-gray-700 hover:opacity-100 dark:text-gray-400 dark:opacity-80 dark:hover:bg-white/8 dark:hover:text-gray-200 dark:hover:opacity-100"
                aria-label="Copy message"
              >
                <Icon name={copied ? "check" : "content_copy"} className="text-xs" />
              </button>
            )}
          </div>
        )}
        <div className={`flex ${mine ? "justify-end" : ""} items-center gap-2`}>
          {mine && masked && (
            <button
              onClick={() => setUnmasked((prev) => !prev)}
              className="shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label={unmasked ? "Mask PIN" : "Reveal PIN"}
            >
              <Icon name={unmasked ? "visibility_off" : "visibility"} className="text-base" />
            </button>
          )}
          <div className={bubbleClass}>
            {message.kind === "assistant_pending" ? (
              <div className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-gray-600 dark:border-t-gray-200" />
                <p className="whitespace-pre-wrap text-[15px] leading-6 text-gray-500 dark:text-gray-300">{message.text}</p>
              </div>
            ) : (
              <MarkdownRenderer content={displayText} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
