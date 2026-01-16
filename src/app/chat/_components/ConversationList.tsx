import React from 'react';
import { Search } from 'lucide-react';

export type FilterType = 'all' | 'unread' | 'studios';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isActive: boolean;
  unread?: boolean;
  status?: 'online' | 'offline' | 'away';
  userType?: 'studio' | 'instructor';
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: ConversationListProps) {
  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Studios', value: 'studios' },
  ];

  // Filter conversations based on active filter
  const filteredConversations = conversations.filter(conv => {
    // Apply search filter
    if (searchQuery && !conv.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply tab filter
    switch (activeFilter) {
      case 'unread':
        return conv.unread === true;
      case 'studios':
        return conv.userType === 'studio';
      case 'all':
      default:
        return true;
    }
  });

  return (
    <aside className="w-80 flex flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4">Chats</h2>

        {/* Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search studios..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 py-3">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              activeFilter === filter.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            {activeFilter === 'unread' ? 'No unread messages' : 
             activeFilter === 'studios' ? 'No studio conversations' :
             'No conversations found'}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                selectedId === conv.id
                  ? 'bg-primary/10 border-l-4 border-l-primary'
                  : 'hover:bg-gray-50 border-l-4 border-l-transparent'
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {conv.avatar ? (
                  <div
                    className="bg-center bg-no-repeat bg-cover rounded-full h-11 w-11"
                    style={{ backgroundImage: `url(${conv.avatar})` }}
                  />
                ) : (
                  <div className="bg-primary/10 h-11 w-11 rounded-full flex items-center justify-center font-semibold text-primary">
                    {conv.name.charAt(0)}
                  </div>
                )}
                {conv.status === 'online' && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-primary" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`font-semibold text-sm truncate ${conv.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {conv.name}
                  </p>
                  <p className={`text-xs ${conv.unread ? 'text-primary font-medium' : 'text-gray-400'}`}>
                    {conv.timestamp}
                  </p>
                </div>
                <p className={`text-sm truncate ${conv.unread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {conv.lastMessage}
                </p>
              </div>

              {/* Unread indicator */}
              {conv.unread && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </div>
          ))
        )}
      </div>

    
    </aside>
  );
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
