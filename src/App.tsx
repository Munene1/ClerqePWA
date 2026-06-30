import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ChatScreen from "./components/ChatScreen";
import InstallPromptBanner from "./components/InstallPromptBanner";
import LoginScreen from "./components/LoginScreen";
import BeneficiaryListPage from "./pages/BeneficiaryListPage";
import BeneficiaryDetailPage from "./pages/BeneficiaryDetailPage";
import { isAdminLoggedIn } from "./api/admin";

const IntroducingClerqe = lazy(() => import("./components/IntroducingClerqe"));
const AdminScreen = lazy(() => import("./components/AdminScreen"));
const AdminLoginScreen = lazy(() => import("./components/AdminLoginScreen"));
import SessionDetailPage from "./components/SessionDetailPage";
import AppShell from "./components/AppShell";
import { useSessionData } from "./hooks/useSessionData";
import { useBankingSession } from "./hooks/useBankingSession";
import { useBankingSocket } from "./hooks/useBankingSocket";
import { useChatMessages } from "./hooks/useChatMessages";
import { useFeedback } from "./hooks/useFeedback";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { getEventType } from "./utils/eventNormalize";
import { loadChatHistory, loadRememberedEmail, saveRememberedEmail, clearRememberedEmail } from "./utils/storage";

export default function App() {
  const [identifier, setIdentifier] = useState("");

  const setStatusBarStyle = (resolved: "light" | "dark") => {
    try {
      const w = window as typeof window & { Capacitor?: { Plugins: Record<string, any> } };
      const { StatusBar } = w.Capacitor?.Plugins || {};
      if (StatusBar) {
        StatusBar.setOverlaysWebView({ overlay: true });
        StatusBar.setStyle({ style: resolved === "light" ? "LIGHT" : "DARK" });
      }
    } catch {
      // not running in Capacitor (browser dev)
    }
  };
  const [loadingOlderHistory, setLoadingOlderHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [enteringChat, setEnteringChat] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(() => loadRememberedEmail());
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
  const feedback = useFeedback(socket.lastEvent);
  const sessionData = useSessionData(socket.lastEvent);
  const installPrompt = useInstallPrompt();
  useEffect(() => {
    if (chat.activeFeedback && !chat.activeFeedback.submitted) {
      feedback.requestFeedback(chat.activeFeedback.toolType);
    }
  }, [chat.activeFeedback]);
  const forceLogin = socket.sessionExpired;
  useEffect(() => {
    if (sessionState.authenticated && identifier) {
      saveRememberedEmail(identifier);
      setRememberedEmail(identifier);
    }
  }, [sessionState.authenticated, identifier]);

  const prevLoadingRef = useRef(sessionState.loading);

  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = sessionState.loading;
    if (wasLoading && !sessionState.loading && sessionState.authenticated) {
      setEnteringChat(true);
      const t = setTimeout(() => setEnteringChat(false), 500);
      return () => clearTimeout(t);
    }
  }, [sessionState.loading, sessionState.authenticated]);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    if (identifier) saveRememberedEmail(identifier);
    setTimeout(() => {
      socket.close();
      sessionState.logout();
      setIdentifier("");
      setLoggingOut(false);
    }, 600);
  };

  const handleClearRememberedEmail = () => {
    clearRememberedEmail();
    setRememberedEmail(null);
  };

  const isLoggedIn = sessionState.authenticated && !forceLogin;
  const userName = (sessionState.session?.customer as Record<string, unknown> | undefined)?.name as string | undefined || sessionState.fullName || undefined;
  const userEmail = (sessionState.session?.customer as Record<string, unknown> | undefined)?.email as string | undefined;
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

  const setThemeIcons = (isDark: boolean) => {
    const fav = document.getElementById("favicon") as HTMLLinkElement | null;
    const apple = document.getElementById("apple-touch-icon") as HTMLLinkElement | null;
    if (fav) fav.href = isDark ? "/favicon-dark.svg" : "/favicon-light.svg";
    if (apple) apple.href = isDark ? "/pwa-icon-dark.svg" : "/pwa-icon-light.svg";
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
    setThemeIcons(resolved === "dark");

    const meta = document.querySelector("meta[name=theme-color]");
    if (meta) {
      meta.setAttribute("content", resolved === "dark" ? "#020907" : "#ffffff");
    }

    setStatusBarStyle(resolved);

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
      setStatusBarStyle(next);
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
      sessionData.resetSessions();
      return;
    }
    if (lastSessionIdRef.current && lastSessionIdRef.current !== currentSessionId) {
      historyLoadedSessionRef.current = null;
      historyRequestOffsetRef.current = null;
      setLoadingOlderHistory(false);
      chat.resetChatState();
      sessionData.resetSessions();
    }
    lastSessionIdRef.current = currentSessionId;
  }, [sessionState.session?.session_id, sessionData.resetSessions]);

  useEffect(() => {
    const sessionId = sessionState.session?.session_id || null;
    const customerId = sessionState.session?.customer_id || null;
    if (!sessionId || !customerId) return;
    if (socket.connectionState !== "connected") return;
    if (historyLoadedSessionRef.current === sessionId) return;
    const cached = loadChatHistory(customerId);
    if (cached && cached.messages.length > 0) {
      historyLoadedSessionRef.current = sessionId;
      return;
    }
    try {
      socket.loadChatHistory(customerId, 30, 0, sessionId);
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

  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const [transitioning, setTransitioning] = useState(false);

  const shellTitle = (() => {
    if (location.pathname.startsWith("/beneficiaries/")) return "Beneficiary";
    if (location.pathname.startsWith("/beneficiaries")) return "Beneficiaries";
    if (location.pathname.startsWith("/sessions/")) return "Session details";
    return "Assistant";
  })();

  const shellSubtitle = (() => {
    if (location.pathname.startsWith("/beneficiaries")) return "Manage saved people, merchants, and schedules";
    if (location.pathname.startsWith("/sessions/")) return "Review workflows and transcript history";
    return "Chat with Clerqe";
  })();

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      setTransitioning(true);
      prevPathRef.current = location.pathname;
      const timer = setTimeout(() => setTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <div className="relative">
      {transitioning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 animate-fade-in dark:bg-black/90">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-full w-full animate-loading-pulse rounded-full bg-[var(--brand-primary)]" />
          </div>
        </div>
      )}

      {loggingOut && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm animate-fade-in dark:bg-black/95">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-gray-600 dark:border-t-gray-200" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Logging out...</p>
        </div>
      )}

      {enteringChat && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm animate-fade-in dark:bg-black/95">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700 dark:border-gray-600 dark:border-t-gray-200" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Signing you in...</p>
        </div>
      )}

    <Routes>
      <Route path="/sessions/:sessionId" element={
        isLoggedIn ? (
          <AppShell
            title={shellTitle}
            subtitle={shellSubtitle}
            sidebarOpen={sidebarOpen}
            theme={theme}
            userName={userName}
            userEmail={userEmail}
            sessions={sessionData.sessions}
            sessionsLoading={sessionData.sessionsLoading}
            onOpenSidebar={() => setSidebarOpen(true)}
            onCloseSidebar={() => setSidebarOpen(false)}
            onLoadSessions={() => { sessionData.setSessionsLoading(true); try { socket.listSessions(); } catch { sessionData.setSessionsLoading(false); } }}
            onLogout={handleLogout}
            onSetTheme={(t) => setTheme(t)}
          >
            <SessionDetailPage
              lastEvent={socket.lastEvent}
              onLoadSessionMessages={(sid) => { sessionData.setDataLoading(true); socket.loadSessionMessages(sid); }}
              onLoadSessionWorkflows={(sid) => { sessionData.setDataLoading(true); socket.loadSessionWorkflows(sid); }}
              selectedSessionMessages={sessionData.selectedSessionMessages}
              selectedSessionWorkflows={sessionData.selectedSessionWorkflows}
              dataLoading={sessionData.dataLoading}
              onResetSessionData={sessionData.resetSessionData}
            />
          </AppShell>
        ) : <Navigate to="/" replace />
      } />
      <Route path="/beneficiaries" element={isLoggedIn ? (
        <AppShell
          title={shellTitle}
          subtitle={shellSubtitle}
          sidebarOpen={sidebarOpen}
          theme={theme}
          userName={userName}
          userEmail={userEmail}
          sessions={sessionData.sessions}
          sessionsLoading={sessionData.sessionsLoading}
          onOpenSidebar={() => setSidebarOpen(true)}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLoadSessions={() => { sessionData.setSessionsLoading(true); try { socket.listSessions(); } catch { sessionData.setSessionsLoading(false); } }}
          onLogout={handleLogout}
          onSetTheme={(t) => setTheme(t)}
        >
          <BeneficiaryListPage />
        </AppShell>
      ) : <Navigate to="/" replace />} />
      <Route path="/beneficiaries/:id" element={isLoggedIn ? (
        <AppShell
          title={shellTitle}
          subtitle={shellSubtitle}
          sidebarOpen={sidebarOpen}
          theme={theme}
          userName={userName}
          userEmail={userEmail}
          sessions={sessionData.sessions}
          sessionsLoading={sessionData.sessionsLoading}
          onOpenSidebar={() => setSidebarOpen(true)}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLoadSessions={() => { sessionData.setSessionsLoading(true); try { socket.listSessions(); } catch { sessionData.setSessionsLoading(false); } }}
          onLogout={handleLogout}
          onSetTheme={(t) => setTheme(t)}
        >
          <BeneficiaryDetailPage />
        </AppShell>
      ) : <Navigate to="/" replace />} />
      <Route path="/introducing-clerqe" element={
        <Suspense fallback={<div className="flex h-dvh items-center justify-center bg-white dark:bg-black"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-400" /></div>}><IntroducingClerqe /></Suspense>
      } />
      <Route path="/admin" element={
        <Suspense fallback={<div className="flex h-dvh items-center justify-center bg-white dark:bg-black"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-400" /></div>}>
          <AdminGuard />
        </Suspense>
      } />
      <Route
        path="*"
        element={
          sessionState.authenticated && !forceLogin ? (
            <div key="chat" className="animate-fade-in">
              <AppShell
                title={shellTitle}
                subtitle={shellSubtitle}
                sidebarOpen={sidebarOpen}
                theme={theme}
                userName={userName}
                userEmail={userEmail}
                sessions={sessionData.sessions}
                sessionsLoading={sessionData.sessionsLoading}
                onOpenSidebar={() => setSidebarOpen(true)}
                onCloseSidebar={() => setSidebarOpen(false)}
                onLoadSessions={() => { sessionData.setSessionsLoading(true); try { socket.listSessions(); } catch { sessionData.setSessionsLoading(false); } }}
                onLogout={handleLogout}
                onSetTheme={(t) => setTheme(t)}
              >
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
                  activeFeedback={chat.activeFeedback}
                  feedbackRating={feedback.feedback?.rating ?? null}
                  feedbackWhatWorked={feedback.feedback?.whatWorked ?? []}
                  feedbackWhatWouldSwitch={feedback.feedback?.whatWouldSwitch ?? []}
                  feedbackCompetitiveChoice={feedback.feedback?.competitiveChoice ?? ""}
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
                  onSetFeedbackRating={(rating) => feedback.setRating(rating)}
                  onToggleFeedbackWhatWorked={(option) => feedback.toggleWhatWorked(option)}
                  onToggleFeedbackWhatWouldSwitch={(option) => feedback.toggleWhatWouldSwitch(option)}
                  onSetFeedbackCompetitiveChoice={(choice) => feedback.setCompetitiveChoice(choice)}
                  onSubmitFeedback={() => {
                    if (feedback.feedback) {
                      socket.submitFeedback({
                        tool_type: feedback.feedback.toolType,
                        rating: feedback.feedback.rating || 0,
                        what_worked: feedback.feedback.whatWorked,
                        what_would_switch: feedback.feedback.whatWouldSwitch,
                        competitive_choice: feedback.feedback.competitiveChoice,
                      });
                      chat.clearActiveFeedback?.();
                      feedback.clearFeedback();
                    }
                  }}
                />
                {installPrompt.canInstall && (
                  <InstallPromptBanner
                    onInstall={installPrompt.promptInstall}
                    onDismiss={() => installPrompt.setDismissed(true)}
                  />
                )}
              </AppShell>
            </div>
          ) : (
            <div key="login" className="animate-fade-in">
              <LoginScreen
                identifier={identifier}
                setIdentifier={setIdentifier}
                loading={sessionState.loading}
                error={forceLogin ? "Your session expired. Please sign in again." : sessionState.error}
                authStep={sessionState.authStep}
                authMessage={sessionState.authMessage}
                fullName={sessionState.fullName}
                setFullName={sessionState.setFullName}
                rememberedEmail={rememberedEmail}
                onClearRememberedEmail={handleClearRememberedEmail}
                onSubmitIdentifier={(email) => sessionState.login(email ?? identifier)}
                onConfirmAccountCreation={sessionState.beginAccountCreation}
                onSubmitOtp={sessionState.submitOtp}
                onCancelFlow={sessionState.cancelAccountCreation}
                onClearError={sessionState.clearError}
              />
            </div>
          )
        }
      />
    </Routes>
    </div>
  );
}

function AdminGuard() {
  const [loggedIn, setLoggedIn] = useState(() => isAdminLoggedIn());

  if (!loggedIn) {
    return <AdminLoginScreen onLogin={() => setLoggedIn(true)} />;
  }
  return <AdminScreen />;
}
