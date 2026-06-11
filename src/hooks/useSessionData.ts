import { useCallback, useEffect, useRef, useState } from "react";
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
  const processedRef = useRef<BankingEvent | null>(null);

  useEffect(() => {
    if (!lastEvent) return;
    if (processedRef.current === lastEvent) return;
    processedRef.current = lastEvent;

    const type = `${lastEvent.type || lastEvent.event || lastEvent.event_type || ""}`.toLowerCase();

    if (type === "sessions.list") {
      const p = lastEvent.payload as SessionsListPayload | undefined;
      if (p && Array.isArray(p.sessions)) {
        if (p.offset === 0) {
          setSessions(p.sessions);
        } else {
          setSessions((prev) => [...prev, ...p.sessions]);
        }
        setSessionsCount(p.count);
        sessionsOffsetRef.current = p.offset + p.sessions.length;
      }
      setSessionsLoading(false);
      return;
    }

    if (type === "session.messages") {
      const p = lastEvent.payload as SessionMessagesPayload | undefined;
      if (p && Array.isArray(p.messages)) {
        setSelectedSessionMessages(p.messages);
      }
      setDataLoading(false);
      return;
    }

    if (type === "session.workflows") {
      const p = lastEvent.payload as WorkflowsPayload | undefined;
      if (p && Array.isArray(p.workflows)) {
        setSelectedSessionWorkflows(p.workflows);
      }
      setDataLoading(false);
      return;
    }
  }, [lastEvent]);

  useEffect(() => {
    if (!sessionsLoading) return;
    const timer = setTimeout(() => setSessionsLoading(false), 10000);
    return () => clearTimeout(timer);
  }, [sessionsLoading]);

  useEffect(() => {
    if (!dataLoading) return;
    const timer = setTimeout(() => setDataLoading(false), 10000);
    return () => clearTimeout(timer);
  }, [dataLoading]);

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
