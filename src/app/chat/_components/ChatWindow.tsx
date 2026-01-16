import React, { useRef, useEffect } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { ChatMessage, JobOfferDetails, GigInviteDetails } from '@/types';

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId: string;
  currentUserAvatar?: string;
  otherUserAvatar?: string;
  onAcceptJobOffer?: (messageId: string) => void;
  onDeclineJobOffer?: (messageId: string) => void;
  onAcceptGigInvite?: (messageId: string) => void;
  onDeclineGigInvite?: (messageId: string) => void;
}

export default function ChatWindow({ 
  messages, 
  currentUserId,
  currentUserAvatar,
  otherUserAvatar,
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
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-gray-50">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex justify-center my-4">
            <span className="text-xs font-medium text-gray-500 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
              {date}
            </span>
          </div>

          {/* Messages for this date */}
          <div className="flex flex-col gap-4">
            {dateMessages.map((message) => (
              <div key={message.id}>
                {message.type === 'text' && (
                  <MessageText 
                    message={message} 
                    isUser={message.senderId === currentUserId}
                    userAvatar={message.senderId === currentUserId ? currentUserAvatar : otherUserAvatar}
                  />
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
        month: 'long', 
        day: 'numeric' 
      }).toUpperCase();
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });
  
  return groups;
}

function MessageText({ message, isUser, userAvatar }: { message: ChatMessage; isUser: boolean; userAvatar?: string }) {
  const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={`flex gap-3 max-w-[75%] ${isUser ? 'self-end flex-row-reverse ml-auto' : ''}`}>
      {!isUser && (
        userAvatar ? (
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full h-9 w-9 shrink-0 mt-auto"
            style={{ backgroundImage: `url(${userAvatar})` }}
          />
        ) : (
          <div className="bg-gray-200 rounded-full h-9 w-9 shrink-0 mt-auto flex items-center justify-center text-xs font-semibold text-gray-600">
            {message.senderName?.charAt(0) || '?'}
          </div>
        )
      )}

      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-gray-900 rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
          }`}
        >
          <p>{message.content}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-gray-400">{timestamp}</span>
          {isUser && message.read && (
            <CheckCheck size={14} className="text-primary" />
          )}
        </div>
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
    <div className="flex justify-center w-full my-3">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
        {/* Left accent bar */}
        <div className={`absolute top-0 left-0 w-1 h-full ${
          isAccepted ? 'bg-green-500' : isDeclined ? 'bg-red-500' : 'bg-primary'
        }`}></div>

        {/* Header with icon */}
        <div className="flex justify-between items-start mb-3 pl-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <CalendarIcon />
            </div>
            <span className="font-semibold text-xs uppercase tracking-wide text-gray-500">
              {isAccepted ? 'Booking Confirmed' : 'Confirmation Requested'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="pl-3 mb-4">
          <h4 className="font-bold text-base mb-2 text-gray-900">{jobOffer.title}</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Date</span>
              <span className="font-medium text-gray-900">{jobOffer.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Time</span>
              <span className="font-medium text-gray-900">
                {jobOffer.time}{jobOffer.endTime ? ` - ${jobOffer.endTime}` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Rate</span>
              <span className="font-medium text-primary">{jobOffer.rate}</span>
            </div>
          </div>
          {jobOffer.classType && (
            <span className="inline-block mt-3 text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
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
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Confirm
              </button>
              <button 
                onClick={() => onDecline(messageId)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                Decline
              </button>
            </div>
          )}
          {isPending && isUser && (
            <div className="text-sm text-gray-400 italic">
              Waiting for confirmation...
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
    <div className="flex justify-center w-full my-3">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
        {/* Left accent bar */}
        <div className={`absolute top-0 left-0 w-1 h-full ${
          isAccepted ? 'bg-green-500' : isDeclined ? 'bg-red-500' : 'bg-blue-500'
        }`}></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-3 pl-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center">
              <BriefcaseIcon />
            </div>
            <span className="font-semibold text-xs uppercase tracking-wide text-gray-500">
              Gig Invite
            </span>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
            {gigInvite.rate}
          </span>
        </div>

        {/* Content */}
        <div className="pl-3 mb-4">
          <h4 className="font-bold text-base mb-1 text-gray-900">{gigInvite.title}</h4>
          {gigInvite.description && (
            <p className="text-sm text-gray-500 mb-2">{gigInvite.description}</p>
          )}
          <p className="text-sm text-gray-600">
            {gigInvite.date} at {gigInvite.time}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {gigInvite.studio} - {gigInvite.location}
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
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                Accept Invite
              </button>
              <button 
                onClick={() => onDecline(messageId)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
              >
                Decline
              </button>
            </div>
          )}
          {isPending && isUser && (
            <div className="text-sm text-gray-400 italic">
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
      <div className="bg-gray-100 text-gray-500 text-xs px-4 py-2 rounded-full">
        {message.content}
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" className="text-primary"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" className="text-primary"/>
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" className="text-blue-500"/>
      <path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="currentColor" strokeWidth="2" className="text-blue-500"/>
    </svg>
  );
}
