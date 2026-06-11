import { useCallback, useRef, useState } from "react";
import type { BankingEvent } from "../types/events";
import type {
  SessionInfo,
  SessionMessage,
  Workflow,
  SessionsListPayload,
  SessionMessagesPayload,
  WorkflowsPayload,
} from "../types/sessions";

export function useSessionData(lastEvent: BankingEvent | null) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSessionMessages, setSelectedSessionMessages] = useState<SessionMessage[]>([]);
  const [selectedSessionWorkflows, setSelectedSessionWorkflows] = useState<Workflow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const sessionsOffsetRef = useRef(0);

  const type = `${lastEvent?.type || lastEvent?.event || lastEvent?.event_type || ""}`.toLowerCase();

  if (type === "sessions.list" && lastEvent?.payload) {
    const p = lastEvent.payload as SessionsListPayload;
    if (Array.isArray(p.sessions)) {
      if (p.offset === 0) {
        setSessions(p.sessions);
      } else {
        setSessions((prev) => [...prev, ...p.sessions]);
      }
      setSessionsCount(p.count);
      sessionsOffsetRef.current = p.offset + p.sessions.length;
    }
    setSessionsLoading(false);
  }

  if (type === "session.messages" && lastEvent?.payload) {
    const p = lastEvent.payload as SessionMessagesPayload;
    if (Array.isArray(p.messages)) {
      setSelectedSessionMessages(p.messages);
    }
    setDataLoading(false);
  }

  if (type === "session.workflows" && lastEvent?.payload) {
    const p = lastEvent.payload as WorkflowsPayload;
    if (Array.isArray(p.workflows)) {
      setSelectedSessionWorkflows(p.workflows);
    }
    setDataLoading(false);
  }

  const resetSessionData = useCallback(() => {
    setSelectedSessionMessages([]);
    setSelectedSessionWorkflows([]);
  }, []);

  return {
    sessions,
    sessionsCount,
    sessionsLoading,
    sessionsOffset: sessionsOffsetRef.current,
    setSessionsLoading,
    selectedSessionMessages,
    selectedSessionWorkflows,
    dataLoading,
    setDataLoading,
    resetSessionData,
  };
}
