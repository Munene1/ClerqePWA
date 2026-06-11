export type SessionInfo = {
  id: string;
  channel: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  last_message: {
    id: string;
    role: string;
    content: string;
    created_at: string;
  } | null;
};

export type SessionsListPayload = {
  sessions: SessionInfo[];
  count: number;
  limit: number;
  offset: number;
};

export type SessionMessage = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export type SessionMessagesPayload = {
  session: { id: string; status: string };
  messages: SessionMessage[];
  count: number;
  limit: number;
  offset: number;
};

export type WorkflowStep = {
  id: string;
  step_name: string;
  step_status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
};

export type WorkflowToolCall = {
  id: string;
  tool_name: string;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  latency_ms: number;
};

export type Workflow = {
  id: string;
  workflow_name: string;
  workflow_status: string;
  created_at: string;
  completed_at: string | null;
  steps: WorkflowStep[];
  tool_calls: WorkflowToolCall[];
  metadata: Record<string, unknown>;
};

export type WorkflowsPayload = {
  session: { id: string; status: string };
  workflows: Workflow[];
  count: number;
};

export type SessionDetailTab = "messages" | "workflows";
