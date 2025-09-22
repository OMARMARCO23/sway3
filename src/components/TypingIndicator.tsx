export function TypingIndicator() {
  return (
    <div className="flex space-x-1 px-3 py-2">
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
    </div>
  );
}