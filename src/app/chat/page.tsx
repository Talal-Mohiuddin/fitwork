"use client";

import React, { useState } from "react";
import { Video, Phone, MoreVertical } from "lucide-react";
import NavRail from "./_components/NavRail";
import ConversationList from "./_components/ConversationList";
import ChatWindow from "./_components/ChatWindow";
import MessageInput from "./_components/MessageInput";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isActive: boolean;
  unread?: boolean;
  status?: "online" | "offline" | "away";
}

interface Message {
  id: string;
  sender: "user" | "other";
  content: string;
  timestamp: string;
  type: "text" | "job-offer";
  jobOffer?: {
    title: string;
    date: string;
    time: string;
    location: string;
    studio: string;
    rate: string;
  };
}

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");

  const conversations: Conversation[] = [
    {
      id: "1",
      name: "Yoga Zen Studio",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBNVzIfbbXFDf_A1Sywejna1NRGbp9tZY8_5vOlVA9OhuqYX_U3x00ZATeEpPT5eGmH-VnURHvZSRPdcipZT0DykAOyVuCPph9u5PxMEZCH8ltpjCmjfJc18lvv9sHJ2DhjFqjG_MDWsaLYIDxGN7v-lWbfOUS6TsNrtFAFBLYq_46rP3UcKAKTlUPTnpsMVZXWubN7HgYRRXhroAv2ab3_ApAhE6RAC1N2GJqzQPo1oQ9oxzlGYXX0YrWDc0xmYetxbPpxSXM9deo",
      lastMessage: "Job Offer: Vinyasa Flow Sub",
      timestamp: "10:30 AM",
      isActive: true,
      status: "online",
    },
    {
      id: "2",
      name: "Crossfit Downtown",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDKvIi5Y1KolXz8kas4lNsjwRPjUs8ZfGggB32yRWePGMwSooC-0APSWKAMDczS1Mjt7jwGqpyRBGwmt92mMgHItATW5qSMYFG68vOEMTC1oGrYlYRzHfqYyc4Y-XqcRyR7l3xnrVRsVavOrXFj6_t8Of1tNkYVVjwoBBJL85GnmzAZg816ueeTLH4lxJNhrKeh3_-GaFYoM6wWVbYws5lXTSM308Dneg7jdxYZ5wmTh23lIsmlK4Khr5uCtG7-bUnbwV9VwwCAM2E",
      lastMessage: "Thanks! See you then.",
      timestamp: "Yesterday",
      isActive: false,
      status: "offline",
    },
    {
      id: "3",
      name: "Pilates Pro",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBhjXQA36KwpBCI2psG9SxAe_xc0lrqR8AlFFcMhAIRBUlgg3BySt21KC18ZFpaWKG-rV3rasGFjkkXQ6p4gB2wkIVrfU-qA6LHXKIaALOUcs-QzJ6xzaoRtuN0Jw8OOxBGre1nKJquYEtbmm1PUSOyYqocoy24nf4nH-Nv8gjuAi3joAd62P91_mvC5E4feSb3VW1AGwiI3dcyujHEf4zlYjnMEwLg1Q5KTpwjxdnoorIyf2Qlg9r34_SqtQM0mVSiA7c9VIP69Qo",
      lastMessage: "Are you certified for Reformer?",
      timestamp: "Tue",
      isActive: false,
      status: "away",
    },
    {
      id: "4",
      name: "Sarah Jenkins",
      avatar: "",
      lastMessage: "I sent over the invoice.",
      timestamp: "Mon",
      isActive: false,
      status: "offline",
    },
  ];

  const messages: Message[] = [
    {
      id: "1",
      sender: "other",
      content:
        "Hi, we saw your profile and love your certifications! Are you available for some sub work this week?",
      timestamp: "10:15 AM",
      type: "text",
    },
    {
      id: "2",
      sender: "user",
      content:
        "Thanks! I'd love to pick up a sub shift. What times are you looking to fill?",
      timestamp: "10:20 AM",
      type: "text",
    },
    {
      id: "3",
      sender: "other",
      content: "",
      timestamp: "10:30 AM",
      type: "job-offer",
      jobOffer: {
        title: "Vinyasa Flow Sub",
        date: "Friday, Oct 24",
        time: "6:00 PM - 7:00 PM",
        location: "Main Room",
        studio: "Yoga Zen Studio",
        rate: "$65/hr",
      },
    },
    {
      id: "4",
      sender: "other",
      content:
        "I just sent over the official request for the Friday evening class. Let me know if that works!",
      timestamp: "10:30 AM",
      type: "text",
    },
  ];

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  );

  return (
    <div className="flex h-screen max-w-7xl mx-auto bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display select-none">
      {/* Nav Rail */}
      <NavRail />

      {/* Conversation List Sidebar */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversation}
        onSelect={setSelectedConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Chat Window */}
      <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark relative">
        {/* Chat Header */}
        {currentConversation && (
          <>
            <header className="h-20 border-b border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {currentConversation.avatar ? (
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"
                      style={{
                        backgroundImage: `url(${currentConversation.avatar})`,
                      }}
                    />
                  ) : (
                    <div className="bg-indigo-100 dark:bg-indigo-900 h-10 w-10 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">
                      {currentConversation.name.charAt(0)}
                    </div>
                  )}
                  {currentConversation.status && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-surface-dark ${
                        currentConversation.status === "online"
                          ? "bg-primary"
                          : currentConversation.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {currentConversation.name}
                  </h3>
                  <p className="text-xs text-text-muted font-medium flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {currentConversation.status === "online"
                      ? "Online now"
                      : currentConversation.status === "away"
                      ? "Away"
                      : "Offline"}
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
            <ChatWindow messages={messages} />

            {/* Input Area */}
            <MessageInput
              value={messageText}
              onChange={setMessageText}
              onSend={() => {
                setMessageText("");
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
