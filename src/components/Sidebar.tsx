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
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!props.open) return;
    setScrolled(false);
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 8);
  };

  return (
    <aside
      ref={sidebarRef}
      className={`fixed left-0 top-0 z-50 flex h-full w-full flex-col overflow-hidden border-r border-gray-200/40 bg-white transition-[transform] duration-300 ease-out transform-gpu dark:border-gray-800/40 dark:bg-black md:w-80 pt-[var(--sat,0px)] ${
        props.open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/40 px-3 py-2.5 dark:border-gray-800/40">
        <ClerqeLogo className="h-10 text-gray-700 dark:text-gray-300" />
        <button
          onClick={props.onClose}
          className="rounded-[3px] p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          <Icon name="close" className="text-lg" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="no-scrollbar flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="px-2 pt-2 pb-1">
            <button
              onClick={() => { navigate("/"); props.onClose(); }}
              className="flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              <Icon name="forum" className="text-base" />
              <span>Assistant</span>
            </button>
          </div>

          <div className="px-2 pb-4">
            <p className="px-3 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Session history
            </p>

            {props.sessionsLoading && props.sessions.length === 0 && (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-400" />
              </div>
            )}

            {!props.sessionsLoading && props.sessions.length === 0 && (
              <p className="px-3 py-6 text-sm text-gray-400 dark:text-gray-500">No sessions yet</p>
            )}

            {grouped.map(([dateKey, dateSessions]) => (
              <div key={dateKey} className="mb-3 last:mb-0">
                <p className="px-3 pb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                  {getDateLabel(new Date(dateKey))}
                </p>
                {dateSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { navigate("/sessions/" + s.id); props.onClose(); }}
                    className="flex w-full items-start rounded-[3px] px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                      {s.last_message?.content || "Session " + s.id.slice(0, 8)}
                    </p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`shrink-0 transition-transform duration-300 ease-out ${
            scrolled ? "translate-y-full" : ""
          }`}
        >
          <div className="border-t border-gray-200/40 px-2 py-0.5 dark:border-gray-800/40">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              <Icon name={props.theme === "dark" ? "dark_mode" : props.theme === "system" ? "settings" : "light_mode"} className="text-base" />
              <span className="flex-1 text-left">{props.theme === "dark" ? "Dark mode" : props.theme === "system" ? "System theme" : "Light mode"}</span>
              <Icon name="arrow_back" className={`text-base text-gray-400 transition-transform duration-200 ${themeOpen ? "-rotate-90" : "rotate-180"}`} />
            </button>

            {themeOpen && (
              <div className="ml-1 space-y-0.5 pl-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { props.onSetTheme(opt.value); props.onClose(); }}
                    className={`flex w-full items-center gap-2.5 rounded-[3px] px-3 py-1.5 text-sm transition-colors ${
                      props.theme === opt.value
                        ? "bg-[var(--brand-primary-soft)] font-medium text-[var(--brand-primary)] dark:bg-white/5 dark:text-white/80"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                  >
                    <Icon name={opt.icon} className="text-sm" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 border-t border-gray-200/40 px-3 py-2 dark:border-gray-800/40">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              <Icon name="account_circle" className="text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {props.userName || "User"}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {props.userEmail || ""}
              </p>
            </div>
            <button
              onClick={() => { props.onLogout(); props.onClose(); }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
              title="Logout"
            >
              <Icon name="logout" className="text-base" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
