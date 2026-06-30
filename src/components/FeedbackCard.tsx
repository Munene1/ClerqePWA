import { useState } from "react";
import Icon from "./Icon";

interface FeedbackCardProps {
  toolType: string;
  toolLabel: string;
  rating: number | null;
  whatWorked: string[];
  whatWouldSwitch: string[];
  competitiveChoice: string;
  whatWorkedOptions: string[];
  whatWouldSwitchOptions: string[];
  competitiveChoices: string[];
  submitted: boolean;
  onSetRating: (rating: number) => void;
  onToggleWhatWorked: (option: string) => void;
  onToggleWhatWouldSwitch: (option: string) => void;
  onSetCompetitiveChoice: (choice: string) => void;
  onSubmit: () => void;
  onDismiss: () => void;
}

const RATING_EMOJIS = ["😞", "😐", "😊", "🤩"];
const RATING_LABELS = ["Harder", "Same", "Easier", "Way easier"];

export default function FeedbackCard(props: FeedbackCardProps) {
  const [expanded, setExpanded] = useState(true);

  if (props.submitted) {
    return (
      <div className="rounded-[8px] border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Icon name="check_circle" className="text-lg" />
          <span className="text-sm font-medium">Thanks for your feedback!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          How was your {props.toolLabel} experience?
        </h3>
      </div>

      {/* Q1: Rating */}
      <div className="mb-4">
        <div className="flex gap-2">
          {RATING_EMOJIS.map((emoji, i) => (
            <button
              key={i}
              onClick={() => props.onSetRating(i + 1)}
              className={`flex flex-col items-center rounded-[6px] px-3 py-2 text-2xl transition-all ${
                props.rating === i + 1
                  ? "bg-[var(--brand-primary)]/10 ring-2 ring-[var(--brand-primary)]"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              }`}
            >
              <span>{emoji}</span>
              <span className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{RATING_LABELS[i]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expandable sections */}
      {props.rating !== null && (
        <div className="space-y-3">
          {/* Q2: What worked well */}
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between text-left text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span>What made it better?</span>
              <Icon name={expanded ? "expand_less" : "expand_more"} className="text-gray-400" />
            </button>
            {expanded && (
              <div className="mt-2 space-y-1">
                {props.whatWorkedOptions.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={props.whatWorked.includes(option)}
                      onChange={() => props.onToggleWhatWorked(option)}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Q3: What would make you switch */}
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between text-left text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span>What would make you switch for good?</span>
              <Icon name={expanded ? "expand_less" : "expand_more"} className="text-gray-400" />
            </button>
            {expanded && (
              <div className="mt-2 space-y-1">
                {props.whatWouldSwitchOptions.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={props.whatWouldSwitch.includes(option)}
                      onChange={() => props.onToggleWhatWouldSwitch(option)}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Q4: Competitive choice */}
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between text-left text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span>Would you choose Clerqe over...?</span>
              <Icon name={expanded ? "expand_less" : "expand_more"} className="text-gray-400" />
            </button>
            {expanded && (
              <div className="mt-2 space-y-1">
                {props.competitiveChoices.map((choice) => (
                  <label
                    key={choice}
                    className="flex cursor-pointer items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
                  >
                    <input
                      type="radio"
                      name="competitive_choice"
                      checked={props.competitiveChoice === choice}
                      onChange={() => props.onSetCompetitiveChoice(choice)}
                      className="h-4 w-4 border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                    />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={props.onSubmit}
              disabled={!props.rating}
              className="flex-1 rounded-[3px] bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
