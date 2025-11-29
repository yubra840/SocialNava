// src/components/Conversation/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "./ChatWindow.css";
import { databases, DATABASE_ID, MESSAGES_COLLECTION_ID, USERS_COLLECTION_ID, realtime } from "../../appwrite/config";
import { Query, ID } from "appwrite";

export default function ChatWindow({
  currentUser,
  selectedFriend,
  defaultUsernameFromUrl,
  onBack,
  mobileOpen,
  setSelectedFriend
}) {
  const [friend, setFriend] = useState(selectedFriend || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef(null);
  const scrollRef = useRef(null);

  // When the URL provides a username, fetch that user profile (lightweight fetch)
  useEffect(() => {
    let mounted = true;
    if (!defaultUsernameFromUrl) return;

    // fetch user by username from users collection
    // Assumes you have a Users collection with field 'username'
    databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
      Query.equal("username", defaultUsernameFromUrl),
      Query.limit(1)
    ]).then(res => {
      if (!mounted) return;
      if (res.documents.length > 0) {
        setFriend(res.documents[0]);
        setSelectedFriend(res.documents[0]); // inform parent
      }
    }).catch(err => {
      console.error("User lookup failed", err);
    });
    return () => mounted = false;
  }, [defaultUsernameFromUrl, setSelectedFriend]);
  // Keep friend in sync with selectedFriend from parent
useEffect(() => {
  if (selectedFriend) {
    setFriend(selectedFriend);
    setLoading(true); // re-trigger message loading
  }
}, [selectedFriend]);


  // when selected friend changes, load messages and subscribe to realtime
 useEffect(() => {
  if (!currentUser || !friend) return;

  const convId = getConversationId(currentUser.$id, friend.$id);
  setLoading(true);

  // 1. Load past messages
  databases.listDocuments(
    DATABASE_ID,
    MESSAGES_COLLECTION_ID,
    [
      Query.equal("conversationId", convId),
      Query.orderAsc("createdAt"),
      Query.limit(300)
    ]
  )
  .then(res => {
    setMessages(res.documents || []);
    setTimeout(scrollToBottom, 30);
  })
  .catch(err => {
    console.error("load messages error:", err);
    setMessages([]);
  })
  .finally(() => setLoading(false));

  // 2. Clear old subscription
  if (subscriptionRef.current) {
    try { subscriptionRef.current.unsubscribe(); } catch {}
  }

  // 3. Subscribe realtime
  subscriptionRef.current = realtime.subscribe(
    [`databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`],
    msg => {
      if (!msg.events.some(e => e.endsWith(".create"))) return;

      const doc = msg.payload;
      if (!doc) return;

      if (doc.conversationId !== convId) return;

      setMessages(prev => {
        if (prev.some(m => m.$id === doc.$id)) return prev;
        return [...prev, doc];
      });

      setTimeout(scrollToBottom, 30);
    }
  );

  return () => {
    if (subscriptionRef.current) {
      try { subscriptionRef.current.unsubscribe(); } catch {}
    }
  };

}, [currentUser, friend]);
// RESET CHAT WHEN NO USERNAME IN ROUTE
useEffect(() => {
  if (!defaultUsernameFromUrl && !selectedFriend) {
    setFriend(null);
    setMessages([]);
  }
}, [defaultUsernameFromUrl, selectedFriend]);


  // utility
  function getConversationId(a, b) {
    // deterministic conversation id for a pair: smaller-id + '_' + bigger-id
    if (!a || !b) return null;
    return a < b ? `${a}_${b}` : `${b}_${a}`;
  }

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  // called by MessageInput after sending message successfully (optimistic update optionally)
  async function handleMessageSend(text) {
    if (!currentUser || !friend) return;
    const convId = getConversationId(currentUser.$id, friend.$id);
    const doc = {
      senderId: currentUser.$id,
      senderUsername: currentUser.name || currentUser.$id,
      receiverId: friend.$id,
      receiverUsername: friend.username,
      text,
      createdAt: new Date().toISOString(),
      conversationId: convId,
      read: false,
    };

    try {
      const created = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        doc
      );
     
      return created;
    } catch (err) {
      console.error("send message error", err);
      throw err;
    }
  }

  // Mobile: if mobileOpen false, hide chat window (friends list shown by parent)
  // We will display ChatWindow as overlay on mobiles when mobileOpen true.
  return (
    <div className={`chat-window ${mobileOpen ? "mobile-open" : ""}`}>
      {!friend ? (
        <div className="chat-empty">
          <p>Select a friend to start chatting</p>
        </div>
      ) : (
        <div className="content">
         <ChatHeader friend={friend} onBack={onBack} />
          <div className="chat-body" ref={scrollRef}>
            {loading ? <div className="loading">Loading...</div> : (
              <MessageList messages={messages} currentUserId={currentUser?.$id} />
            )}
          </div>
            <MessageInput onSend={handleMessageSend} />
        </div>
      )}
    </div>
  );
}
