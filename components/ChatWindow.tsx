
import React, { useRef, useEffect } from 'react';
import { Message as MessageType } from '../types';
import { Message } from './Message';
import { LoadingSpinner } from './LoadingSpinner';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-100/50 dark:bg-gray-900/50">
      <div className="flex flex-col gap-4">
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          // Don't render the last bot message if it's empty and we're loading,
          // the spinner will be shown after the loop instead.
          if (msg.sender === 'bot' && isLastMessage && msg.text === '' && isLoading) {
            return null;
          }
          return (
            <Message
              key={msg.id}
              message={msg}
              isLastMessage={isLastMessage}
              isLoading={isLoading}
            />
          );
        })}
        
        {/* Show spinner only if the last message is an empty bot message placeholder */}
        {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'bot' && messages[messages.length - 1].text === '' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-2xl p-3 max-w-xs">
              <LoadingSpinner />
              <span className="text-sm text-gray-700 dark:text-gray-300">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
