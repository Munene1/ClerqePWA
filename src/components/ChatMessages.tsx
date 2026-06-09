import React, { useLayoutEffect, useRef } from "react";
import type { ChatMessage } from "../types/chat";
import EmptyState from "./EmptyState";
import MessageBubble from "./MessageBubble";

const MESSAGE_TIME_BREAK_MS = 5 * 60 * 1000;

function getDateKey(dateStr: string): string {
  return dateStr.slice(0, 10);
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (getDateKey(dateStr) === getDateKey(today.toISOString())) return "Today";
  if (getDateKey(dateStr) === getDateKey(yesterday.toISOString())) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const getMessageSide = (message: ChatMessage) => {
  if (message.kind === "user") return "user";
  return "assistant";
};

function isSensitiveInput(text: string, previousMessage: ChatMessage | null): boolean {
  if (typeof text !== "string") return false;
  const digitsOnly = text.replace(/\D/g, "");
  if (digitsOnly.length !== text.length || digitsOnly.length < 4 || digitsOnly.length > 6) return false;
  const prevText = previousMessage && (previousMessage.kind === "assistant" || previousMessage.kind === "assistant_pending" || previousMessage.kind === "error")
    ? previousMessage.text.toLowerCase()
    : "";
  return prevText.includes("pin") || prevText.includes("otp") || prevText.includes("code") || prevText.includes("verification");
}

export default function ChatMessages(props: {
  messages: ChatMessage[];
  loadingHistory: boolean;
  historyMessageCount: number;
  liveMessageCount: number;
  activeStatus: string | null;
  hasActiveRun: boolean;
  hasOlderHistory: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const previousHistoryCountRef = useRef(0);
  const previousLiveCountRef = useRef(0);
  const preserveScrollRef = useRef(false);
  const preservedScrollHeightRef = useRef(0);

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const totalMessages = props.messages.length;
    const historyIncreased = props.historyMessageCount > previousHistoryCountRef.current;
    const liveIncreased = props.liveMessageCount > previousLiveCountRef.current;

    if (preserveScrollRef.current && historyIncreased) {
      const nextHeight = scroller.scrollHeight;
      scroller.scrollTop += nextHeight - preservedScrollHeightRef.current;
      preserveScrollRef.current = false;
    } else if (totalMessages > 0 && (previousHistoryCountRef.current === 0 || liveIncreased)) {
      bottomRef.current?.scrollIntoView({ behavior: previousHistoryCountRef.current === 0 ? "auto" : "smooth" });
    }

    previousHistoryCountRef.current = props.historyMessageCount;
    previousLiveCountRef.current = props.liveMessageCount;
  }, [props.historyMessageCount, props.liveMessageCount, props.messages.length]);

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    if (!props.hasOlderHistory || props.loadingOlder) return;
    if (props.messages.length === 0) return;
    if (scroller.scrollHeight <= scroller.clientHeight + 24) {
      props.onLoadOlder();
    }
  }, [props.hasOlderHistory, props.loadingOlder, props.messages.length, props.historyMessageCount, props.onLoadOlder]);

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar flex-1 overflow-y-auto px-5 py-6"
      onScroll={(e) => {
        const top = e.currentTarget.scrollTop;
        lastScrollTopRef.current = top;
        if (top < 80 && props.hasOlderHistory && !props.loadingOlder) {
          preserveScrollRef.current = true;
          preservedScrollHeightRef.current = e.currentTarget.scrollHeight;
          props.onLoadOlder();
        }
        lastScrollTopRef.current = top;
      }}
    >
      <div className="space-y-4">
        {props.messages.length === 0 && !props.loadingHistory && <EmptyState />}
        {props.messages.length === 0 && props.loadingHistory && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-gray-600 dark:border-t-gray-200" />
              Loading conversation...
            </div>
          </div>
        )}
        {(() => {
          let lastDateKey = "";
          return props.messages.map((message, index) => {
            if (message.kind === "user" || message.kind === "assistant" || message.kind === "assistant_pending" || message.kind === "error") {
              const currentDateKey = getDateKey(message.createdAt);
              const showDateDivider = currentDateKey !== lastDateKey;
              if (showDateDivider) lastDateKey = currentDateKey;
              const previous = index > 0 ? props.messages[index - 1] : null;
              const side = getMessageSide(message);
              const previousSide = previous ? getMessageSide(previous) : null;
              const currentTime = new Date(message.createdAt).getTime();
              const previousTime = previous ? new Date(previous.createdAt).getTime() : Number.NaN;
              const separatedByTime =
                !previous ||
                Number.isNaN(currentTime) ||
                Number.isNaN(previousTime) ||
                currentTime - previousTime >= MESSAGE_TIME_BREAK_MS;
              const showTimestamp = !previous || previousSide !== side || separatedByTime;
              const masked = message.kind === "user" && isSensitiveInput(message.text, previous);
              return (
                <React.Fragment key={message.id}>
                  {showDateDivider && (
                    <div className="relative flex items-center py-1">
                      <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                      <span className="mx-4 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                        {formatDateLabel(message.createdAt)}
                      </span>
                      <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                    </div>
                  )}
                  <MessageBubble message={message} showTimestamp={showTimestamp} masked={masked} />
                </React.Fragment>
              );
            }
            return null;
          });
        })()}
        {props.hasActiveRun && props.activeStatus && (
          <div className="chat-entry flex justify-start">
            <div className="max-w-[88%]">
              <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                <span className="font-medium text-gray-500 dark:text-gray-400">Clerqe</span>
              </div>
              <div className="mt-0.5 px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-gray-600 dark:border-t-gray-200" />
                  <span className="text-sm text-gray-500 dark:text-gray-300">{props.activeStatus}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
