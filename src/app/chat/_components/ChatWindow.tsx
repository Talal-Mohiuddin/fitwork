import React, { useRef, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { ChatMessage, JobOfferDetails, GigInviteDetails } from '@/types';

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId: string;
  onAcceptJobOffer?: (messageId: string) => void;
  onDeclineJobOffer?: (messageId: string) => void;
  onAcceptGigInvite?: (messageId: string) => void;
  onDeclineGigInvite?: (messageId: string) => void;
}

export default function ChatWindow({ 
  messages, 
  currentUserId,
  onAcceptJobOffer,
  onDeclineJobOffer,
  onAcceptGigInvite,
  onDeclineGigInvite,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex justify-center my-4">
            <span className="text-xs font-medium text-text-muted bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {date}
            </span>
          </div>

          {/* Messages for this date */}
          <div className="flex flex-col gap-4">
            {dateMessages.map((message) => (
              <div key={message.id}>
                {message.type === 'text' && (
                  <MessageText message={message} isUser={message.senderId === currentUserId} />
                )}
                {message.type === 'job_offer' && message.jobOffer && (
                  <JobOfferCard 
                    jobOffer={message.jobOffer} 
                    messageId={message.id}
                    isUser={message.senderId === currentUserId}
                    onAccept={onAcceptJobOffer}
                    onDecline={onDeclineJobOffer}
                  />
                )}
                {message.type === 'gig_invite' && message.gigInvite && (
                  <GigInviteCard 
                    gigInvite={message.gigInvite}
                    messageId={message.id}
                    isUser={message.senderId === currentUserId}
                    onAccept={onAcceptGigInvite}
                    onDecline={onDeclineGigInvite}
                  />
                )}
                {message.type === 'application_update' && (
                  <SystemMessage message={message} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function groupMessagesByDate(messages: ChatMessage[]): Record<string, ChatMessage[]> {
  const groups: Record<string, ChatMessage[]> = {};
  
  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });
  
  return groups;
}

function MessageText({ message, isUser }: { message: ChatMessage; isUser: boolean }) {
  const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={`flex gap-3 max-w-[80%] ${isUser ? 'self-end flex-row-reverse ml-auto' : ''}`}>
      {!isUser && (
        <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-8 w-8 shrink-0 mt-auto flex items-center justify-center text-xs font-bold text-white">
          {message.senderName?.charAt(0) || '?'}
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : ''}`}>
        <div
          className={`p-3 rounded-xl shadow-sm text-sm border ${
            isUser
              ? 'bg-primary text-black rounded-br-none'
              : 'bg-white dark:bg-surface-dark rounded-bl-none border-gray-100 dark:border-gray-700'
          }`}
        >
          <p>{message.content}</p>
        </div>
        <span className="text-[10px] text-text-muted">{timestamp}</span>
      </div>
    </div>
  );
}

function JobOfferCard({ 
  jobOffer, 
  messageId, 
  isUser,
  onAccept,
  onDecline,
}: { 
  jobOffer: JobOfferDetails; 
  messageId: string;
  isUser: boolean;
  onAccept?: (messageId: string) => void;
  onDecline?: (messageId: string) => void;
}) {
  const isPending = jobOffer.status === 'pending';
  const isAccepted = jobOffer.status === 'accepted';
  const isDeclined = jobOffer.status === 'declined';

  return (
    <div className="flex justify-center w-full my-2">
      <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm relative overflow-hidden group">
        {/* Left accent bar */}
        <div className={`absolute top-0 left-0 w-1 h-full ${
          isAccepted ? 'bg-green-500' : isDeclined ? 'bg-red-500' : 'bg-primary'
        }`}></div>

        {/* Header with icon */}
        <div className="flex justify-between items-start mb-3 pl-3">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">📅</span>
            <span className="font-bold text-sm uppercase tracking-wide text-text-muted">
              Job Offer
            </span>
          </div>
          <span className="text-xs bg-primary/10 text-text-main dark:text-white px-2 py-0.5 rounded font-medium border border-primary/20">
            {jobOffer.rate}
          </span>
        </div>

        {/* Content */}
        <div className="pl-3 mb-4">
          <h4 className="font-bold text-lg mb-1">{jobOffer.title}</h4>
          <p className="text-sm text-text-muted">
            {jobOffer.date} • {jobOffer.time}{jobOffer.endTime ? ` - ${jobOffer.endTime}` : ''}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {jobOffer.studio} • {jobOffer.location}
          </p>
          {jobOffer.classType && (
            <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {jobOffer.classType}
            </span>
          )}
        </div>

        {/* Status or Actions */}
        <div className="pl-3">
          {isAccepted && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Check size={18} />
              Accepted
            </div>
          )}
          {isDeclined && (
            <div className="text-red-600 text-sm font-medium">
              Declined
            </div>
          )}
          {isPending && !isUser && onAccept && onDecline && (
            <div className="flex gap-3">
              <button 
                onClick={() => onAccept(messageId)}
                className="flex-1 bg-primary hover:bg-green-400 text-black font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
              >
                Accept Gig
              </button>
              <button 
                onClick={() => onDecline(messageId)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-text-main dark:text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Decline
              </button>
            </div>
          )}
          {isPending && isUser && (
            <div className="text-sm text-text-muted italic">
              Waiting for response...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GigInviteCard({ 
  gigInvite, 
  messageId,
  isUser,
  onAccept,
  onDecline,
}: { 
  gigInvite: GigInviteDetails; 
  messageId: string;
  isUser: boolean;
  onAccept?: (messageId: string) => void;
  onDecline?: (messageId: string) => void;
}) {
  const isPending = gigInvite.status === 'pending';
  const isAccepted = gigInvite.status === 'accepted';
  const isDeclined = gigInvite.status === 'declined';

  return (
    <div className="flex justify-center w-full my-2">
      <div className="w-full max-w-md bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-surface-dark border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
        {/* Left accent bar */}
        <div className={`absolute top-0 left-0 w-1 h-full ${
          isAccepted ? 'bg-green-500' : isDeclined ? 'bg-red-500' : 'bg-orange-500'
        }`}></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-3 pl-3">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-xl">🎯</span>
            <span className="font-bold text-sm uppercase tracking-wide text-orange-600 dark:text-orange-400">
              Gig Invite
            </span>
          </div>
          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded font-medium">
            {gigInvite.rate}
          </span>
        </div>

        {/* Content */}
        <div className="pl-3 mb-4">
          <h4 className="font-bold text-lg mb-1">{gigInvite.title}</h4>
          {gigInvite.description && (
            <p className="text-sm text-text-muted mb-2">{gigInvite.description}</p>
          )}
          <p className="text-sm text-text-muted">
            {gigInvite.date} • {gigInvite.time}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {gigInvite.studio} • {gigInvite.location}
          </p>
        </div>

        {/* Status or Actions */}
        <div className="pl-3">
          {isAccepted && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Check size={18} />
              Accepted
            </div>
          )}
          {isDeclined && (
            <div className="text-red-600 text-sm font-medium">
              Declined
            </div>
          )}
          {isPending && !isUser && onAccept && onDecline && (
            <div className="flex gap-3">
              <button 
                onClick={() => onAccept(messageId)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
              >
                Accept Invite
              </button>
              <button 
                onClick={() => onDecline(messageId)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-text-main dark:text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Decline
              </button>
            </div>
          )}
          {isPending && isUser && (
            <div className="text-sm text-text-muted italic">
              Waiting for response...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-center my-2">
      <div className="bg-gray-100 dark:bg-gray-800 text-text-muted text-xs px-4 py-2 rounded-full">
        {message.content}
      </div>
    </div>
  );
}
