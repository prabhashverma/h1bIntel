import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';
import { SuggestedQueries } from './SuggestedQueries';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSuggestedSelect: (q: string) => void;
}

export function ChatPanel({ messages, onSuggestedSelect }: ChatPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return <SuggestedQueries onSelect={onSuggestedSelect} />;
  }

  return (
    <div className="flex flex-col gap-1 py-4">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
