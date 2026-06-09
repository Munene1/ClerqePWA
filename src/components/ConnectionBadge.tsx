import type { SocketConnectionState } from "../types/banking";
import Icon from "./Icon";

export default function ConnectionBadge({ state }: { state: SocketConnectionState }) {
  const map: Record<string, string> = {
    connected: "Connected",
    connecting: "Connecting",
    reconnecting: "Reconnecting",
    disconnected: "Offline",
    reconnect_failed: "Offline",
    error: "Error",
    closed: "Offline",
    idle: "Offline",
  };
  const color =
    state === "connected"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : state === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-gray-200 bg-gray-50 text-gray-700";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}>
      <Icon name={state === "connected" ? "wifi" : "wifi_off"} className="text-base" />
      <span className={`h-1.5 w-1.5 rounded-full ${state === "connected" ? "bg-emerald-500" : state === "error" ? "bg-red-500" : "bg-gray-400"} ${state === "connected" || state === "reconnecting" || state === "connecting" ? "animate-pulse" : ""}`} />
      {map[state]}
    </span>
  );
}
