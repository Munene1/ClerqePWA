import { WS_BASE_URL } from "../config/env";
import type { SocketConnectionState } from "../types/banking";
import type { BankingEvent } from "../types/events";

type Subscriber = (event: BankingEvent) => void;
type StateSubscriber = (state: SocketConnectionState) => void;
type SessionExpiredSubscriber = () => void;

export class BankingSocketClient {
  private static readonly CONNECT_TIMEOUT_MS = 8000;
  private static readonly PING_INTERVAL_MS = 15000;
  private socket: WebSocket | null = null;
  private state: SocketConnectionState = "idle";
  private listeners = new Set<Subscriber>();
  private stateListeners = new Set<StateSubscriber>();
  private sessionExpiredListeners = new Set<SessionExpiredSubscriber>();
  private reconnectCount = 0;
  private consecutiveFailures = 0;
  private maxReconnects = 3;
  private manualClose = false;
  private sessionId: string | null = null;
  private token: string | null = null;
  private reconnectTimer: number | null = null;
  private connectTimeoutTimer: number | null = null;
  private pingTimer: number | null = null;
  private networkBound = false;

  subscribe(listener: Subscriber) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  onStateChange(listener: StateSubscriber) {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  onSessionExpired(listener: SessionExpiredSubscriber) {
    this.sessionExpiredListeners.add(listener);
    return () => {
      this.sessionExpiredListeners.delete(listener);
    };
  }

  getState() {
    return this.state;
  }

  connect(sessionId: string, token: string) {
    if (this.socket && (this.state === "connected" || this.state === "connecting")) return;
    this.sessionId = sessionId;
    this.token = token;
    this.consecutiveFailures = 0;
    this.manualClose = false;
    this.clearTimers();
    this.bindNetworkEvents();
    this.open();
  }

  private setState(next: SocketConnectionState) {
    this.state = next;
    this.stateListeners.forEach((listener) => listener(next));
  }

  private open() {
    if (!this.sessionId || !this.token) return;
    const url = `${WS_BASE_URL}/ws/link/${encodeURIComponent(this.sessionId)}?token=${encodeURIComponent(this.token)}`;
    this.setState(this.reconnectCount > 0 ? "reconnecting" : "connecting");
    this.socket = new WebSocket(url);
    this.connectTimeoutTimer = window.setTimeout(() => {
      if (!this.socket || this.socket.readyState === WebSocket.OPEN || this.manualClose) return;
      try {
        this.socket.close();
      } catch {
        // ignore close errors during timeout handling
      }
    }, BankingSocketClient.CONNECT_TIMEOUT_MS);

    this.socket.onopen = () => {
      this.clearConnectTimeout();
      this.reconnectCount = 0;
      this.consecutiveFailures = 0;
      this.setState("connected");
      this.send({ type: "session.resume" });
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as BankingEvent;
        const type = `${parsed.type || parsed.event || parsed.event_type || ""}`.toLowerCase();

        if (type === "session.expired") {
          this.handleSessionExpired();
          return;
        }

        if (type === "session.error") {
          this.consecutiveFailures = 0;
          if (this.socket) {
            this.socket.onclose = null;
            this.socket.close();
            this.socket = null;
          }
          this.setState("disconnected");
          this.scheduleReconnect();
          return;
        }

        if (type === "session.unavailable") {
          this.consecutiveFailures = 0;
          this.listeners.forEach((listener) => listener(parsed));
          if (this.socket) {
            this.socket.onclose = null;
            this.socket.close();
            this.socket = null;
          }
          this.setState("disconnected");
          this.scheduleReconnect();
          return;
        }

        if (this.isAuthExpiredEvent(parsed)) {
          this.handleSessionExpired();
          return;
        }
        this.listeners.forEach((listener) => listener(parsed));
      } catch {
        // Ignore malformed payloads to keep chat resilient.
      }
    };

    this.socket.onerror = () => {
      this.clearConnectTimeout();
      this.setState("error");
    };

    this.socket.onclose = (event) => {
      this.clearConnectTimeout();
      this.socket = null;
      if (this.manualClose) {
        this.setState("closed");
        return;
      }
      if (this.isForbiddenClose(event)) {
        this.handleSessionExpired();
        return;
      }
      this.consecutiveFailures += 1;
      if (this.consecutiveFailures >= 15) {
        this.handleSessionExpired();
        return;
      }
      this.setState("disconnected");
      this.scheduleReconnect();
    };
  }

