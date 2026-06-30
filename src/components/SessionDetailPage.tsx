import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { SessionMessage, Workflow, WorkflowStep, WorkflowToolCall } from "../types/sessions";
import type { BankingEvent } from "../types/events";
import Icon from "./Icon";
import MarkdownRenderer from "./MarkdownRenderer";
import { formatTime } from "../utils/formatTime";

type Props = {
  lastEvent: BankingEvent | null;
  onLoadSessionMessages: (sessionId: string) => void;
  onLoadSessionWorkflows: (sessionId: string) => void;
  selectedSessionMessages: SessionMessage[];
  selectedSessionWorkflows: Workflow[];
  dataLoading: boolean;
  onResetSessionData: () => void;
};

export default function SessionDetailPage(props: Props) {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    if (loadedRef.current === sessionId) return;
    loadedRef.current = sessionId;
    props.onResetSessionData();
    props.onLoadSessionWorkflows(sessionId);
    props.onLoadSessionMessages(sessionId);
  }, [sessionId]);

  const toggleWorkflow = (id: string) => {
    setExpandedWorkflow((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex h-dvh flex-col bg-gray-100 dark:bg-[#080808]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto pb-6">
          {/* top spacer for shell overlay */}
          <div className="h-12" />

          {props.dataLoading && props.selectedSessionWorkflows.length === 0 && props.selectedSessionMessages.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-400" />
            </div>
          )}

          {/* Workflows */}
          <div className="space-y-2 px-4">
            {props.selectedSessionWorkflows.length > 0 && (
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Workflows
              </p>
            )}
            {props.selectedSessionWorkflows.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                expanded={expandedWorkflow === wf.id}
                onToggle={() => toggleWorkflow(wf.id)}
              />
            ))}
          </div>

          {/* Messages */}
          <div className="mt-6 space-y-4 px-5">
            {props.selectedSessionMessages.length > 0 && props.selectedSessionWorkflows.length > 0 && (
              <div className="relative flex items-center py-1">
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
                <span className="mx-4 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                  Chat transcript
                </span>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              </div>
            )}
            {props.selectedSessionMessages.length === 0 && !props.dataLoading && (
              <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                No messages in this session.
              </p>
            )}
            {props.selectedSessionMessages.map((msg) => {
              const mine = msg.role === "customer";
              return (
                <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`flex flex-col gap-0.5 ${mine ? "max-w-[88%]" : "w-full"}`}>
                    <div className={`flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 ${mine ? "justify-end pr-0.5" : "justify-start"}`}>
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        {mine ? "You" : "Clerqe"}
                      </span>
                      <span>{formatTime(msg.created_at)}</span>
                    </div>
                    <div className={`flex ${mine ? "justify-end" : ""} items-center gap-2`}>
                      <div className={mine ? "rounded-[6px] bg-[#35998B] px-2.5 py-[7px] !text-white dark:bg-[#2D8A7D]" : "bg-transparent text-gray-800 dark:text-gray-100"}>
                        {mine ? (
                          <p className="whitespace-pre-wrap text-[15px] leading-6">{msg.content}</p>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowCard({
  workflow,
  expanded,
  onToggle,
}: {
  workflow: Workflow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusColor =
    workflow.workflow_status === "completed"
      ? "text-green-600 dark:text-green-400"
      : workflow.workflow_status === "failed"
        ? "text-red-600 dark:text-red-400"
        : "text-amber-600 dark:text-amber-400";

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#111]">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
      >
        <Icon
          name="account_tree"
          className={`text-base text-gray-400 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
            {workflow.workflow_name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(workflow.created_at).toLocaleString()}
          </p>
        </div>
        <span className={`text-xs font-medium capitalize ${statusColor}`}>
          {workflow.workflow_status}
        </span>
        <Icon
          name={expanded ? "expand_less" : "expand_more"}
          className="text-base text-gray-400"
        />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          {workflow.steps.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Steps
              </p>
              <div className="space-y-1.5">
                {workflow.steps.map((step, i) => (
                  <StepItem key={step.id} step={step} index={i} />
                ))}
              </div>
            </div>
          )}

          {workflow.tool_calls.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Tool calls
              </p>
              <div className="space-y-1.5">
                {workflow.tool_calls.map((tc) => (
                  <ToolCallItem key={tc.id} toolCall={tc} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepItem({ step, index }: { step: WorkflowStep; index: number }) {
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-[#1a1a1a]">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-[10px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
          {index + 1}
        </span>
        <p className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {step.step_name}
        </p>
        <span
          className={`text-[11px] font-medium capitalize ${
            step.step_status === "completed"
              ? "text-green-600 dark:text-green-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {step.step_status}
        </span>
      </div>
    </div>
  );
}

function ToolCallItem({ toolCall }: { toolCall: WorkflowToolCall }) {
  const [showInput, setShowInput] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-[#1a1a1a]">
      <div className="flex items-center gap-2">
        <Icon name="build" className="text-sm text-gray-400" />
        <p className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {toolCall.tool_name}
        </p>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          {toolCall.latency_ms}ms
        </span>
        <span
          className={`text-[11px] font-medium capitalize ${
            toolCall.status === "completed"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {toolCall.status}
        </span>
      </div>

      <div className="mt-1.5 flex gap-2">
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-[11px] text-gray-400 underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showInput ? "Hide input" : "Show input"}
        </button>
        <button
          onClick={() => setShowOutput(!showOutput)}
          className="text-[11px] text-gray-400 underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showOutput ? "Hide output" : "Show output"}
        </button>
      </div>

      {showInput && (
        <pre className="mt-1.5 overflow-x-auto rounded bg-gray-100 p-2 text-[11px] text-gray-600 dark:bg-gray-900 dark:text-gray-400">
          {JSON.stringify(toolCall.input, null, 2)}
        </pre>
      )}
      {showOutput && (
        <pre className="mt-1.5 overflow-x-auto rounded bg-gray-100 p-2 text-[11px] text-gray-600 dark:bg-gray-900 dark:text-gray-400">
          {JSON.stringify(toolCall.output, null, 2)}
        </pre>
      )}
    </div>
  );
}
