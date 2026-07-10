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
import { dataCache } from "../utils/dataCache";

const SESSIONS_CACHE_KEY = "sessions_list";

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
          dataCache.set(SESSIONS_CACHE_KEY, p.sessions);
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

  const resetSessions = useCallback(() => {
    dataCache.invalidate(SESSIONS_CACHE_KEY);
    setSessions([]);
    setSessionsCount(0);
    setSelectedSessionMessages([]);
    setSelectedSessionWorkflows([]);
    setDataLoading(false);
    setSessionsLoading(false);
    sessionsOffsetRef.current = 0;
  }, []);

  const loadSessions = useCallback((listSessionsFn: () => void) => {
    const cached = dataCache.get<SessionInfo[]>(SESSIONS_CACHE_KEY);
    if (cached !== undefined && !dataCache.isStale(SESSIONS_CACHE_KEY)) {
      setSessions(cached);
      setSessionsCount(cached.length);
      setSessionsLoading(false);
      return;
    }
    setSessionsLoading(true);
    try { listSessionsFn(); } catch { setSessionsLoading(false); }
  }, []);

  return {
    sessions,
    sessionsCount,
    sessionsLoading,
    sessionsOffset: sessionsOffsetRef.current,
    setSessionsLoading,
    setSessions,
    selectedSessionMessages,
    selectedSessionWorkflows,
    dataLoading,
    setDataLoading,
    resetSessionData,
    resetSessions,
    loadSessions,
  };
}
