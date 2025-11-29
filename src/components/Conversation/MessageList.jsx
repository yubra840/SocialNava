// src/components/Conversation/MessageList.jsx
import React from "react";
import "./MessageList.css";

export default function MessageList({ messages = [], currentUserId }) {
  return (
    <div className="messages-list">
      {messages.map((msg, index) => {
        const isMe = msg.senderId === currentUserId;
        const isLast = index === messages.length - 1;

        return (
          <div
            key={msg.$id || `${msg.createdAt}_${msg.senderId}`}
            className={`msg-row ${isMe ? "me" : "them"} ${isLast ? "last-msg" : ""}`}
          >
            <div className="msg-bubble">
              <div className="msg-text">{msg.text}</div>
              <div className="msg-time">{formatTime(msg.createdAt)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "";
  }
}
