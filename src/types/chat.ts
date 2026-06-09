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
