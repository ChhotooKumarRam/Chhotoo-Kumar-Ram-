import React, { useState, useCallback, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { CameraView } from './components/CameraView';
import { ThemeToggle } from './components/ThemeToggle';
import { TtsToggle } from './components/TtsToggle';
import { FullScreenToggle } from './components/FullScreenToggle';
import { Icon } from './components/Icon';
import { ChatHistoryPanel } from './components/ChatHistoryPanel';
import { useTheme } from './hooks/useTheme';
import { useTts } from './hooks/useTts';
import { useChatHistory } from './hooks/useChatHistory';
import { Message } from './types';
import { getChatResponseStream, getVqaResponseStream, getTextToSpeech } from './services/geminiService';
import { playAudio } from './utils/audioUtils';

type View = 'chat' | 'camera';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [view, setView] = useState<View>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);
  const { theme, toggleTheme } = useTheme();
  const { isTtsEnabled, toggleTts } = useTts();
  const {
    sessions,
    activeChat,
    setActiveChatId,
    createNewChat,
    addUserMessage,
    updateMessage,
    renameChat,
    deleteChat,
  } = useChatHistory();

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleToggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  const handleBotResponse = useCallback(async (response: string) => {
    if (!isTtsEnabled) return;
    try {
      const audioData = await getTextToSpeech(response);
      playAudio(audioData);
    } catch (error) {
      console.error('Text-to-speech failed:', error);
    }
  }, [isTtsEnabled]);
  
  const handleSendMessage = useCallback(async (text: string, image?: string) => {
    const historyForApi = activeChat?.messages || [];
    const newMessages = addUserMessage(text, image);
    if (!newMessages) return;

    const { botPlaceholder } = newMessages;

    setIsLoading(true);

    try {
      const stream = image
        ? await getVqaResponseStream(image, text)
        : await getChatResponseStream(text, historyForApi);

      let fullResponse = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullResponse += chunkText;
          updateMessage(botPlaceholder.id, fullResponse);
        }
      }
      
      if (fullResponse) {
        await handleBotResponse(fullResponse);
      }

    } catch (error) {
      console.error('Error getting response from Gemini:', error);
      const errorMessageText = 'Sorry, I encountered an error. Please try again.';
      updateMessage(botPlaceholder.id, errorMessageText);
    } finally {
      setIsLoading(false);
    }
  }, [activeChat, addUserMessage, updateMessage, handleBotResponse]);

  const handleImageSubmit = (image: string, prompt: string) => {
    handleSendMessage(prompt, image);
    setView('chat');
  };

  const handleNewChat = () => {
    createNewChat();
    setIsHistoryPanelOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setIsHistoryPanelOpen(false);
  };

  const openClasses = isFullScreen
    ? 'inset-0'
    : 'inset-0 md:inset-auto md:bottom-5 md:right-5 md:w-[400px] md:h-[600px]';
  const closedClasses = 'bottom-5 right-5 w-16 h-16';

  const borderRadiusClasses = isChatOpen
    ? isFullScreen ? 'rounded-none' : 'rounded-none md:rounded-2xl'
    : 'rounded-2xl';

  const ChatWidget = () => (
    <div className={`fixed z-50 transition-all duration-500 ease-in-out ${isChatOpen ? openClasses : closedClasses}`}>
      <div className={`relative w-full h-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-neon-blue/20 dark:shadow-neon-fuchsia/20 overflow-hidden ${borderRadiusClasses}`}>
        {isChatOpen ? (
          <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-3 md:pt-3 pt-8 border-b border-white/20 bg-clip-padding">
              <div className="flex items-center gap-2">
                <button onClick={() => setIsHistoryPanelOpen(true)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
                  <Icon name="menu" />
                </button>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-[150px]">{activeChat?.title || 'AI Assistant'}</h2>
              </div>
              <div className="flex items-center gap-2">
                <FullScreenToggle isFullScreen={isFullScreen} onToggle={handleToggleFullScreen} />
                <TtsToggle isTtsEnabled={isTtsEnabled} toggleTts={toggleTts} />
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
                  <Icon name="close" />
                </button>
              </div>
            </header>
            
            {view === 'chat' && (
              <>
                <ChatWindow messages={activeChat?.messages || []} isLoading={isLoading} />
                <ChatInput onSendMessage={handleSendMessage} onCameraClick={() => setView('camera')} />
              </>
            )}
            {view === 'camera' && (
              <CameraView onImageSubmit={handleImageSubmit} onBack={() => setView('chat')} />
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full h-full flex items-center justify-center text-white"
            aria-label="Open Chat"
          >
            <Icon name="chat" className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ChatHistoryPanel 
        isOpen={isHistoryPanelOpen}
        sessions={sessions}
        activeChatId={activeChat?.id || null}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onClose={() => setIsHistoryPanelOpen(false)}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
      />
      <ChatWidget />
    </>
  );
};

export default App;
