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

export type SaleCardItem = {
  product_id?: string;
  product_unit_id: string;
  sku: string;
  name: string;
  quantity: string | number;
  unit_price: string | number;
  line_total?: string | number;
};

export type SaleCardState = {
  actionRequestId: string;
  correlationId: string;
  status: "prepared" | "clarification" | "processing" | "completed" | "failed" | "cancelled";
  items: SaleCardItem[];
  total?: string | number;
  currency?: string;
  clarifications?: Array<{
    requested_item: string;
    quantity?: string | number;
    matches: Array<{
      product_id: string;
      product_unit_id: string;
      sku: string;
      name: string;
      price: string | number;
      available_stock?: string | number;
    }>;
  }>;
  saleId?: string;
  receiptNumber?: string;
  message?: string;
};
