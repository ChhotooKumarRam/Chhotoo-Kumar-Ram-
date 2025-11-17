import React, { useState, useEffect } from 'react';
import { ChatSession } from '../types';
import { Icon } from './Icon';

interface ChatHistoryPanelProps {
  isOpen: boolean;
  sessions: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
}

export const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  isOpen,
  sessions,
  activeChatId,
  onSelectChat,
  onNewChat,
  onClose,
  onRenameChat,
  onDeleteChat,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    // If panel is closed, cancel any ongoing edit
    if (!isOpen) {
      setEditingId(null);
    }
  }, [isOpen]);

  const handleRenameStart = (session: ChatSession) => {
    setEditingId(session.id);
    setNewTitle(session.title);
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setNewTitle('');
  };

  const handleRenameSubmit = () => {
    if (editingId && newTitle.trim()) {
      onRenameChat(editingId, newTitle.trim());
    }
    handleRenameCancel();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleDelete = (sessionId: string, sessionTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${sessionTitle}"? This action cannot be undone.`)) {
      onDeleteChat(sessionId);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[59] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-lg border-r border-white/10 p-4 z-60 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Chat History</h2>
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/40 text-blue-600 dark:text-blue-300 rounded-lg transition-colors"
          >
            <Icon name="plus" className="w-4 h-4" />
            New
          </button>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto h-[calc(100%-4rem)]">
          {[...sessions].reverse().map(session => (
            <div key={session.id} className="group relative rounded-lg">
              {editingId === session.id ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 pr-14 rounded-lg text-sm bg-blue-500/30 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <>
                  <button
                    onClick={() => onSelectChat(session.id)}
                    className={`w-full text-left p-2 rounded-lg text-sm truncate transition-colors ${
                      session.id === activeChatId
                        ? 'bg-blue-500/30 text-gray-900 dark:text-white'
                        : 'hover:bg-gray-500/10 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {session.title}
                  </button>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0 bg-gray-200/50 dark:bg-gray-800/50 rounded-full">
                    <button
                      onClick={() => handleRenameStart(session)}
                      className="p-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                      aria-label="Rename chat"
                    >
                      <Icon name="pencil" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id, session.title)}
                      className="p-1 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                      aria-label="Delete chat"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
