import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import ClerqeLogo from "./ClerqeLogo";

export default function Sidebar(props: {
  open: boolean;
  theme: "light" | "dark" | "system";
  onClose: () => void;
  onLogout: () => void;
  onSetTheme: (theme: "light" | "dark" | "system") => void;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [themeOpen, setThemeOpen] = useState(false);

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

  const themeOptions: { value: "light" | "dark" | "system"; label: string; icon: string }[] = [
    { value: "dark", label: "Dark mode", icon: "dark_mode" },
    { value: "system", label: "System theme", icon: "settings" },
    { value: "light", label: "Light mode", icon: "light_mode" },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`fixed left-0 top-0 z-50 h-full w-[75vw] border-r border-gray-200 bg-white transition-[transform] duration-300 ease-out transform-gpu dark:border-gray-800 dark:bg-black md:w-80 pt-[var(--sat,0px)] ${
        props.open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <ClerqeLogo className="h-5 text-gray-700 dark:text-gray-300" />
          <button
            onClick={props.onClose}
            className="rounded-[3px] p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-3">
          <button
            onClick={props.onClose}
            className="flex w-full items-center gap-3 rounded-[3px] px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            <Icon name="forum" className="text-base" />
            <span>Assistant</span>
          </button>

          <button
            onClick={() => { props.onClose(); }}
            className="flex w-full items-center gap-3 rounded-[3px] px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            <Icon name="history" className="text-base" />
            <span>Session logs</span>
          </button>
        </nav>

        <div className="space-y-1 border-t border-gray-200 px-2 py-3 dark:border-gray-800">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="flex w-full items-center gap-3 rounded-[3px] px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            <Icon name={props.theme === "dark" ? "dark_mode" : props.theme === "system" ? "settings" : "light_mode"} className="text-base" />
            <span className="flex-1 text-left">{props.theme === "dark" ? "Dark mode" : props.theme === "system" ? "System theme" : "Light mode"}</span>
            <Icon name="arrow_back" className={`text-base transition-transform duration-200 ${themeOpen ? "-rotate-90" : "rotate-180"}`} />
          </button>

          {themeOpen && (
            <div className="ml-2 space-y-0.5 border-l border-gray-200 pl-2 dark:border-gray-800">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { props.onSetTheme(opt.value); props.onClose(); }}
                  className={`flex w-full items-center gap-3 rounded-[3px] px-3 py-2 text-sm transition-colors ${
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

          <button
            onClick={() => { props.onLogout(); props.onClose(); }}
            className="flex w-full items-center gap-3 rounded-[3px] px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Icon name="logout" className="text-base" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
