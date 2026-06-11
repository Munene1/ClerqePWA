import Icon from "./Icon";
import ClerqeLogo from "./ClerqeLogo";

export default function ActivityPage({ onMenuOpen }: { onMenuOpen: () => void }) {

  return (
    <div className="flex h-dvh flex-col bg-gray-100 dark:bg-[#080808]">
      <div className="relative flex-1">
        <div
          className="fixed left-1.5 z-30 flex items-center gap-1.5 rounded-full bg-white/80 px-1.5 py-1 shadow-[0_0_6px_rgba(0,0,0,0.06)] backdrop-blur-md dark:bg-[#111] dark:shadow-[0_0_6px_rgba(0,0,0,0.3)]"
          style={{ top: "calc(0.25rem + var(--sat, 0px))" }}
        >
          <button
            onClick={onMenuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-900 dark:active:bg-gray-800"
            aria-label="Open menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="14" y2="18" />
            </svg>
          </button>
          <ClerqeLogo className="h-8 text-gray-700 dark:text-gray-300" />
        </div>

        <div className="flex h-full flex-col items-center justify-center px-6 pt-[var(--sat)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
            <Icon name="history" className="text-2xl text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-gray-900 dark:text-gray-100">Activity</h2>
          <p className="mt-1.5 max-w-[240px] text-center text-sm leading-5 text-gray-500 dark:text-gray-400">
            Your session activity and history will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
