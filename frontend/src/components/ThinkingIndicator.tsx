export function ThinkingIndicator({ text }: { text?: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-gray-500">
      <div className="flex gap-1 mt-1">
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="italic">{text || 'Thinking...'}</span>
    </div>
  );
}
