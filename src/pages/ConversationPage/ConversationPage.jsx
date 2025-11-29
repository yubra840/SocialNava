// src/pages/Conversation/ConversationPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ChatWindow from "../../components/Conversation/ChatWindow";
import FriendsList from "../../components/Conversation/FriendsList";
import "./ConversationPage.css";
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from "../../appwrite/config";

export default function ConversationPage() {
  const navigate = useNavigate();
  const { username } = useParams(); // optional param: selected username
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);     // <-- user document, not account
  const [authUser, setAuthUser] = useState(null);           // <-- raw auth user
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isMobileViewChatOpen, setIsMobileViewChatOpen] = useState(false);

  // STEP 1: get Appwrite auth user
  useEffect(() => {
    let mounted = true;

    account.get()
      .then((acc) => {
        if (!mounted) return;
        setAuthUser(acc);

        // STEP 2: fetch the user document from your Users collection
        return databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, acc.$id);
      })
      .then((userDoc) => {
        if (!mounted) return;
        setCurrentUser(userDoc);
        console.log("Fetched user document:", userDoc);
      })
      .catch((err) => {
        console.warn("User not logged in or no user doc found", err);
      });

    return () => (mounted = false);
  }, []);

  // whenever username param changes, open that chat
  useEffect(() => {
    if (username) {
      // We'll fetch friend details inside FriendsList via callback,
      // but set a flag to open mobile chat when route contains username
      setIsMobileViewChatOpen(true);
    } else {
      setIsMobileViewChatOpen(false);
      setSelectedFriend(null);
    }
  }, [username, location.pathname]);

  // callback from FriendsList on friend select
  function handleSelectFriend(friend) {
    setSelectedFriend(friend);
    setIsMobileViewChatOpen(true);
    // update URL to include username
    navigate(`/conversation/${friend.username}`, { replace: false });
  }

  function handleBackToList() {
    navigate("/conversation", { replace: true });
    setIsMobileViewChatOpen(false);
    setSelectedFriend(null);
  }

  return (
    <div className="conv-page">
    <div className={`conv-left ${isMobileViewChatOpen ? "mobile-open" : ""}`}>
        <ChatWindow
          currentUser={currentUser}
          selectedFriend={selectedFriend}
          defaultUsernameFromUrl={username}
          onBack={handleBackToList}
          mobileOpen={isMobileViewChatOpen}
          setSelectedFriend={setSelectedFriend}
        />
      </div>

    <div className={`conv-right ${isMobileViewChatOpen ? "mobile-open" : ""}`}>
        <FriendsList
          currentUser={currentUser}
          onSelectFriend={handleSelectFriend}
          selectedUsername={username}
        />
      </div>
    </div>
  );
}
