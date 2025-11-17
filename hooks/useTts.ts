
import { useState, useEffect, useCallback } from 'react';

export const useTts = () => {
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);

  useEffect(() => {
    const storedTtsPref = localStorage.getItem('tts-enabled');
    // Default to true if no preference is stored
    setIsTtsEnabled(storedTtsPref ? JSON.parse(storedTtsPref) : true);
  }, []);

  const toggleTts = useCallback(() => {
    setIsTtsEnabled(prev => {
      const newState = !prev;
      localStorage.setItem('tts-enabled', JSON.stringify(newState));
      return newState;
    });
  }, []);

  return { isTtsEnabled, toggleTts };
};
