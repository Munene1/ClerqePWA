import { useCallback, useState } from "react";
import type { BankingEvent } from "../types/events";

export interface FeedbackState {
  toolType: string;
  rating: number | null;
  whatWorked: string[];
  whatWouldSwitch: string[];
  competitiveChoice: string;
}

export function useFeedback(_lastEvent: BankingEvent | null) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const requestFeedback = useCallback((toolType: string) => {
    setFeedback({
      toolType,
      rating: null,
      whatWorked: [],
      whatWouldSwitch: [],
      competitiveChoice: "",
    });
  }, []);

  const setRating = useCallback((rating: number) => {
    setFeedback((prev) => (prev ? { ...prev, rating } : null));
  }, []);

  const toggleWhatWorked = useCallback((option: string) => {
    setFeedback((prev) => {
      if (!prev) return null;
      const next = prev.whatWorked.includes(option)
        ? prev.whatWorked.filter((o) => o !== option)
        : [...prev.whatWorked, option];
      return { ...prev, whatWorked: next };
    });
  }, []);

  const toggleWhatWouldSwitch = useCallback((option: string) => {
    setFeedback((prev) => {
      if (!prev) return null;
      const next = prev.whatWouldSwitch.includes(option)
        ? prev.whatWouldSwitch.filter((o) => o !== option)
        : [...prev.whatWouldSwitch, option];
      return { ...prev, whatWouldSwitch: next };
    });
  }, []);

  const setCompetitiveChoice = useCallback((choice: string) => {
    setFeedback((prev) => (prev ? { ...prev, competitiveChoice: choice } : null));
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    feedback,
    requestFeedback,
    setRating,
    toggleWhatWorked,
    toggleWhatWouldSwitch,
    setCompetitiveChoice,
    clearFeedback,
  };
}
