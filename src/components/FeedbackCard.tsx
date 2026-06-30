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

type Step = "rating" | "worked" | "switch" | "competitive" | "submit";

export default function FeedbackCard(props: FeedbackCardProps) {
  const [step, setStep] = useState<Step>("rating");

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

  const handleNext = () => {
    if (step === "rating" && props.rating !== null) setStep("worked");
    else if (step === "worked") setStep("switch");
    else if (step === "switch") setStep("competitive");
    else if (step === "competitive") setStep("submit");
  };

  const handleBack = () => {
    if (step === "worked") setStep("rating");
    else if (step === "switch") setStep("worked");
    else if (step === "competitive") setStep("switch");
    else if (step === "submit") setStep("competitive");
  };

  return (
    <div className="rounded-[8px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          How was your {props.toolLabel} experience?
        </h3>
      </div>

      {/* Step indicator */}
      <div className="mb-3 flex gap-1">
        {(["rating", "worked", "switch", "competitive"] as Step[]).map((s, idx) => {
          const active = step === s || (["rating", "worked", "switch", "competitive"].indexOf(step) > idx && step !== "rating");
          const current = step === s;
          return (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                current ? "bg-[var(--brand-primary)]" : active ? "bg-[var(--brand-primary)]/40" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          );
        })}
      </div>

      {/* Q1: Rating */}
      {step === "rating" && (
        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Compared to your usual banking app or USSD, how was this?</p>
          <div className="flex gap-2">
            {RATING_EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => { props.onSetRating(i + 1); }}
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
          {props.rating !== null && (
            <div className="mt-3 flex justify-end">
              <button onClick={handleNext} className="rounded-[3px] bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)]">
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Q2: What worked well */}
      {step === "worked" && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">What made it better?</p>
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
          <div className="mt-3 flex justify-between">
            <button onClick={handleBack} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Back</button>
            <button onClick={handleNext} className="rounded-[3px] bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)]">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Q3: What would make you switch */}
      {step === "switch" && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">What would make you switch for good?</p>
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
          <div className="mt-3 flex justify-between">
            <button onClick={handleBack} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Back</button>
            <button onClick={handleNext} className="rounded-[3px] bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)]">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Q4: Competitive choice */}
      {step === "competitive" && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Would you choose Clerqe over...?</p>
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
          <div className="mt-3 flex justify-between">
            <button onClick={handleBack} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Back</button>
            {props.competitiveChoice && (
              <button onClick={handleNext} className="rounded-[3px] bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)]">
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      {step === "submit" && (
        <div className="mb-4">
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Ready to share your feedback?</p>
          <div className="flex gap-2">
            <button onClick={handleBack} className="flex-1 rounded-[3px] border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800">
              Back
            </button>
            <button
              onClick={props.onSubmit}
              className="flex-1 rounded-[3px] bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)]"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