  private isForbiddenClose(event: CloseEvent) {
    const reason = (event.reason || "").toLowerCase();
    return (
      event.code === 4401 ||
      event.code === 4403 ||
      event.code === 1008 ||
      reason.includes("403") ||
      reason.includes("forbidden") ||
      reason.includes("unauthorized") ||
      reason.includes("token") ||
      reason.includes("expired")
    );
  }

  private isAuthExpiredEvent(event: BankingEvent) {
    const type = `${event.type || event.event || event.event_type || ""}`.toLowerCase();
    const payload =
      (event.payload && typeof event.payload === "object" ? event.payload : null) ||
      (event.data && typeof event.data === "object" ? event.data : null);
    const message = `${(payload as { message?: unknown; detail?: unknown })?.message || (payload as { detail?: unknown })?.detail || ""}`.toLowerCase();
    const status = Number(
      (payload as { status_code?: unknown; status?: unknown; code?: unknown })?.status_code ||
        (payload as { status?: unknown; code?: unknown })?.status ||
        (payload as { code?: unknown })?.code ||
        (event as { status_code?: unknown; status?: unknown; code?: unknown }).status_code ||
        (event as { status?: unknown; code?: unknown }).status ||
        (event as { code?: unknown }).code,
    );
    return (
      status === 401 ||
      status === 403 ||
      type.includes("session.expired") ||
      type.includes("auth.failed") ||
      message.includes("403") ||
      message.includes("forbidden") ||
      message.includes("unauthorized") ||
      message.includes("expired")
    );
  }

  private handleSessionExpired() {
    this.manualClose = true;
    this.reconnectCount = 0;
    this.consecutiveFailures = 0;
    this.clearTimers();
    this.unbindNetworkEvents();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setState("closed");
    this.sessionExpiredListeners.forEach((listener) => listener());
  }

  private scheduleReconnect() {
    if (this.manualClose || !this.sessionId || !this.token) return;
    this.reconnectCount += 1;
    if (this.reconnectCount > this.maxReconnects) {
      this.setState("reconnect_failed");
      return;
    }
    const delay = Math.min(1000 * 2 ** (this.reconnectCount - 1), 10000);
    this.clearReconnectTimer();
    this.reconnectTimer = window.setTimeout(() => {
      if (!this.manualClose) this.open();
    }, delay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearConnectTimeout() {
    if (this.connectTimeoutTimer !== null) {
      window.clearTimeout(this.connectTimeoutTimer);
      this.connectTimeoutTimer = null;
    }
  }

  private bindNetworkEvents() {
    if (this.networkBound) return;
    this.networkBound = true;

    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  private unbindNetworkEvents() {
    this.networkBound = false;
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    this.stopPings();
  }

  private readonly handleVisibilityChange = () => {
    if (document.hidden) {
      this.startPings();
    } else {
      this.stopPings();
      if (this.state === "disconnected" && !this.manualClose && this.consecutiveFailures < 15) {
        this.reconnectCount = 0;
        this.clearTimers();
        this.open();
      }
    }
  };

  private readonly handleOnline = () => {
    if (this.state !== "connected" && this.state !== "connecting" && !this.manualClose) {
      this.reconnectCount = 0;
      this.consecutiveFailures = 0;
      this.clearTimers();
      this.open();
    }
  };

  private readonly handleOffline = () => {};

  private startPings() {
    this.stopPings();
    this.pingTimer = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, BankingSocketClient.PING_INTERVAL_MS);
  }

  private stopPings() {
    if (this.pingTimer !== null) {
      window.clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private clearTimers() {
    this.clearReconnectTimer();
    this.clearConnectTimeout();
    this.stopPings();
  }

  send(data: Record<string, unknown>) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Socket is not connected");
    }
    this.socket.send(JSON.stringify(data));
  }

  close() {
    this.manualClose = true;
    this.reconnectCount = 0;
    this.consecutiveFailures = 0;
    this.sessionId = null;
    this.token = null;
    this.clearTimers();
    this.unbindNetworkEvents();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setState("closed");
  }

  reconnect() {
    if (this.state !== "reconnect_failed") return;
    this.reconnectCount = 0;
    this.consecutiveFailures = 0;
    this.manualClose = false;
    this.clearTimers();
    this.open();
  }
}
