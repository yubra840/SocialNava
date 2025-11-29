// src/components/Conversation/ChatHeader.jsx
import React from "react";
import "./ChatHeader.css";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from "react-router-dom";
import avatar from "../../assets/default-avatar.png";


export default function ChatHeader({ friend, onBack }) {
  const navigate = useNavigate();

  function goToProfile(e) {
    e.preventDefault();
    // navigate to friend's profile route
    navigate(`/profile/${friend.username}`);
  }

  return (
    <div className="chat-header">
      <button className="back-btn" onClick={onBack} aria-label="back">
        <ArrowBackIcon />
      </button>

      <div className="friend-info" onClick={goToProfile} role="button">
        <img src={friend.profilePic || avatar} alt={friend.username} className="friend-avatar" />
        <div className="friend-meta">
          <div className="friend-name">{friend.username}</div>
        </div>
      </div>

      <button className="profile-open" onClick={goToProfile} aria-label="open profile">
        <OpenInNewIcon />
      </button>
    </div>
  );
}
