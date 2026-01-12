"use client";

import React, { useState, useEffect } from "react";
import { Video, Phone, MoreVertical, Loader2 } from "lucide-react";
import NavRail from "./_components/NavRail";
import ConversationList from "./_components/ConversationList";
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
      // Optionally send a follow-up message
      if (user && profile) {
        await sendMessage(
          selectedConversation,
          user.uid,
          profile.full_name || "Instructor",
          "I've accepted the job offer! Looking forward to it. 🎉"
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
          "I'd love to take this gig! Let's discuss the details. ✨"
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
    };
  });

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">
            Please sign in to view messages
          </h2>
          <p className="text-text-sub">
            You need to be logged in to access your conversations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-w-7xl mx-auto bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display select-none">
      {/* Nav Rail */}
      <NavRail />

      {/* Conversation List Sidebar */}
      <ConversationList
        conversations={conversationListItems}
        selectedId={selectedConversation || ""}
        onSelect={setSelectedConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Chat Window */}
      <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark relative">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">
              No conversations yet
            </h2>
            <p className="text-text-sub dark:text-gray-400 max-w-sm">
              {profile?.user_type === "studio" 
                ? "Start a conversation by inviting an instructor to a gig from the talent page."
                : "Apply to jobs or wait for studios to reach out to you."}
            </p>
          </div>
        ) : !currentConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-sub">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-20 border-b border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {otherParticipant?.avatar ? (
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"
                      style={{
                        backgroundImage: `url(${otherParticipant.avatar})`,
                      }}
                    />
                  ) : (
                    <div className="bg-indigo-100 dark:bg-indigo-900 h-10 w-10 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">
                      {otherParticipant?.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-surface-dark bg-primary" />
                </div>

                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {otherParticipant?.name || "Conversation"}
                  </h3>
                  <p className="text-xs text-text-muted font-medium flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Online now
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                  <Video size={20} />
                </button>
                <button className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                  <Phone size={20} />
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                <button className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* Messages */}
            <ChatWindow 
              messages={messages}
              currentUserId={user.uid}
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
    return "Just now";
  }
  if (diffHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
