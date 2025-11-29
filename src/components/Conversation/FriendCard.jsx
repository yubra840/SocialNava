// src/components/Conversation/FriendCard.jsx
import React from "react";
import "./FriendCard.css";
import avatar from "../../assets/default-avatar.png";

export default function FriendCard({ friend, onClick, isSelected }) {
  return (
    <div className={`friend-card ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <img src={friend.profilePic || avatar} alt={friend.username} className="friend-thumb" />
      <div className="friend-name">{friend.username}</div>
    </div>
  );
}
