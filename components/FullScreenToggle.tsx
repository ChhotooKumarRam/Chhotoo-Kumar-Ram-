import React from 'react';
import { Icon } from './Icon';

interface FullScreenToggleProps {
  isFullScreen: boolean;
  onToggle: () => void;
}

export const FullScreenToggle: React.FC<FullScreenToggleProps> = ({ isFullScreen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white focus:outline-none transition-colors"
      aria-label={isFullScreen ? 'Exit full-screen' : 'Enter full-screen'}
    >
      <Icon name={isFullScreen ? 'exit-fullscreen' : 'fullscreen'} />
    </button>
  );
};