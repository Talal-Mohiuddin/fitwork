import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  writeBatch,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { 
  Conversation, 
  ChatMessage, 
  MessageType, 
  JobOfferDetails, 
  GigInviteDetails,
  Profile 
} from "@/types";

// Collections
const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_COLLECTION = "messages";
const PROFILES_COLLECTION = "profiles";
const STUDIOS_COLLECTION = "studios";
const INSTRUCTORS_COLLECTION = "instructors";

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  user1Details: { name: string; avatar?: string; userType: "studio" | "instructor" },
  user2Details: { name: string; avatar?: string; userType: "studio" | "instructor" }
): Promise<Conversation> {
  try {
    // Check if conversation already exists
    const participants = [userId1, userId2].sort();
    const conversationsQuery = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "==", participants)
    );
    
    const snapshot = await getDocs(conversationsQuery);
    
    if (!snapshot.empty) {
      const existingConv = snapshot.docs[0];
      return {
        ...existingConv.data(),
        id: existingConv.id,
      } as Conversation;
    }

    // Create new conversation
    const conversationRef = doc(collection(db, CONVERSATIONS_COLLECTION));
    const conversation: Conversation = {
      id: conversationRef.id,
      participants,
      participantDetails: {
        [userId1]: {
          ...user1Details,
          avatar: user1Details.avatar || null,
        },
        [userId2]: {
          ...user2Details,
          avatar: user2Details.avatar || null,
        },
      },
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await setDoc(conversationRef, {
      ...conversation,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    return conversation;
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    throw new Error("Failed to get or create conversation");
  }
}

/**
 * Send a text message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string,
  type: MessageType = "text",
  jobOffer?: JobOfferDetails,
  gigInvite?: GigInviteDetails
): Promise<string> {
  try {
    const batch = writeBatch(db);
    
    // Sanitize optional fields in nested objects to prevent "undefined" errors
    const sanitizedJobOffer = jobOffer ? {
      ...jobOffer,
      endTime: jobOffer.endTime || null,
      classType: jobOffer.classType || null,
    } : undefined;

    const sanitizedGigInvite = gigInvite ? {
      ...gigInvite,
      description: gigInvite.description || null,
    } : undefined;

    // Create message
    const messageRef = doc(collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION));
    const message: Omit<ChatMessage, "id"> = {
      conversationId,
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      type,
      read: false,
      ...(sanitizedJobOffer && { jobOffer: sanitizedJobOffer }),
      ...(sanitizedGigInvite && { gigInvite: sanitizedGigInvite }),
    };

    batch.set(messageRef, {
      ...message,
      timestamp: serverTimestamp(),
    });

    // Update conversation with last message
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data() as Conversation;
      const otherParticipant = conversationData.participants.find(p => p !== senderId);
      
      batch.update(conversationRef, {
        lastMessage: {
          content: type === "job_offer" ? "📋 Job Offer" : 
                   type === "gig_invite" ? "🎯 Gig Invite" : content,
          senderId,
          timestamp: new Date().toISOString(),
          type,
        },
        updated_at: serverTimestamp(),
        [`unreadCount.${otherParticipant}`]: increment(1),
      });
    }

    await batch.commit();
    return messageRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
}

/**
 * Send a job offer message
 */
export async function sendJobOffer(
  conversationId: string,
  senderId: string,
  senderName: string,
  jobOffer: JobOfferDetails
): Promise<string> {
  const content = `Job offer for ${jobOffer.title}`;
  return sendMessage(conversationId, senderId, senderName, content, "job_offer", jobOffer);
}

/**
 * Send a gig invite message
 */
export async function sendGigInvite(
  conversationId: string,
  senderId: string,
  senderName: string,
  gigInvite: GigInviteDetails
): Promise<string> {
  const content = `Gig invite for ${gigInvite.title}`;
  return sendMessage(conversationId, senderId, senderName, content, "gig_invite", undefined, gigInvite);
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const conversationsQuery = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "array-contains", userId),
      orderBy("updated_at", "desc")
    );

    const snapshot = await getDocs(conversationsQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    } as Conversation));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw new Error("Failed to fetch conversations");
  }
}

