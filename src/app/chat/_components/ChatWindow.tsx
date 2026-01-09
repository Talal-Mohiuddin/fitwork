import React from 'react';
import { Check } from 'lucide-react';

interface JobOffer {
  title: string;
  date: string;
  time: string;
  location: string;
  studio: string;
  rate: string;
}

interface Message {
  id: string;
  sender: 'user' | 'other';
  content: string;
  timestamp: string;
  type: 'text' | 'job-offer';
  jobOffer?: JobOffer;
}

interface ChatWindowProps {
  messages: Message[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
      {/* Date Separator */}
      <div className="flex justify-center my-4">
        <span className="text-xs font-medium text-text-muted bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          Today
        </span>
      </div>

      {/* Messages */}
      {messages.map((message) => (
        <div key={message.id}>
          {message.type === 'text' ? (
            <MessageText message={message} />
          ) : (
            <JobOfferCard jobOffer={message.jobOffer!} />
          )}
        </div>
      ))}
    </div>
  );
}

function MessageText({ message }: { message: Message }) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex gap-3 max-w-[80%] ${isUser ? 'self-end flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-8 w-8 shrink-0 mt-auto" />
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
        <span className="text-[10px] text-text-muted">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}

function JobOfferCard({ jobOffer }: { jobOffer: JobOffer }) {
  return (
    <div className="flex justify-center w-full my-2">
      <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm relative overflow-hidden group">
        {/* Left accent bar */}
        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>

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
            {jobOffer.date} • {jobOffer.time}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {jobOffer.studio} • {jobOffer.location}
          </p>
        </div>

        {/* Actions */}
        <div className="pl-3 flex gap-3">
          <button className="flex-1 bg-primary hover:bg-green-400 text-black font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm">
            Accept Gig
          </button>
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-text-main dark:text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
