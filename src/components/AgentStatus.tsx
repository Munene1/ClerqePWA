import Icon from "./Icon";

export default function AgentStatus({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="mx-auto mb-2 max-w-4xl px-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm">
        <Icon name="autorenew" className="animate-spin text-base text-blue-600 [animation-duration:2s]" />
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:220ms]" />
        </span>
        <span>{text}</span>
      </div>
    </div>
  );
}
