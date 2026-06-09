import Icon from "./Icon";

export default function InstallPromptBanner({
  onInstall,
  onDismiss,
}: {
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-install-slide-up">
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-t-xl bg-white px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:bg-gray-900 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gray-900 text-white dark:bg-white dark:text-gray-900">
          <Icon name="install" className="text-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">Install Clerqe</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Quick access from your home screen</p>
        </div>
        <button
          onClick={onInstall}
          className="shrink-0 rounded-[6px] bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 active:scale-95 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Install
        </button>
        <button
          onClick={onDismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Dismiss"
        >
          <Icon name="close" className="text-lg" />
        </button>
      </div>
    </div>
  );
}
