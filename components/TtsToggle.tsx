
import React from 'react';
import { Icon } from './Icon';

interface TtsToggleProps {
  isTtsEnabled: boolean;
  toggleTts: () => void;
}

export const TtsToggle: React.FC<TtsToggleProps> = ({ isTtsEnabled, toggleTts }) => {
  return (
    <button
      onClick={toggleTts}
      className="p-2 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white focus:outline-none transition-colors"
      aria-label={`Turn voice output ${isTtsEnabled ? 'off' : 'on'}`}
    >
      {isTtsEnabled ? <Icon name="volume-up" /> : <Icon name="volume-off" />}
    </button>
  );
};
