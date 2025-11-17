import { useState, useEffect, useCallback } from 'react';
import { ChatSession, Message } from '../types';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const initialMessage: Message = {
  id: 'init',
  text: "Hello! I'm your multimodal AI assistant. You can chat with me, talk to me, or show me images. How can I help you today?",
  sender: 'bot',
};

const CHAT_HISTORY_KEY = 'gemini-chat-history';

export const useChatHistory = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      const parsedHistory: ChatSession[] = storedHistory ? JSON.parse(storedHistory) : [];
      
      if (parsedHistory.length > 0) {
        setSessions(parsedHistory);
        const lastActiveId = localStorage.getItem(`${CHAT_HISTORY_KEY}_active`);
        setActiveChatId(lastActiveId && parsedHistory.some(s => s.id === lastActiveId) ? lastActiveId : parsedHistory[0].id);
      } else {
        const newSessionId = generateId();
        const newSession: ChatSession = {
          id: newSessionId,
          title: 'New Chat',
          messages: [initialMessage],
        };
        setSessions([newSession]);
        setActiveChatId(newSessionId);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
      const newSessionId = generateId();
      setSessions([{ id: newSessionId, title: 'New Chat', messages: [initialMessage] }]);
      setActiveChatId(newSessionId);
    }
  }, []);

  useEffect(() => {
    // Debounce localStorage writes to avoid performance issues on rapid state changes
    const handler = setTimeout(() => {
        if (sessions.length > 0) {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions));
        } else {
            // If all sessions are deleted, clear the storage
            localStorage.removeItem(CHAT_HISTORY_KEY);
        }
        if (activeChatId) {
            localStorage.setItem(`${CHAT_HISTORY_KEY}_active`, activeChatId);
        } else {
            localStorage.removeItem(`${CHAT_HISTORY_KEY}_active`);
        }
    }, 500);
    return () => clearTimeout(handler);
  }, [sessions, activeChatId]);

  const createNewChat = useCallback(() => {
    const newSessionId = generateId();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [initialMessage],
    };
    setSessions(prev => [...prev, newSession]);
    setActiveChatId(newSessionId);
  }, []);

  const addUserMessage = useCallback((text: string, image?: string) => {
    if (!activeChatId) return null;

    const userMessage: Message = { id: generateId(), text, sender: 'user', image };
    const botPlaceholder: Message = { id: generateId(), text: '', sender: 'bot' };
    
    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === activeChatId) {
          const isFirstUserMessage = !session.messages.some(m => m.sender === 'user');
          const newTitle = isFirstUserMessage 
            ? text.substring(0, 30) + (text.length > 30 ? '...' : '') 
            : session.title;
          
          return { 
            ...session, 
            title: newTitle,
            messages: [...session.messages, userMessage, botPlaceholder] 
          };
        }
        return session;
      });
    });

    return { userMessage, botPlaceholder };
  }, [activeChatId]);

  const updateMessage = useCallback((messageId: string, newText: string) => {
    if (!activeChatId) return;

    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === activeChatId) {
          const updatedMessages = session.messages.map(msg =>
            msg.id === messageId ? { ...msg, text: newText } : msg
          );
          return { ...session, messages: updatedMessages };
        }
        return session;
      });
    });
  }, [activeChatId]);

  const renameChat = useCallback((sessionId: string, newTitle: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, title: newTitle } : s
      )
    );
  }, []);

  const deleteChat = useCallback((sessionId: string) => {
    setSessions(prevSessions => {
        const remainingSessions = prevSessions.filter(s => s.id !== sessionId);

        if (remainingSessions.length === 0) {
            const newSessionId = generateId();
            const newSession: ChatSession = {
                id: newSessionId,
                title: 'New Chat',
                messages: [initialMessage],
            };
            setActiveChatId(newSessionId);
            return [newSession];
        }

        if (activeChatId === sessionId) {
            setActiveChatId(remainingSessions[remainingSessions.length - 1].id);
        }

        return remainingSessions;
    });
}, [activeChatId]);


  const activeChat = sessions.find(s => s.id === activeChatId);

  return {
    sessions,
    activeChat,
    setActiveChatId,
    createNewChat,
    addUserMessage,
    updateMessage,
    renameChat,
    deleteChat
  };
};
