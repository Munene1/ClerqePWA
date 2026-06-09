import { formatTime } from "../utils/formatTime";

export default function EventBubble(props: {
  eventType: string;
  text: string;
  tone: "neutral" | "success" | "warning" | "error";
  createdAt: string;
}) {
  const toneClass =
    props.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : props.tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : props.tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-gray-200 bg-gray-100 text-gray-600";

  return (
    <div className="flex justify-center">
      <div className={`max-w-[90%] rounded-xl border px-3 py-2 text-xs ${toneClass}`}>
        <p className="font-medium">{props.text}</p>
        <p className="mt-1 opacity-80">
          {props.eventType} • {formatTime(props.createdAt)}
        </p>
      </div>
    </div>
  );
}

