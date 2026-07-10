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

const TOTAL_STEPS = 4;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <span
          key={i}
          className={`rounded-full transition-all ${
            i < current
              ? "w-4 h-1.5 bg-[var(--brand-primary)]"
              : i === current
                ? "w-4 h-1.5 bg-gray-300 dark:bg-gray-600"
                : "w-1.5 h-1.5 bg-gray-200 dark:bg-gray-800"
          }`}
        />
      ))}
    </div>
  );
}

function StepLabel({ step }: { step: number }) {
  const labels = [
    "How would you rate it compared to your usual way?",
    "What made it better?",
    "What would make you switch for good?",
    "Would you choose Clerqe over...?",
  ];
  return (
    <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{labels[step]}</p>
  );
}

export default function FeedbackCard(props: FeedbackCardProps) {
  const [step, setStep] = useState(0);

  const canAdvance =
    step === 0 ? props.rating !== null
    : step === 1 ? props.whatWorked.length > 0
    : step === 2 ? props.whatWouldSwitch.length > 0
    : props.competitiveChoice !== "";

  function goNext() {
    if (canAdvance && step < TOTAL_STEPS - 1) setStep(step + 1);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

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
    <div className="flex flex-col rounded-[8px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/50">
      {/* Header — fixed */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          How was your {props.toolLabel} experience?
        </h3>
        <StepIndicator current={step} />
      </div>

      {/* Content — scrollable */}
      <div className="overflow-y-auto no-scrollbar px-4 py-4" style={{ maxHeight: "50vh" }}>
        <StepLabel step={step} />

        {step === 0 && (
          <div className="flex gap-2">
            {RATING_EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => props.onSetRating(i + 1)}
                className={`flex flex-1 flex-col items-center rounded-[6px] px-3 py-3 text-2xl transition-all ${
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
        )}

        {step === 1 && (
          <div className="space-y-1">
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

        {step === 2 && (
          <div className="space-y-1">
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

        {step === 3 && (
          <div className="space-y-1">
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

      {/* Navigation — fixed */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
        <button
          onClick={goBack}
          disabled={step === 0}
          className="flex items-center gap-1 rounded-[3px] px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:invisible dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Icon name="arrow_back" className="text-sm" />
          Back
        </button>

        <span className="text-xs text-gray-400 dark:text-gray-500">
          {step + 1} / {TOTAL_STEPS}
        </span>

        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={goNext}
            disabled={!canAdvance}
            className="flex items-center gap-1 rounded-[3px] bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <Icon name="arrow_forward" className="text-sm" />
          </button>
        ) : (
          <button
            onClick={props.onSubmit}
            disabled={!canAdvance}
            className="flex items-center gap-1 rounded-[3px] bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="check_circle" className="text-sm" />
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
