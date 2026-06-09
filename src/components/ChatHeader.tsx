import { useMemo } from "react";
import type { SocketConnectionState } from "../types/banking";

export default function ChatHeader({
  connectionState,
}: {
  connectionState: SocketConnectionState;
}) {
  const connection = useMemo(() => {
    if (connectionState === "connected") {
      return { label: "Connected", dot: "bg-emerald-500" };
    }
    if (connectionState === "error" || connectionState === "reconnect_failed") {
      return { label: "Disconnected", dot: "bg-red-500" };
    }
    if (connectionState === "connecting" || connectionState === "reconnecting") {
      return { label: "Connecting", dot: "bg-amber-500" };
    }
    return { label: "Offline", dot: "bg-gray-400" };
  }, [connectionState]);

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-black/95">
      <div className="flex items-center justify-center px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${connection.dot}`} />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Clerqe</h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">{connection.label}</span>
        </div>
      </div>
    </header>
  );
}
