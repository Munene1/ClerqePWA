import { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import ChatScreen from "./components/ChatScreen";
import InstallPromptBanner from "./components/InstallPromptBanner";
import IntroducingClerqe from "./components/IntroducingClerqe";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import WelcomePopover from "./components/WelcomePopover";
import Icon from "./components/Icon";
import { useBankingSession } from "./hooks/useBankingSession";
import { useBankingSocket } from "./hooks/useBankingSocket";
import { useChatMessages } from "./hooks/useChatMessages";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { getEventType } from "./utils/eventNormalize";
import { loadChatHistory } from "./utils/storage";

export default function App() {
  const [identifier, setIdentifier] = useState("");
  const [loadingOlderHistory, setLoadingOlderHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [signupNoticeVisible, setSignupNoticeVisible] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("banka_theme");
    return saved === "dark" ? "dark" : "light";
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

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.body.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.body.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("banka_theme", theme);
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
          ) : (
            <>
              <Sidebar
                open={sidebarOpen}
                theme={theme}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
                onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              />
              <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-1.5 z-30 inline-flex h-8 w-8 items-center justify-center rounded-[3px] text-gray-500 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700"
        style={{ top: "calc(0.25rem + var(--sat, 0px))" }}
        aria-label="Open menu"
      >
        <Icon name="menu" className="text-lg" />
      </button>
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
            </>
          )
        }
      />
    </Routes>
  );
}
