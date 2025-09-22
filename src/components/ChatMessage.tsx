interface ChatMessageProps {
  role: "user" | "model";
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[70%] p-3 rounded-lg shadow ${
          isUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none"
        }`}
      >
        {content}
      </div>
    </div>
  );
};