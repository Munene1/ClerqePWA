import { useState } from "react";
import type { PassengerCardState } from "../types/chat";
import Icon from "./Icon";

export default function PassengerDetailsCard(props: {
  card: PassengerCardState;
  onSubmit: (actionRequestId: string, correlationId: string, leadTraveler: { name: string; email: string | null }, passengerNames: { name: string }[]) => void;
}) {
  const { card, onSubmit } = props;
  const locked = card.status === "submitted";

  const [leadName, setLeadName] = useState(card.leadTraveler.name);
  const [leadEmail, setLeadEmail] = useState(card.leadTraveler.email || "");
  const [passengerNames, setPassengerNames] = useState<string[]>(
    Array(card.additionalPassengersNeeded).fill("")
  );

  const allFilled = leadName.trim() && passengerNames.every((n) => n.trim());

  const handleSubmit = () => {
    if (!allFilled || locked) return;
    onSubmit(
      card.actionRequestId,
      card.correlationId,
      { name: leadName.trim(), email: leadEmail.trim() || null },
      passengerNames.map((n) => ({ name: n.trim() })),
    );
  };

  return (
    <div className="space-y-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 backdrop-blur dark:from-gray-800 dark:to-gray-700/50">
      {/* Flight Summary */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">Passenger Details</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {card.flightSummary.route} · {card.flightSummary.departureDate} · {card.flightSummary.passengers} passenger{card.flightSummary.passengers > 1 ? "s" : ""}
          </p>
        </div>
        {locked && (
          <Icon name="check_circle" className="text-xl shrink-0 text-green-600 dark:text-green-400" filled />
        )}
      </div>

      {/* Lead Traveler */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Lead Traveler (you)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
            disabled={locked}
            placeholder="Full name"
            className="flex-1 rounded-[3px] border border-gray-200 bg-white/40 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-900/30 dark:text-gray-100 dark:placeholder-gray-500"
          />
          <input
            type="email"
            value={leadEmail}
            onChange={(e) => setLeadEmail(e.target.value)}
            disabled={locked}
            placeholder="Email"
            className="flex-1 rounded-[3px] border border-gray-200 bg-white/40 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-900/30 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* Additional Passengers */}
      {card.additionalPassengersNeeded > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Additional Passengers ({card.additionalPassengersNeeded})
          </label>
          {passengerNames.map((name, idx) => (
            <input
              key={idx}
              type="text"
              value={name}
              onChange={(e) => {
                const next = [...passengerNames];
                next[idx] = e.target.value;
                setPassengerNames(next);
              }}
              disabled={locked}
              placeholder={`Passenger ${idx + 2} name`}
              className="w-full rounded-[3px] border border-gray-200 bg-white/40 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-900/30 dark:text-gray-100 dark:placeholder-gray-500"
            />
          ))}
        </div>
      )}

      {/* Submit */}
      {!locked && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className="w-full rounded-[3px] bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Booking
        </button>
      )}

      {locked && (
        <div className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 pt-2">
          ✓ Submitted
        </div>
      )}
    </div>
  );
}
