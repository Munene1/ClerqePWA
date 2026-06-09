import type { ClarificationOption } from "../types/banking";
import Icon from "./Icon";

export default function ClarificationCard(props: {
  correlationId: string;
  question: string;
  options: ClarificationOption[];
  status: "pending" | "answered";
  onSelectOption: (correlationId: string, option: ClarificationOption) => void;
}) {
  const locked = props.status === "answered";
  
  return (
    <div className="space-y-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 backdrop-blur dark:from-gray-800 dark:to-gray-700/50">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{props.question}</h3>
        </div>
        {locked && (
          <Icon name="check_circle" className="text-xl shrink-0 text-green-600 dark:text-green-400" filled />
        )}
      </div>

      {/* Options */}
      {props.options.length > 0 && (
        <div className="space-y-2">
          {props.options.map((option, idx) => (
            <button
              key={`${option.id || option.label}-${idx}`}
              disabled={locked}
              onClick={() => props.onSelectOption(props.correlationId, option)}
              className="w-full text-left rounded-[3px] bg-white/40 px-3.5 py-3 transition-all hover:bg-white/60 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gray-900/30 dark:hover:bg-gray-900/50"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-gray-50">{option.label}</div>
              {option.description && (
                <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{option.description}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Status */}
      {locked && (
        <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 pt-2">
          ✓ Answered
        </div>
      )}
    </div>
  );
}
