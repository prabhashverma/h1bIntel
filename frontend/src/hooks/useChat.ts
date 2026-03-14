import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { streamChat, buildMessages } from '../api';

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: nextId(),
      role: 'user',
      content: text,
    };

    const assistantId = nextId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const apiMessages = buildMessages(
      // Use current messages (before adding new ones)
      [...messages, userMsg].filter(m => !m.isStreaming),
      text
    );
    // Remove the user msg we just added since it's in apiMessages
    apiMessages.pop();
    apiMessages.push({ role: 'user', content: text });

    try {
      for await (const event of streamChat(apiMessages)) {
        setMessages(prev =>
          prev.map(m => {
            if (m.id !== assistantId) return m;
            switch (event.event) {
              case 'thinking':
                return { ...m, thinking: event.data.text as string };
              case 'sql':
                return { ...m, sql: event.data.query as string };
              case 'result':
                return {
                  ...m,
                  resultType: event.data.resultType as ChatMessage['resultType'],
                  explanation: event.data.explanation as string,
                  data: event.data.data as Record<string, unknown>[],
                  columns: event.data.columns as string[],
                  rowCount: event.data.rowCount as number,
                  queryTime: event.data.queryTime as number,
                  content: event.data.explanation as string,
                };
              case 'error':
                return {
                  ...m,
                  content: `Error: ${event.data.message}`,
                  isStreaming: false,
                };
              case 'done':
                return { ...m, isStreaming: false };
              default:
                return m;
            }
          })
        );
      }
    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `Error: ${(err as Error).message}`, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, sendMessage, clearMessages };
}