/**
 * Subscribe to conversations for real-time updates
 */
export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe {
  const conversationsQuery = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where("participants", "array-contains", userId),
    orderBy("updated_at", "desc")
  );

  return onSnapshot(conversationsQuery, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    } as Conversation));
    callback(conversations);
  });
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  limitCount: number = 50
): Promise<ChatMessage[]> {
  try {
    const messagesQuery = query(
      collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
      orderBy("timestamp", "asc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    } as ChatMessage));
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
}

/**
 * Subscribe to messages for real-time updates
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  const messagesQuery = query(
    collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        timestamp: data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate().toISOString() 
          : data.timestamp,
      } as ChatMessage;
    });
    callback(messages);
  });
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    // Update conversation unread count
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0,
    });

    // Mark all unread messages from other users as read
    const messagesQuery = query(
      collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
      where("read", "==", false)
    );

    const snapshot = await getDocs(messagesQuery);
    const batch = writeBatch(db);

    snapshot.docs.forEach(msgDoc => {
      const msgData = msgDoc.data();
      if (msgData.senderId !== userId) {
        batch.update(msgDoc.ref, { read: true });
      }
    });

    await batch.commit();
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
}

/**
 * Respond to a job offer
 */
export async function respondToJobOffer(
  conversationId: string,
  messageId: string,
  response: "accepted" | "declined"
): Promise<void> {
  try {
    const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      "jobOffer.status": response,
    });
  } catch (error) {
    console.error("Error responding to job offer:", error);
    throw new Error("Failed to respond to job offer");
  }
}

/**
 * Respond to a gig invite
 */
export async function respondToGigInvite(
  conversationId: string,
  messageId: string,
  response: "accepted" | "declined"
): Promise<void> {
  try {
    const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      "gigInvite.status": response,
    });
  } catch (error) {
    console.error("Error responding to gig invite:", error);
    throw new Error("Failed to respond to gig invite");
  }
}

/**
 * Get total unread count for a user
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  try {
    const conversations = await getUserConversations(userId);
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0);
    }, 0);
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}

/**
 * Start a conversation and send initial message (e.g., when inviting to a job)
 */
export async function startConversationWithJobOffer(
  studioId: string,
  studioName: string,
  studioAvatar: string | undefined,
  instructorId: string,
  instructorName: string,
  instructorAvatar: string | undefined,
  jobOffer: JobOfferDetails,
  introMessage?: string
): Promise<{ conversationId: string; messageId: string }> {
  try {
    // Get or create conversation
    const conversation = await getOrCreateConversation(
      studioId,
      instructorId,
      { name: studioName, avatar: studioAvatar, userType: "studio" },
      { name: instructorName, avatar: instructorAvatar, userType: "instructor" }
    );

    // Send intro message if provided
    if (introMessage) {
      await sendMessage(conversation.id, studioId, studioName, introMessage);
    }

    // Send job offer
    const messageId = await sendJobOffer(conversation.id, studioId, studioName, jobOffer);

    return { conversationId: conversation.id, messageId };
  } catch (error) {
    console.error("Error starting conversation with job offer:", error);
    throw new Error("Failed to start conversation");
  }
}

/**
 * Get user profile for chat participant details
 */
export async function getChatParticipantProfile(
  userId: string,
  userType: "studio" | "instructor"
): Promise<{ name: string; avatar?: string } | null> {
  try {
    const collectionName = userType === "studio" ? STUDIOS_COLLECTION : INSTRUCTORS_COLLECTION;
    const userRef = doc(db, collectionName, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data() as Profile;
    return {
      name: userType === "studio" ? userData.name || "Studio" : userData.full_name || "Instructor",
      avatar: userData.images?.[0] || userData.profile_photo,
    };
  } catch (error) {
    console.error("Error fetching chat participant profile:", error);
    return null;
  }
}
