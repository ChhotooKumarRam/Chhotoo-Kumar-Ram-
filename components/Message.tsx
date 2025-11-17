
import React from 'react';
import { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  isLastMessage?: boolean;
  isLoading?: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, isLastMessage, isLoading }) => {
  const isUser = message.sender === 'user';
  // A message is streaming if it's the last one, from the bot, and the API is loading.
  const isStreaming = !isUser && isLastMessage && isLoading;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex flex-col gap-2 max-w-xs md:max-w-md p-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-neon-blue to-blue-700 text-white'
            : 'bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/10 text-gray-800 dark:text-gray-200'
        }`}
      >
        {message.image && (
          <img
            src={message.image}
            alt="User upload"
            className="rounded-lg max-h-48 w-full object-cover"
          />
        )}
        <p className="text-sm break-words">
          {message.text}
          {isStreaming && <span className="inline-block w-2 h-4 bg-gray-800 dark:bg-gray-200 animate-pulse ml-1 align-bottom" />}
        </p>
      </div>
    </div>
  );
};
