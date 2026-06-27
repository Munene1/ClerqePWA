import { memo } from "react";
import type { ClarificationOption, SocketConnectionState } from "../types/banking";
import type { ChatMessage } from "../types/chat";
import type { ClarificationCardState, FeedbackCardState } from "../hooks/useChatMessages";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ClarificationCard from "./ClarificationCard";
import FeedbackCard from "./FeedbackCard";

const TOOL_LABELS: Record<string, string> = {
  send_money: "send money",
  pay_bill: "pay bill",
  request_statement: "request a statement",
  list_recent_transactions: "view transactions",
  get_account_balance: "check your balance",
  get_accounts: "view accounts",
  summarize_spending: "summarize spending",
  create_payout_batch: "set up a payout",
};

const WHAT_WORKED_OPTIONS = [
  "Faster than opening an app or USSD",
  "Didn't need to leave the chat",
  "I just said what I wanted — no menus",
  "Clear confirmation at each step",
  "Felt secure with the checks",
];

const WHAT_WOULD_SWITCH_OPTIONS = [
  "More banks and providers supported",
  "Lower transaction fees",
  "Support for M-Pesa, cards, and bank transfers",
  "Real-time transaction notifications",
  "Voice input in Swahili/Sheng",
  "Nothing — I'd use it as-is",
];

const COMPETITIVE_CHOICES = [
  "I'd use Clerqe instead of my banking app",
  "I'd use Clerqe instead of USSD",
  "I'd use Clerqe instead of going to the branch",
  "I'd use Clerqe for some things, my app for others",
  "I'd stick with what I have now",
];

const ChatScreen = memo(function ChatScreen(props: {
  connectionState: SocketConnectionState;
  reconnectFailed: boolean;
  loadingHistory: boolean;
  messages: ChatMessage[];
  historyMessageCount: number;
  liveMessageCount: number;
  activeStatus: string | null;
  hasActiveRun: boolean;
  hasOlderHistory: boolean;
  loadingOlderHistory: boolean;
  activeClarificationCard: ClarificationCardState | null;
  activeFeedback: FeedbackCardState | null;
  accessToken: string;
  feedbackRating: number | null;
  feedbackWhatWorked: string[];
  feedbackWhatWouldSwitch: string[];
  feedbackCompetitiveChoice: string;
  onLoadOlderHistory: () => void;
  onSend: (text: string) => void;
  onReconnect: () => void;
  onSelectClarification: (correlationId: string, option: ClarificationOption) => void;
  onSetFeedbackRating: (rating: number) => void;
  onToggleFeedbackWhatWorked: (option: string) => void;
  onToggleFeedbackWhatWouldSwitch: (option: string) => void;
  onSetFeedbackCompetitiveChoice: (choice: string) => void;
  onSubmitFeedback: () => void;
}) {
  const disabled = props.connectionState !== "connected";
  const criticalError = props.reconnectFailed ? "Unable to connect to Clerqe. Check your connection and try again." : null;
  return (
    <div className="flex h-dvh items-center justify-center bg-gray-100 dark:bg-[#080808]">
      <div className="flex h-dvh w-full max-w-2xl flex-col overflow-hidden bg-gray-100 dark:bg-[#080808]">
        <ChatMessages
          messages={props.messages}
          loadingHistory={props.loadingHistory}
          criticalError={criticalError}
          historyMessageCount={props.historyMessageCount}
          liveMessageCount={props.liveMessageCount}
          activeStatus={props.activeStatus}
          hasActiveRun={props.hasActiveRun}
          hasOlderHistory={props.hasOlderHistory}
          loadingOlder={props.loadingOlderHistory}
          onLoadOlder={props.onLoadOlderHistory}
        />
        {props.activeClarificationCard && (
          <div className="animate-fade-slide-in bg-gradient-to-t from-white/80 to-transparent px-4 py-4 dark:from-black/80">
            <ClarificationCard
              correlationId={props.activeClarificationCard.correlationId}
              question={props.activeClarificationCard.question}
              options={props.activeClarificationCard.options}
              status={props.activeClarificationCard.status}
              onSelectOption={props.onSelectClarification}
            />
          </div>
        )}
        {props.activeFeedback && !props.activeFeedback.submitted && (
          <div className="animate-fade-slide-in bg-gradient-to-t from-white/80 to-transparent px-4 py-4 dark:from-black/80">
            <FeedbackCard
              toolType={props.activeFeedback.toolType}
              toolLabel={TOOL_LABELS[props.activeFeedback.toolType] || props.activeFeedback.toolType}
              rating={props.feedbackRating}
              whatWorked={props.feedbackWhatWorked}
              whatWouldSwitch={props.feedbackWhatWouldSwitch}
              competitiveChoice={props.feedbackCompetitiveChoice}
              whatWorkedOptions={WHAT_WORKED_OPTIONS}
              whatWouldSwitchOptions={WHAT_WOULD_SWITCH_OPTIONS}
              competitiveChoices={COMPETITIVE_CHOICES}
              submitted={false}
              onSetRating={props.onSetFeedbackRating}
              onToggleWhatWorked={props.onToggleFeedbackWhatWorked}
              onToggleWhatWouldSwitch={props.onToggleFeedbackWhatWouldSwitch}
              onSetCompetitiveChoice={props.onSetFeedbackCompetitiveChoice}
              onSubmit={props.onSubmitFeedback}
              onDismiss={() => {}}
            />
          </div>
        )}
        {props.activeFeedback?.submitted && (
          <div className="animate-fade-slide-in px-4 py-4">
            <FeedbackCard
              toolType={props.activeFeedback.toolType}
              toolLabel={TOOL_LABELS[props.activeFeedback.toolType] || props.activeFeedback.toolType}
              rating={props.feedbackRating}
              whatWorked={props.feedbackWhatWorked}
              whatWouldSwitch={props.feedbackWhatWouldSwitch}
              competitiveChoice={props.feedbackCompetitiveChoice}
              whatWorkedOptions={WHAT_WORKED_OPTIONS}
              whatWouldSwitchOptions={WHAT_WOULD_SWITCH_OPTIONS}
              competitiveChoices={COMPETITIVE_CHOICES}
              submitted={true}
              onSetRating={() => {}}
              onToggleWhatWorked={() => {}}
              onToggleWhatWouldSwitch={() => {}}
              onSetCompetitiveChoice={() => {}}
              onSubmit={() => {}}
              onDismiss={() => {}}
            />
          </div>
        )}

        <ChatInput disabled={disabled} reconnectFailed={props.reconnectFailed} accessToken={props.accessToken} onReconnect={props.onReconnect} onSend={props.onSend} />
      </div>
    </div>
  );
});

export default ChatScreen;
