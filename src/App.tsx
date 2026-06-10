import { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import ChatScreen from "./components/ChatScreen";
import InstallPromptBanner from "./components/InstallPromptBanner";
import IntroducingClerqe from "./components/IntroducingClerqe";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import ClerqeLogo from "./components/ClerqeLogo";
import WelcomePopover from "./components/WelcomePopover";
import { useBankingSession } from "./hooks/useBankingSession";
import { useBankingSocket } from "./hooks/useBankingSocket";
import { useChatMessages } from "./hooks/useChatMessages";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { getEventType } from "./utils/eventNormalize";
import { loadChatHistory } from "./utils/storage";

export default function App() {
  const [identifier, setIdentifier] = useState("");

  // Capacitor native StatusBar — runs only in native WebView
  useEffect(() => {
    try {
      const w = window as typeof window & { Capacitor?: { Plugins: Record<string, any> } };
      const { StatusBar } = w.Capacitor?.Plugins || {};
      if (StatusBar) {
        StatusBar.setOverlaysWebView({ overlay: true });
        StatusBar.setStyle({ style: "DARK" });
      }
    } catch {
      // not running in Capacitor (browser dev)
    }
  }, []);
  const [loadingOlderHistory, setLoadingOlderHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [signupNoticeVisible, setSignupNoticeVisible] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("banka_theme");
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
    return "system";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sessionState = useBankingSession();
  const socket = useBankingSocket({
    enabled: sessionState.authenticated,
    sessionId: sessionState.session?.session_id,
    accessToken: sessionState.session?.access_token,
  });
  const chat = useChatMessages(socket.lastEvent, sessionState.session?.customer_id);
  const installPrompt = useInstallPrompt();
  const forceLogin = socket.sessionExpired;
  const handleLogout = () => {
    socket.close();
    sessionState.logout();
    setIdentifier("");
  };
  const historyLoadedSessionRef = useRef<string | null>(null);
  const historyRequestOffsetRef = useRef<number | null>(null);
  const lastSessionIdRef = useRef<string | null>(null);

  const prevConnectionRef = useRef(socket.connectionState);
  const sessionExpiredHandledRef = useRef(false);

  useEffect(() => {
    const prev = prevConnectionRef.current;
    prevConnectionRef.current = socket.connectionState;
    if (socket.connectionState === "connected" && prev !== "connected") {
      chat.clearActiveStatus();
      const customerId = sessionState.session?.customer_id;
      if (customerId && socket.connectionState === "connected") {
        historyLoadedSessionRef.current = null;
        historyRequestOffsetRef.current = null;
      }
    }
  }, [socket.connectionState, chat]);

  useEffect(() => {
    if (chat.pendingResendQueue.length === 0) return;
    const text = chat.pendingResendQueue[0];
    chat.shiftResendQueue();
    const correlationId = chat.addUserMessage(text);
    try {
      socket.sendUserMessage(text, undefined, correlationId);
    } catch {
      chat.failActiveRequest();
      chat.addErrorMessage("Unable to send right now. Reconnecting...");
    }
  }, [chat.pendingResendQueue]);

  useEffect(() => {
    if (!socket.sessionExpired) {
      sessionExpiredHandledRef.current = false;
      return;
    }
    if (sessionExpiredHandledRef.current) return;
    sessionExpiredHandledRef.current = true;
    handleLogout();
  }, [socket.sessionExpired]);

  const resolveTheme = (pref: "light" | "dark" | "system") => {
    if (pref === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return pref;
  };

  useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.classList.remove("light", "dark");
    document.body.classList.remove("light", "dark");
    document.documentElement.classList.add(resolved);
    document.body.classList.add(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    document.body.setAttribute("data-theme", resolved);
    localStorage.setItem("banka_theme", theme);

    const meta = document.querySelector("meta[name=theme-color]");
    if (meta) {
      meta.setAttribute("content", resolved === "dark" ? "#020907" : "#ffffff");
    }

    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const next = e.matches ? "dark" : "light";
      document.documentElement.classList.remove("light", "dark");
      document.body.classList.remove("light", "dark");
      document.documentElement.classList.add(next);
      document.body.classList.add(next);
      document.documentElement.setAttribute("data-theme", next);
      document.body.setAttribute("data-theme", next);
      const meta2 = document.querySelector("meta[name=theme-color]");
      if (meta2) meta2.setAttribute("content", next === "dark" ? "#020907" : "#ffffff");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    const currentSessionId = sessionState.session?.session_id || null;
    if (!currentSessionId) {
      historyLoadedSessionRef.current = null;
      historyRequestOffsetRef.current = null;
      setLoadingOlderHistory(false);
      lastSessionIdRef.current = null;
      chat.resetChatState();
      return;
    }
    if (lastSessionIdRef.current && lastSessionIdRef.current !== currentSessionId) {
      historyLoadedSessionRef.current = null;
      historyRequestOffsetRef.current = null;
      setLoadingOlderHistory(false);
      chat.resetChatState();
    }
    lastSessionIdRef.current = currentSessionId;
  }, [sessionState.session?.session_id]);

  useEffect(() => {
    const sessionId = sessionState.session?.session_id || null;
    const customerId = sessionState.session?.customer_id || null;
    if (!sessionId || !customerId) return;
    if (socket.connectionState !== "connected") return;
    if (historyLoadedSessionRef.current === sessionId) return;
    // If we have a cached history snapshot for this customer, skip the backend fetch.
    // The socket will push any new messages incrementally.
    const cached = loadChatHistory(customerId);
    if (cached && cached.messages.length > 0) {
      historyLoadedSessionRef.current = sessionId;
      return;
    }
    try {
      socket.loadChatHistory(customerId, 30, 0);
      setLoadingHistory(true);
      historyRequestOffsetRef.current = 0;
      historyLoadedSessionRef.current = sessionId;
    } catch {
      // keep UI resilient; history can be requested again on next connect
    }
  }, [sessionState.session?.customer_id, sessionState.session?.session_id, socket]);

  useEffect(() => {
    if (!loadingOlderHistory) return;
    const lastEventType = socket.lastEvent ? getEventType(socket.lastEvent) : null;
    if (
      chat.historyLoadedPairs > 0 ||
      lastEventType === "chat.history" ||
      lastEventType === "message.error"
    ) {
      setLoadingOlderHistory(false);
      historyRequestOffsetRef.current = null;
    }
  }, [chat.historyLoadedPairs, loadingOlderHistory, socket.lastEvent]);

  useEffect(() => {
    if (!loadingHistory) return;
    const lastEventType = socket.lastEvent ? getEventType(socket.lastEvent) : null;
    if (
      lastEventType === "chat.history" ||
      lastEventType === "message.error"
    ) {
      setLoadingHistory(false);
    }
  }, [loadingHistory, socket.lastEvent]);

  useEffect(() => {
    const loader = document.getElementById("app-shell-loader");
    if (loader) {
      loader.classList.add("is-hidden");
      setTimeout(() => loader.remove(), 300);
    }
  }, []);

  useEffect(() => {
    if (!sessionState.preSignupWelcome) {
      setSignupNoticeVisible(false);
      return;
    }
    setSignupNoticeVisible(true);
    const timer = setTimeout(() => setSignupNoticeVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [sessionState.preSignupWelcome]);

  return (
    <Routes>
      <Route path="/introducing-clerqe" element={<IntroducingClerqe />} />
      <Route
        path="*"
        element={
          !sessionState.authenticated || forceLogin ? (
            <div key="login" className="animate-fade-in">
              <>
              {signupNoticeVisible && (
                <div className="pointer-events-none fixed left-1/2 top-3 z-[70] w-[min(92vw,32rem)] -translate-x-1/2 animate-toast-slide-in">
                  <div className="rounded-[6px] border border-black/8 bg-white px-4 py-3 text-sm leading-5 text-slate-700 shadow-[0_10px_30px_rgba(15,82,88,0.10)] dark:border-white/10 dark:bg-white dark:text-slate-800">
                    We couldn&apos;t find an account for that email. Read the short notice, then continue to create one.
                  </div>
                </div>
              )}
              {sessionState.preSignupWelcome ? (
                <WelcomePopover onDismiss={sessionState.dismissPreSignupWelcome} />
              ) : (
                <LoginScreen
                  identifier={identifier}
                  setIdentifier={setIdentifier}
                  loading={sessionState.loading}
                  error={forceLogin ? "Your session expired. Please sign in again." : sessionState.error}
                  authStep={sessionState.authStep}
                  authMessage={sessionState.authMessage}
                  fullName={sessionState.fullName}
                  setFullName={sessionState.setFullName}
                  onSubmitIdentifier={() => sessionState.login(identifier)}
                  onConfirmAccountCreation={sessionState.beginAccountCreation}
                  onSubmitOtp={sessionState.submitOtp}
                  onSubmitPinSetup={sessionState.submitPinSetup}
                  onCancelFlow={sessionState.cancelAccountCreation}
                  onClearError={sessionState.clearError}
                />
              )}
              </>
            </div>
          ) : (
            <div key="chat" className="animate-fade-in">
              <Sidebar
                open={sidebarOpen}
                theme={theme}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
                onSetTheme={(t) => setTheme(t)}
              />
              <div
          className="fixed left-1.5 z-30 flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-[0_0_6px_rgba(0,0,0,0.06)] backdrop-blur-md dark:bg-[#111] dark:shadow-[0_0_6px_rgba(0,0,0,0.3)]"
          style={{ top: "calc(0.25rem + var(--sat, 0px))" }}
        >
          <button
        onClick={() => setSidebarOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-900 dark:active:bg-gray-800"
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="14" y2="18" />
        </svg>
      </button>
      <ClerqeLogo className="h-10 text-gray-700 dark:text-gray-300" />
      </div>
      <ChatScreen
        connectionState={socket.connectionState}
        reconnectFailed={socket.reconnectFailed}
        loadingHistory={loadingHistory}
        messages={chat.messages}
        historyMessageCount={chat.historyMessageCount}
        liveMessageCount={chat.liveMessageCount}
        activeStatus={chat.activeStatus}
        hasActiveRun={chat.hasActiveRun}
        hasOlderHistory={chat.hasOlderHistory}
        loadingOlderHistory={loadingOlderHistory}
        activeClarificationCard={chat.activeClarificationCard}
        accessToken={sessionState.session?.access_token ?? ""}
        onReconnect={() => socket.reconnect()}
        onLoadOlderHistory={() => {
          const customerId = sessionState.session?.customer_id;
          if (!customerId) return;
          if (socket.connectionState !== "connected") return;
          if (!chat.hasOlderHistory) return;
          if (loadingOlderHistory) return;
          const nextOffset = chat.historyLoadedPairs;
          if (historyRequestOffsetRef.current === nextOffset) return;
          setLoadingOlderHistory(true);
          historyRequestOffsetRef.current = nextOffset;
          try {
            socket.loadChatHistory(customerId, chat.historyLimit, nextOffset);
          } catch {
            historyRequestOffsetRef.current = null;
            setLoadingOlderHistory(false);
            chat.addErrorMessage("Unable to load older messages right now.");
          }
        }}
        onSend={(text) => {
          const correlationId = chat.addUserMessage(text);
          try {
            socket.sendUserMessage(text, undefined, correlationId);
          } catch {
            chat.failActiveRequest();
            chat.addErrorMessage("Unable to send right now. Reconnecting...");
          }
        }}
        onSelectClarification={(correlationId, option) => {
          const text = `Use ${option.label}`;
          chat.markClarificationAnswered(correlationId);
          const nextCorrelationId = chat.addUserMessage(text, correlationId);
          try {
            socket.sendUserMessage(text, option, nextCorrelationId);
          } catch {
            chat.failActiveRequest();
            chat.addErrorMessage("Unable to send clarification right now.");
          }
        }}
      />
      {installPrompt.canInstall && (
        <InstallPromptBanner
          onInstall={installPrompt.promptInstall}
          onDismiss={() => installPrompt.setDismissed(true)}
        />
      )}
            </div>
          )
        }
      />
    </Routes>
  );
}
