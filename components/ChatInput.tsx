import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onCameraClick: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onCameraClick }) => {
  const [input, setInput] = useState('');
  const { isListening, transcript, startListening, stopListening, error } = useSpeechToText();
  const speechToTextActive = useRef(false);
  const [micError, setMicError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setMicError("Mic error. Please check permissions and try again.");
      const timer = setTimeout(() => setMicError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    // Only update input from transcript if the user initiated speech-to-text
    // and hasn't manually typed since. This prevents overwriting manual edits.
    if (speechToTextActive.current) {
      setInput(transcript);
    }
  }, [transcript]);
  
  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      if (isListening) {
        stopListening();
      }
      speechToTextActive.current = false;
    }
  };

  const handleMicClick = () => {
    setMicError(null); // Clear previous errors
    if (isListening) {
      stopListening();
      speechToTextActive.current = false;
    } else {
      setInput(''); // Clear previous text to start fresh
      speechToTextActive.current = true;
      startListening();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // When the user types, they take control. Stop STT from updating the input.
    speechToTextActive.current = false;
    setInput(e.target.value);
  }

  return (
    <div className="p-3 md:pb-3 pb-8 border-t border-white/20 bg-clip-padding relative">
      {micError && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-red-500 text-white text-xs rounded-md px-3 py-1 shadow-lg z-10">
          {micError}
        </div>
      )}
      <div className="flex items-center gap-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-full p-1">
        <button
          onClick={onCameraClick}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-neon-blue dark:hover:text-neon-blue transition-colors rounded-full"
          aria-label="Open Camera"
        >
          <Icon name="camera" />
        </button>
        <button
          onClick={handleMicClick}
          className={`p-2 rounded-full transition-all duration-300 ${
            isListening
              ? 'text-red-500 animate-pulse shadow-neon-red bg-red-500/10'
              : 'text-gray-600 dark:text-gray-300 hover:text-neon-fuchsia dark:hover:text-neon-fuchsia'
          }`}
          aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
        >
          <Icon name="mic" />
        </button>
        <input
          type="text"
          value={input}
          onChange={handleInputChange} // Switched to custom handler
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? 'Listening...' : "Type a message..."}
          className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 dark:text-white px-2"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-gradient-to-br from-neon-blue to-neon-fuchsia rounded-full text-white disabled:opacity-50 transition-opacity"
          disabled={!input.trim()}
          aria-label="Send Message"
        >
          <Icon name="send" />
        </button>
      </div>
    </div>
  );
};