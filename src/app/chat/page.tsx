"use client";

import React, { useState, useEffect } from "react";
import { MoreVertical, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import NavRail from "./_components/NavRail";
import ConversationList, { FilterType } from "./_components/ConversationList";
import ChatWindow from "./_components/ChatWindow";
import MessageInput from "./_components/MessageInput";
import { useAuth } from "@/store/firebase-auth-provider";
import { 
  Conversation, 
  ChatMessage, 
} from "@/types";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  respondToJobOffer,
  respondToGigInvite,
} from "@/services/chatService";

export default function ChatPage() {
  const { user, profile } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Subscribe to conversations
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
      setIsLoading(false);
      
      // Auto-select first conversation if none selected
      if (convs.length > 0 && !selectedConversation) {
        setSelectedConversation(convs[0].id);
      }
    });

    return () => unsubscribe();
  }, [user, selectedConversation]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const unsubscribe = subscribeToMessages(selectedConversation, (msgs) => {
      setMessages(msgs);
    });

    // Mark messages as read
    markMessagesAsRead(selectedConversation, user.uid);

    return () => unsubscribe();
  }, [selectedConversation, user]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user || !profile) return;

    try {
      setIsSending(true);
      const senderName = profile.user_type === "studio" 
        ? profile.name || "Studio"
        : profile.full_name || "Instructor";

      await sendMessage(
        selectedConversation,
        user.uid,
        senderName,
        messageText.trim()
      );
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleAcceptJobOffer = async (messageId: string) => {
    if (!selectedConversation) return;
    
    try {
      await respondToJobOffer(selectedConversation, messageId, "accepted");
      if (user && profile) {
        await sendMessage(
          selectedConversation,
          user.uid,
          profile.full_name || "Instructor",
          "I've accepted the job offer! Looking forward to it."
        );
      }
    } catch (error) {
      console.error("Error accepting job offer:", error);
    }
  };

  const handleDeclineJobOffer = async (messageId: string) => {
    if (!selectedConversation) return;
    
    try {
      await respondToJobOffer(selectedConversation, messageId, "declined");
      if (user && profile) {
        await sendMessage(
          selectedConversation,
          user.uid,
          profile.full_name || "Instructor",
          "Unfortunately, I won't be able to take this one. Thank you for thinking of me!"
        );
      }
    } catch (error) {
      console.error("Error declining job offer:", error);
    }
  };

  const handleAcceptGigInvite = async (messageId: string) => {
    if (!selectedConversation) return;
    
    try {
      await respondToGigInvite(selectedConversation, messageId, "accepted");
      if (user && profile) {
        await sendMessage(
          selectedConversation,
          user.uid,
          profile.full_name || "Instructor",
          "I'd love to take this gig! Let's discuss the details."
        );
      }
    } catch (error) {
      console.error("Error accepting gig invite:", error);
    }
  };

  const handleDeclineGigInvite = async (messageId: string) => {
    if (!selectedConversation) return;
    
    try {
      await respondToGigInvite(selectedConversation, messageId, "declined");
      if (user && profile) {
        await sendMessage(
          selectedConversation,
          user.uid,
          profile.full_name || "Instructor",
          "I'm not available for this one, but please keep me in mind for future opportunities!"
        );
      }
    } catch (error) {
      console.error("Error declining gig invite:", error);
    }
  };

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const otherParticipantId = currentConversation?.participants.find(p => p !== user?.uid);
  const otherParticipant = otherParticipantId 
    ? currentConversation?.participantDetails[otherParticipantId]
    : null;

  // Get current user avatar
  const currentUserAvatar = profile?.user_type === "studio" 
    ? profile?.images?.[0] 
    : profile?.profile_photo;

  // Convert conversations to list format
  const conversationListItems = conversations.map(conv => {
    const otherId = conv.participants.find(p => p !== user?.uid);
    const other = otherId ? conv.participantDetails[otherId] : null;
    
    return {
      id: conv.id,
      name: other?.name || "Unknown",
      avatar: other?.avatar || "",
      lastMessage: conv.lastMessage?.content || "No messages yet",
      timestamp: conv.lastMessage?.timestamp 
        ? formatTimestamp(conv.lastMessage.timestamp)
        : "",
      isActive: conv.id === selectedConversation,
      unread: (conv.unreadCount[user?.uid || ""] || 0) > 0,
      status: "online" as const,
      userType: other?.userType,
    };
  });

  // Get user profile info for nav
  const userName = profile?.user_type === "studio" 
    ? profile?.name 
    : profile?.full_name;
  const userAvatar = profile?.user_type === "studio" 
    ? profile?.images?.[0] 
    : profile?.profile_photo;

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Please sign in to view messages
          </h2>
          <p className="text-gray-500 mb-4">
            You need to be logged in to access your conversations.
          </p>
          <Link 
            href="/login" 
            className="inline-block bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans select-none">
      {/* Nav Rail */}
      <NavRail 
        userType={profile?.user_type} 
        userName={userName}
        userAvatar={userAvatar}
      />

      {/* Conversation List Sidebar */}
      <ConversationList
        conversations={conversationListItems}
        selectedId={selectedConversation || ""}
        onSelect={setSelectedConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Main Chat Window */}
      <main className="flex-1 flex flex-col bg-gray-50 relative">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No conversations yet
            </h2>
            <p className="text-gray-500 max-w-sm">
              {profile?.user_type === "studio" 
                ? "Start a conversation by inviting an instructor to a gig from the talent page."
                : "Apply to jobs or wait for studios to reach out to you."}
            </p>
          </div>
        ) : !currentConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {otherParticipant?.avatar ? (
                    <div
                      className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10"
                      style={{
                        backgroundImage: `url(${otherParticipant.avatar})`,
                      }}
                    />
                  ) : (
                    <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center font-semibold text-primary">
                      {otherParticipant?.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-primary" />
                </div>

                <div>
                  <h3 className="font-semibold text-base text-gray-900">
                    {otherParticipant?.name || "Conversation"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {otherParticipant?.userType === "studio" ? "Studio Manager" : "Instructor"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link 
                  href={otherParticipant?.userType === "studio" 
                    ? `/studios/${otherParticipantId}` 
                    : `/instructors/${otherParticipantId}`
                  }
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye size={16} />
                  View Profile
                </Link>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            {/* Messages */}
            <ChatWindow 
              messages={messages}
              currentUserId={user.uid}
              currentUserAvatar={currentUserAvatar}
              otherUserAvatar={otherParticipant?.avatar}
              onAcceptJobOffer={handleAcceptJobOffer}
              onDeclineJobOffer={handleDeclineJobOffer}
              onAcceptGigInvite={handleAcceptGigInvite}
              onDeclineGigInvite={handleDeclineGigInvite}
            />

            {/* Input Area */}
            <MessageInput
              value={messageText}
              onChange={setMessageText}
              onSend={handleSendMessage}
              disabled={isSending}
              placeholder={`Message ${otherParticipant?.name || ""}...`}
            />
          </>
        )}
      </main>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return "now";
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MessageIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
