import { memo } from "react";
import type { ClarificationOption, SocketConnectionState } from "../types/banking";
import type { ChatMessage } from "../types/chat";
import type { ClarificationCardState } from "../hooks/useChatMessages";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ClarificationCard from "./ClarificationCard";

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
  accessToken: string;
  onLoadOlderHistory: () => void;
  onSend: (text: string) => void;
  onReconnect: () => void;
  onSelectClarification: (correlationId: string, option: ClarificationOption) => void;
}) {
  const disabled = props.connectionState !== "connected";
  return (
    <div className="flex h-dvh items-center justify-center bg-gray-50/50 dark:bg-black">
      <div className="flex h-dvh w-full max-w-2xl flex-col overflow-hidden bg-gray-50 dark:bg-black">
        <ChatMessages
          messages={props.messages}
          loadingHistory={props.loadingHistory}
          historyMessageCount={props.historyMessageCount}
          liveMessageCount={props.liveMessageCount}
          activeStatus={props.activeStatus}
          hasActiveRun={props.hasActiveRun}
          hasOlderHistory={props.hasOlderHistory}
          loadingOlder={props.loadingOlderHistory}
          onLoadOlder={props.onLoadOlderHistory}
        />
        {props.activeClarificationCard && (
          <div className="bg-gradient-to-t from-white/80 to-transparent px-4 py-4 dark:from-black/80">
            <ClarificationCard
              correlationId={props.activeClarificationCard.correlationId}
              question={props.activeClarificationCard.question}
              options={props.activeClarificationCard.options}
              status={props.activeClarificationCard.status}
              onSelectOption={props.onSelectClarification}
            />
          </div>
        )}

        <ChatInput disabled={disabled} reconnectFailed={props.reconnectFailed} accessToken={props.accessToken} onReconnect={props.onReconnect} onSend={props.onSend} />
      </div>
    </div>
  );
});

export default ChatScreen;
