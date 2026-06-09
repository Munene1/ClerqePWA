import { useEffect, useMemo, useRef, useState } from "react";
import { BankingSocketClient } from "../realtime/bankingSocket";
import type { SocketConnectionState } from "../types/banking";
import type { BankingEvent } from "../types/events";

export function useBankingSocket(params: {
  sessionId?: string;
  accessToken?: string;
  enabled: boolean;
}) {
  const clientRef = useRef<BankingSocketClient | null>(null);
  const [connectionState, setConnectionState] =
    useState<SocketConnectionState>("idle");
  const [lastEvent, setLastEvent] = useState<BankingEvent | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [reconnectFailed, setReconnectFailed] = useState(false);

  if (!clientRef.current) clientRef.current = new BankingSocketClient();

  useEffect(() => {
    const client = clientRef.current!;
    return client.onStateChange((state) => {
      setConnectionState(state);
      if (state === "reconnect_failed") {
        setReconnectFailed(true);
      } else if (state === "connected") {
        setReconnectFailed(false);
      }
    });
  }, []);

  useEffect(() => {
    const client = clientRef.current!;
    const unsubscribe = client.subscribe((event) => setLastEvent(event));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const client = clientRef.current!;
    return client.onSessionExpired(() => setSessionExpired(true));
  }, []);

  useEffect(() => {
    const client = clientRef.current!;
    if (params.enabled && params.sessionId && params.accessToken) {
      setSessionExpired(false);
      client.connect(params.sessionId, params.accessToken);
      return;
    }
    setLastEvent(null);
    client.close();
  }, [params.enabled, params.sessionId, params.accessToken]);

  const actions = useMemo(
    () => ({
      sendUserMessage(
        message: string,
        selectedOption?: Record<string, unknown>,
        correlationId?: string,
      ) {
        clientRef.current?.send({
          type: "user.message",
          message,
          ...(correlationId ? { correlation_id: correlationId } : {}),
          ...(selectedOption ? { selected_option: selectedOption } : {}),
        });
      },
      confirmAction(action_request_id: string) {
        clientRef.current?.send({ type: "action.confirm", action_request_id });
      },
      cancelAction(action_request_id: string) {
        clientRef.current?.send({ type: "action.cancel", action_request_id });
      },
      submitPin(challenge_id: string, pin: string) {
        clientRef.current?.send({ type: "auth.pin_submit", challenge_id, pin });
      },
      resume() {
        clientRef.current?.send({ type: "session.resume" });
      },
      loadChatHistory(customerId: string, limit = 30, offset = 0) {
        clientRef.current?.send({
          type: "chat.history.load",
          payload: {
            customer_id: customerId,
            limit,
            offset,
          },
        });
      },
      close() {
        clientRef.current?.close();
      },
      reconnect() {
        setReconnectFailed(false);
        clientRef.current?.reconnect();
      },
    }),
    [],
  );

  return { connectionState, lastEvent, sessionExpired, reconnectFailed, ...actions };
}
