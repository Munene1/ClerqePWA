import { useEffect, useRef, useState } from "react";
import type { ClarificationOption } from "../types/banking";
import type { ChatMessage } from "../types/chat";
import type { BankingEvent, HistoryRow } from "../types/events";
import {
  extractAssistantText,
  extractClarification,
  extractErrorText,
  extractStatusText,
  getEventType,
} from "../utils/eventNormalize";
import { loadChatHistory, saveChatHistory, clearChatHistory } from "../utils/storage";

const now = () => new Date().toISOString();

export type ClarificationCardState = {
  correlationId: string;
  question: string;
  options: ClarificationOption[];
  status: "pending" | "answered";
};

const DEFAULT_HISTORY_LIMIT = 30;

export function useChatMessages(lastEvent: BankingEvent | null, customerId?: string | null) {
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [hasActiveRun, setHasActiveRun] = useState(false);
  const [activeClarificationCard, setActiveClarificationCard] = useState<ClarificationCardState | null>(null);
  const [historyPairCount, setHistoryPairCount] = useState(0);
  const [historyLoadedPairs, setHistoryLoadedPairs] = useState(0);
  const [historyLimit, setHistoryLimit] = useState(DEFAULT_HISTORY_LIMIT);
  const historyLoadedFromCacheRef = useRef(false);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const progressThrottleRef = useRef(0);
  const activeCorrelationRef = useRef<string | null>(null);
  const historyMessagesRef = useRef<ChatMessage[]>([]);
  const liveMessagesRef = useRef<ChatMessage[]>([]);
  const cachedCustomerRef = useRef<string | null>(null);
  // Tracks user messages that have been sent but not yet acknowledged by a response.
  const pendingMessagesRef = useRef<Map<string, { text: string }>>(new Map());
  const [pendingResendQueue, setPendingResendQueue] = useState<string[]>([]);

  useEffect(() => {
    historyMessagesRef.current = historyMessages;
  }, [historyMessages]);

  useEffect(() => {
    liveMessagesRef.current = liveMessages;
  }, [liveMessages]);

  // Hydrate from localStorage cache when customerId becomes available
  useEffect(() => {
    if (!customerId) return;
    cachedCustomerRef.current = customerId;
    const cached = loadChatHistory(customerId);
    if (cached && cached.messages.length > 0) {
      setHistoryMessages(cached.messages as ChatMessage[]);
      setHistoryPairCount(cached.pairCount);
      setHistoryLoadedPairs(cached.loadedPairs);
      setHistoryLimit(cached.limit);
      historyLoadedFromCacheRef.current = true;
    }
  }, [customerId]);

  // Persist history to localStorage cache whenever it changes
  useEffect(() => {
    const cid = cachedCustomerRef.current;
    if (!cid || historyMessages.length === 0) return;
    saveChatHistory(cid, historyMessages, historyPairCount, historyLoadedPairs, historyLimit);
  }, [historyMessages]);

  const getCorrelationId = (event: BankingEvent): string | null => {
    const payload =
      (event.payload && typeof event.payload === "object" ? event.payload : null) ||
      (event.data && typeof event.data === "object" ? event.data : null);
    const value =
      (payload as { correlation_id?: unknown })?.correlation_id ||
      (event as { correlation_id?: unknown }).correlation_id;
    return typeof value === "string" && value.trim() ? value : null;
  };

  const resolveCorrelation = (event: BankingEvent): string | null => {
    return getCorrelationId(event) || activeCorrelationRef.current;
  };

  const hasKnownRunContext = (event: BankingEvent) => {
    const correlationId = getCorrelationId(event);
    if (hasActiveRun) return true;
    if (!correlationId) return false;
    return correlationId === activeCorrelationRef.current;
  };

  const clearPendingAssistant = (correlationId: string | null) => {
    setLiveMessages((prev) =>
      prev.filter((msg) => {
        if (msg.kind !== "assistant_pending") return true;
        if (!correlationId) return false;
        return msg.correlationId !== correlationId;
      }),
    );
  };

  const clearActiveRun = (correlationId: string | null) => {
    clearPendingAssistant(correlationId);
    setActiveStatus(null);
    activeCorrelationRef.current = null;
    setHasActiveRun(false);
  };

  const extractHistoryText = (row: HistoryRow | null | undefined): string => {
    if (!row || typeof row !== "object") return "";
    const value = row.message || row.text || row.content;
    return typeof value === "string" ? value.trim() : "";
  };

  const extractHistoryTime = (row: HistoryRow | null | undefined): string => {
    if (!row || typeof row !== "object") return now();
    const value = row.created_at || row.createdAt;
    return typeof value === "string" && value ? value : now();
  };

  const makeHistoryMessage = (kind: "user" | "assistant", row: HistoryRow | null | undefined, text: string): ChatMessage => {
    const createdAt = extractHistoryTime(row);
    const stableId =
      (row?.id && `${kind}-${row.id}`) ||
      `${kind}-${createdAt}-${text.slice(0, 48).toLowerCase()}`;
    return {
      kind,
      id: `history-${stableId}`,
      text,
      createdAt,
    };
  };

  const mergeHistoryMessages = (existing: ChatMessage[], incoming: ChatMessage[], mode: "replace" | "prepend") => {
    if (mode === "replace") return incoming;
    const seen = new Set(existing.map((message) => message.id));
    const uniqueIncoming = incoming.filter((message) => !seen.has(message.id));
    return [...uniqueIncoming, ...existing];
  };

  const appendAssistantMessage = (text: string) => {
    if (!text || shouldSkipAdjacentDuplicate("assistant", text)) return;
    setLiveMessages((prev) => [...prev, { kind: "assistant", id: crypto.randomUUID(), text, createdAt: now() }]);
  };

  const buildApprovalPrompt = (event: BankingEvent) => {
    const payload =
      (event.payload && typeof event.payload === "object" ? event.payload : null) ||
      (event.data && typeof event.data === "object" ? event.data : null);
    const title = typeof payload?.title === "string" ? payload.title.trim() : "";
    const summary =
      typeof payload?.summary === "string"
        ? payload.summary.trim()
        : typeof payload?.message === "string"
          ? payload.message.trim()
          : "";
    const details = Array.isArray(payload?.details)
      ? payload.details
          .map((item) => {
            const row = item as Record<string, unknown>;
            const label = typeof row.label === "string" ? row.label.trim() : typeof row.key === "string" ? row.key.trim() : "";
            const value = typeof row.value === "string" ? row.value.trim() : typeof row.text === "string" ? row.text.trim() : "";
            return label && value ? `${label}: ${value}` : value;
          })
          .filter(Boolean)
      : [];
    return [title, summary, ...details].filter(Boolean).join("\n");
  };

  const normalizeMessageText = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

  const shouldSkipAdjacentDuplicate = (kind: ChatMessage["kind"], text: string) => {
    const normalized = normalizeMessageText(text);
    if (!normalized) return true;
    const allMessages = [...historyMessagesRef.current, ...liveMessagesRef.current];
    const lastMessage = allMessages.at(-1);
    if (!lastMessage) return false;
    if (lastMessage.kind !== kind) return false;
    return normalizeMessageText(lastMessage.text) === normalized;
  };

  useEffect(() => {
    if (!lastEvent) return;
    const type = getEventType(lastEvent);
    const eventKey =
      (typeof lastEvent.event_id === "string" && lastEvent.event_id) ||
      (typeof lastEvent.id === "string" && lastEvent.id) ||
      `${type}:${JSON.stringify(lastEvent.payload || lastEvent.data || {})}`;
    if (seenEventIdsRef.current.has(eventKey)) return;
    seenEventIdsRef.current.add(eventKey);

    if (type === "session.unavailable") {
      resetChatState();
      addErrorMessage(
        extractErrorText(lastEvent) ||
          "Your conversation was interrupted. Starting a new one...",
      );
      return;
    }

    if (type === "chat.history") {
      const payload =
        (lastEvent.payload && typeof lastEvent.payload === "object" ? lastEvent.payload : null) ||
        (lastEvent.data && typeof lastEvent.data === "object" ? lastEvent.data : null);
      const pairCountValue =
        (payload as { pair_count?: unknown; count?: unknown })?.pair_count ??
        (payload as { pair_count?: unknown; count?: unknown })?.count;
      const pairCount = typeof pairCountValue === "number" ? pairCountValue : 0;
      const offsetValue = (payload as { offset?: unknown })?.offset;
      const offset = typeof offsetValue === "number" ? offsetValue : 0;
      const limitValue = (payload as { limit?: unknown })?.limit;
      const nextLimit = typeof limitValue === "number" && limitValue > 0 ? limitValue : DEFAULT_HISTORY_LIMIT;
      const pairs = Array.isArray((payload as { pairs?: unknown })?.pairs)
        ? ((payload as { pairs: Array<{ customer?: HistoryRow; assistant?: HistoryRow | null }> }).pairs || [])
        : [];
      const history: ChatMessage[] = [];
      for (const pair of pairs) {
        const customerText = extractHistoryText(pair.customer);
        if (customerText) {
          history.push(makeHistoryMessage("user", pair.customer, customerText));
        }
        const assistantText = extractHistoryText(pair.assistant || undefined);
        if (assistantText) {
          history.push(makeHistoryMessage("assistant", pair.assistant || undefined, assistantText));
        }
      }
      clearActiveRun(activeCorrelationRef.current);
      // Dedup: after a full history replace, remove messages from live that already
      // exist in history (both user and assistant) to avoid duplicates.
      if (offset === 0) {
        const liveMsgs = liveMessagesRef.current;
        const historyUserTexts = new Set(history.filter((m) => m.kind === "user").map((m) => m.text));
        const historyAssistantTexts = new Set(history.filter((m) => m.kind === "assistant").map((m) => m.text));
        const dedupIds = liveMsgs
          .filter((m) => {
            if (m.kind === "user" && historyUserTexts.has(m.text)) return true;
            if (m.kind === "assistant" && historyAssistantTexts.has(m.text)) return true;
            return false;
          })
          .map((m) => m.id);
        if (dedupIds.length > 0) {
          setLiveMessages((prev) => prev.filter((m) => !dedupIds.includes(m.id)));
        }
        // Cross-reference pending messages against history — resend what never reached the backend.
        const toResend: string[] = [];
        for (const [corrId, entry] of pendingMessagesRef.current) {
          const inHistory = pairs.some((pair) => {
            const custText = extractHistoryText(pair.customer);
            return custText === entry.text;
          });
          if (inHistory) {
            pendingMessagesRef.current.delete(corrId);
          } else {
            toResend.push(entry.text);
            pendingMessagesRef.current.delete(corrId);
          }
        }
        if (toResend.length > 0) {
          setPendingResendQueue(toResend);
        }
      }
      setHistoryPairCount(pairCount);
      setHistoryLimit(nextLimit);
      setHistoryLoadedPairs((current) => (offset === 0 ? pairs.length : Math.max(current, offset + pairs.length)));
      if (pairs.length === 0) return;
      setHistoryMessages((current) => mergeHistoryMessages(current, history, offset === 0 ? "replace" : "prepend"));
      return;
    }

    if (type === "working.started") {
      if (!hasKnownRunContext(lastEvent)) return;
      activeCorrelationRef.current = resolveCorrelation(lastEvent);
      setHasActiveRun(true);
      setActiveStatus(extractStatusText(lastEvent) || null);
      return;
    }

    if (type === "working.progress") {
      if (!hasKnownRunContext(lastEvent)) return;
      const ts = Date.now();
      if (ts - progressThrottleRef.current < 500) return;
      progressThrottleRef.current = ts;
      const text = extractStatusText(lastEvent);
      if (text) setActiveStatus(text);
      return;
    }

    if (type === "working.waiting_input") {
      if (!hasKnownRunContext(lastEvent)) return;
      setActiveStatus(extractStatusText(lastEvent) || null);
      return;
    }

    if (type === "clarification.required") {
      const clar = extractClarification(lastEvent);
      activeCorrelationRef.current = clar.correlationId || resolveCorrelation(lastEvent);
      if (!clar.options || clar.options.length === 0) {
        if (clar.question) setActiveStatus(clar.question);
        return;
      }
      setActiveStatus(clar.question || null);
      setActiveClarificationCard({
        correlationId: clar.correlationId,
        question: clar.question,
        options: clar.options,
        status: "pending",
      });
      return;
    }

    if (type === "message.final") {
      const correlationId = resolveCorrelation(lastEvent);
      if (correlationId) pendingMessagesRef.current.delete(correlationId);
      if (activeClarificationCard && activeClarificationCard.status === "pending") {
        clearActiveRun(correlationId);
        return;
      }
      const text = extractAssistantText(lastEvent);
      appendAssistantMessage(text);
      clearActiveRun(correlationId);
      return;
    }

    if (type === "auth.pin_required" || type === "auth.otp_required") {
      setHasActiveRun(true);
      setActiveStatus(
        extractAssistantText(lastEvent) ||
          (type === "auth.otp_required"
            ? "Enter the OTP to continue this request."
            : "Enter your PIN to continue this request."),
      );
      return;
    }

    if (type === "auth.verified") {
      if (!hasKnownRunContext(lastEvent)) return;
      const text = extractStatusText(lastEvent);
      if (text) setActiveStatus(text);
      return;
    }

    if (type === "auth.failed") {
      addErrorMessage(
        extractErrorText(lastEvent) || "Verification failed. Please try again.",
      );
      setActiveStatus(null);
      setHasActiveRun(false);
      activeCorrelationRef.current = null;
      clearPendingAssistant(resolveCorrelation(lastEvent));
      return;
    }

    if (type === "action.confirmation_required") {
      const prompt = buildApprovalPrompt(lastEvent) || "Please confirm to continue.";
      setActiveStatus(prompt);
      return;
    }

    if (type === "action.confirmed" || type === "action.cancelled" || type === "action.expired") {
      setActiveStatus(null);
      return;
    }

    if (type === "working.error" || type === "message.error" || type === "action.failed") {
      addErrorMessage(
        extractErrorText(lastEvent) ||
          "Something went wrong while processing your request.",
      );
      clearActiveRun(resolveCorrelation(lastEvent));
      return;
    }
  }, [hasActiveRun, lastEvent, activeClarificationCard]);

  function addUserMessage(text: string, correlationId?: string) {
    const activeCorrelation = correlationId || crypto.randomUUID();
    activeCorrelationRef.current = activeCorrelation;
    pendingMessagesRef.current.set(activeCorrelation, { text });
    setHasActiveRun(true);
    if (!shouldSkipAdjacentDuplicate("user", text)) {
      setLiveMessages((prev) => [
        ...prev,
        { kind: "user", id: crypto.randomUUID(), text, createdAt: now() },
      ]);
    }
    setActiveStatus("Submitting request...");
    return activeCorrelation;
  }

  function addErrorMessage(text: string) {
    if (shouldSkipAdjacentDuplicate("error", text)) return;
    setLiveMessages((prev) => [...prev, { kind: "error", id: crypto.randomUUID(), text, createdAt: now() }]);
  }

  function failActiveRequest() {
    clearActiveRun(activeCorrelationRef.current);
  }

  function clearActiveStatus() {
    clearActiveRun(activeCorrelationRef.current);
  }

  function markClarificationAnswered(correlationId: string) {
    if (activeClarificationCard && activeClarificationCard.correlationId === correlationId) {
      setActiveClarificationCard((prev) => prev ? { ...prev, status: "answered" } : null);
    }
  }

  function shiftResendQueue() {
    setPendingResendQueue((prev) => prev.slice(1));
  }

  function resetChatState() {
    const cid = cachedCustomerRef.current;
    if (cid) clearChatHistory(cid);
    cachedCustomerRef.current = null;
    setHistoryMessages([]);
    setLiveMessages([]);
    setActiveStatus(null);
    setHasActiveRun(false);
    setActiveClarificationCard(null);
    setHistoryPairCount(0);
    setHistoryLoadedPairs(0);
    setHistoryLimit(DEFAULT_HISTORY_LIMIT);
    historyLoadedFromCacheRef.current = false;
    seenEventIdsRef.current.clear();
    progressThrottleRef.current = 0;
    activeCorrelationRef.current = null;
    pendingMessagesRef.current.clear();
    setPendingResendQueue([]);
  }

  const messages = [...historyMessages, ...liveMessages];
  const hasOlderHistory = historyLoadedPairs < historyPairCount;

  return {
    messages,
    historyMessageCount: historyMessages.length,
    liveMessageCount: liveMessages.length,
    activeStatus,
    hasActiveRun,
    historyPairCount,
    historyLoadedPairs,
    historyLimit,
    hasOlderHistory,
    activeClarificationCard,
    addUserMessage,
    addErrorMessage,
    failActiveRequest,
    clearActiveStatus,
    markClarificationAnswered,
    resetChatState,
    setActiveStatus,
    pendingResendQueue,
    shiftResendQueue,
    historyLoadedFromCache: historyLoadedFromCacheRef.current,
  };
}
