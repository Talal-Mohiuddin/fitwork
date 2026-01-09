import React from 'react';
import { Search, PlusSquare } from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isActive: boolean;
  unread?: boolean;
  status?: 'online' | 'offline' | 'away';
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  const filters = ['All', 'Unread', 'Studios'];

  return (
    <aside className="w-96 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark/50">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
          <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
            <PlusSquare size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search studios or instructors"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border-none rounded-lg leading-5 bg-[#f0f4f2] dark:bg-background-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-surface-dark transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-6 py-2 overflow-x-auto no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              filter === 'All'
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-background-dark text-text-muted hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all border-l-4 ${
              selectedId === conv.id
                ? 'bg-primary/10 border-l-primary'
                : 'hover:bg-gray-50 dark:hover:bg-background-dark/50 border-l-transparent'
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              {conv.avatar ? (
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12"
                  style={{ backgroundImage: `url(${conv.avatar})` }}
                />
              ) : (
                <div className="bg-indigo-100 dark:bg-indigo-900 h-12 w-12 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">
                  {conv.name.charAt(0)}
                </div>
              )}
              {conv.status && (
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-surface-dark ${
                    conv.status === 'online'
                      ? 'bg-primary'
                      : conv.status === 'away'
                      ? 'bg-yellow-500'
                      : 'bg-gray-400'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <p className="font-semibold text-sm truncate">
                  {conv.name}
                </p>
                <p className={`text-xs font-medium ${
                  selectedId === conv.id ? 'text-primary' : 'text-text-muted'
                }`}>
                  {conv.timestamp}
                </p>
              </div>
              <p className="text-sm text-text-main dark:text-gray-300 truncate font-medium">
                {conv.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
