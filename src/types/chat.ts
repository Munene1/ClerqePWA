export type ChatMessage =
  | { kind: "user"; id: string; text: string; createdAt: string }
  | { kind: "assistant"; id: string; text: string; createdAt: string }
  | {
      kind: "assistant_pending";
      id: string;
      text: string;
      createdAt: string;
      correlationId?: string;
    }
  | { kind: "status"; id: string; text: string; createdAt: string }
  | { kind: "error"; id: string; text: string; createdAt: string };

export type PassengerCardState = {
  actionRequestId: string;
  correlationId: string;
  leadTraveler: { name: string; email: string | null };
  additionalPassengersNeeded: number;
  flightSummary: {
    route: string;
    departureDate: string;
    tripType: string;
    cabinClass: string;
    passengers: number;
  };
  selectedFlightId: string | null;
  status: "pending" | "submitted";
};
