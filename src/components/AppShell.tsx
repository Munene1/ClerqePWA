import type { ReactNode } from "react";
import ClerqeLogo from "./ClerqeLogo";
import Icon from "./Icon";
import Sidebar from "./Sidebar";

type SessionInfo = import("../types/sessions").SessionInfo;

export default function AppShell(props: {
  title: string;
  subtitle?: string;
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  userName?: string;
  userEmail?: string;
  sessions: SessionInfo[];
  sessionsLoading: boolean;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  onLoadSessions: () => void;
  onLogout: () => void;
  onSetTheme: (theme: "light" | "dark" | "system") => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(15,82,88,0.08),_transparent_36%),linear-gradient(180deg,#f8fbfb_0%,#f4f7f7_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(20,60,57,0.34),_transparent_32%),linear-gradient(180deg,#050908_0%,#020907_100%)]">
      <Sidebar
        open={props.sidebarOpen}
        theme={props.theme}
        userName={props.userName}
        userEmail={props.userEmail}
        sessions={props.sessions}
        sessionsLoading={props.sessionsLoading}
        onLoadSessions={props.onLoadSessions}
        onClose={props.onCloseSidebar}
        onLogout={props.onLogout}
        onSetTheme={props.onSetTheme}
      />

      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/88 backdrop-blur-xl dark:border-white/5 dark:bg-black/55">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center gap-3 px-4 pb-3 pt-[calc(0.75rem+var(--sat,0px))] sm:px-6">
          <button
            onClick={props.onOpenSidebar}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            aria-label="Open menu"
          >
            <Icon name="menu" className="text-lg" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <ClerqeLogo className="hidden h-9 text-slate-800 dark:text-slate-100 sm:block" />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                  {props.title}
                </p>
                {props.subtitle ? (
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {props.subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="hidden min-w-0 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 text-right shadow-sm dark:border-slate-800 dark:bg-slate-950/80 md:block">
            <p className="max-w-[180px] truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {props.userName || "Customer"}
            </p>
            {props.userEmail ? (
              <p className="max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400">
                {props.userEmail}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100dvh-72px-var(--sat,0px))] max-w-6xl px-0 pb-[calc(1rem+var(--sab,0px))] pt-4 sm:px-4 sm:pt-6">
        {props.children}
      </main>
    </div>
  );
}
