import type { ClarificationOption } from "../types/banking";
import type { BankingEvent } from "../types/events";
import { safeText } from "./safeText";

export const getEventType = (event: BankingEvent): string =>
  safeText(event.type || event.event || event.event_type, "unknown");

export const getPayload = (event: BankingEvent): Record<string, unknown> => {
  if (event.payload && typeof event.payload === "object") return event.payload;
  if (event.data && typeof event.data === "object") return event.data;
  return event;
};

export const extractAssistantText = (event: BankingEvent): string => {
  const payload = getPayload(event);
  return safeText(
    payload.message || payload.text || payload.content || event.message || event.text || event.content,
  );
};

export const extractStatusText = (event: BankingEvent): string => {
  const payload = getPayload(event);
  return safeText(payload.status || payload.message || payload.text);
};

export const extractErrorText = (event: BankingEvent): string => {
  const payload = getPayload(event);
  return safeText(
    payload.message ||
      payload.detail ||
      payload.error ||
      payload.status ||
      payload.text ||
      event.message ||
      event.detail ||
      event.error,
  );
};

export const extractActionRequestId = (event: BankingEvent): string | null => {
  const payload = getPayload(event);
  return safeText(payload.action_request_id || payload.actionRequestId || event.action_request_id) || null;
};

export const extractChallengeId = (event: BankingEvent): string | null => {
  const payload = getPayload(event);
  return safeText(payload.challenge_id || payload.challengeId || event.challenge_id) || null;
};

export const extractConfirmationDetails = (event: BankingEvent) => {
  const payload = getPayload(event);
  const details = Array.isArray(payload.details)
    ? payload.details
        .map((item) => {
          const row = item as Record<string, unknown>;
          return {
            label: safeText(row.label || row.key || "Detail", "Detail"),
            value: safeText(row.value || row.text, ""),
          };
        })
        .filter((x) => x.value)
    : [];
  return {
    title: safeText(payload.title, "Please confirm this action"),
    summary: safeText(payload.summary || payload.message, "Review and confirm to continue."),
    details,
  };
};

export const extractClarification = (event: BankingEvent) => {
  const payload = getPayload(event);
  const options = Array.isArray(payload.options)
    ? (payload.options as Record<string, unknown>[]).map((option) => ({
        id: safeText(option.id),
        label: safeText(option.label, "Option"),
        value: safeText(option.value),
        type: safeText(option.type),
        description: safeText(option.description || option.subtitle || option.secondary),
      }))
    : [];
  return {
    correlationId: safeText(payload.correlation_id || event.correlation_id) || crypto.randomUUID(),
    question: safeText(payload.question, "Can you clarify what you’d like?"),
    options: options as ClarificationOption[],
  };
};
