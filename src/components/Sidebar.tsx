import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ClerqeLogo from "./ClerqeLogo";

type SessionInfo = import("../types/sessions").SessionInfo;

function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function groupByDate(sessions: SessionInfo[]): [string, SessionInfo[]][] {
  const map = new Map<string, SessionInfo[]>();
  for (const s of sessions) {
    const key = new Date(s.started_at).toDateString();
    const list = map.get(key) || [];
    list.push(s);
    map.set(key, list);
  }
  return Array.from(map).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
}

export default function Sidebar(props: {
  open: boolean;
  theme: "light" | "dark" | "system";
  userName?: string;
  userEmail?: string;
  sessions: import("../types/sessions").SessionInfo[];
  sessionsLoading: boolean;
  onLoadSessions: () => void;
  onClose: () => void;
  onLogout: () => void;
  onSetTheme: (theme: "light" | "dark" | "system") => void;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!props.open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        props.onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [props.open]);

  useEffect(() => {
    if (props.open && props.sessions.length === 0 && !props.sessionsLoading) {
      props.onLoadSessions();
    }
  }, [props.open]);

  const themeOptions: { value: "light" | "dark" | "system"; label: string; icon: string }[] = [
    { value: "dark", label: "Dark mode", icon: "dark_mode" },
    { value: "system", label: "System theme", icon: "settings" },
    { value: "light", label: "Light mode", icon: "light_mode" },
  ];

  const grouped = groupByDate(props.sessions);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-200 ${
          props.open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={props.onClose}
      />
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-50 flex h-full w-[88vw] max-w-80 flex-col overflow-hidden border-r border-slate-200/70 bg-white/95 shadow-2xl transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-[#050908]/95 pt-[var(--sat,0px)] ${
          props.open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-800">
          <ClerqeLogo className="h-10 text-slate-800 dark:text-slate-100" />
          <button
            onClick={props.onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-slate-200/70 px-3 py-3 dark:border-slate-800">
            <button
              onClick={() => {
                navigate("/");
                props.onClose();
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <Icon name="forum" className="text-base" />
              <span>Assistant</span>
            </button>
            <button
              onClick={() => {
                navigate("/beneficiaries");
                props.onClose();
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <Icon name="account_circle" className="text-base" />
              <span>Beneficiaries</span>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Session history
            </p>
            {props.sessionsLoading && props.sessions.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-200" />
              </div>
            )}
            {!props.sessionsLoading && props.sessions.length === 0 && (
              <p className="px-3 py-6 text-sm text-slate-400 dark:text-slate-500">No sessions yet</p>
            )}
            <div className="space-y-4">
              {grouped.map(([dateKey, dateSessions]) => (
                <div key={dateKey}>
                  <p className="px-3 pb-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                    {getDateLabel(new Date(dateKey))}
                  </p>
                  <div className="space-y-1">
                    {dateSessions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          navigate("/sessions/" + s.id);
                          props.onClose();
                        }}
                        className="flex w-full flex-col rounded-2xl px-3 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-900"
                      >
                        <p className="line-clamp-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {s.last_message?.content || "Session " + s.id.slice(0, 8)}
                        </p>
                        <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {new Date(s.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200/70 bg-slate-50/90 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/90">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <Icon
                name={
                  props.theme === "dark"
                    ? "dark_mode"
                    : props.theme === "system"
                      ? "settings"
                      : "light_mode"
                }
                className="text-base"
              />
              <span className="flex-1 text-left">
                {props.theme === "dark"
                  ? "Dark mode"
                  : props.theme === "system"
                    ? "System theme"
                    : "Light mode"}
              </span>
              <Icon
                name="arrow_back"
                className={`text-base text-slate-400 transition-transform duration-200 ${
                  themeOpen ? "-rotate-90" : "rotate-180"
                }`}
              />
            </button>

            {themeOpen ? (
              <div className="mt-1 space-y-1 pl-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      props.onSetTheme(opt.value);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${
                      props.theme === opt.value
                        ? "bg-[var(--brand-primary-soft)] font-medium text-[var(--brand-primary)] dark:bg-white/5 dark:text-white"
                        : "text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-900"
                    }`}
                  >
                    <Icon name={opt.icon} className="text-sm" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Icon name="account_circle" className="text-base" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {props.userName || "User"}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {props.userEmail || ""}
                </p>
              </div>
              <button
                onClick={() => {
                  props.onLogout();
                  props.onClose();
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                title="Logout"
              >
                <Icon name="logout" className="text-base" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
