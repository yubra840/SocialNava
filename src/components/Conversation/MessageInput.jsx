// src/components/Conversation/MessageInput.jsx
import React, { useState } from "react";
import "./MessageInput.css";
import SendIcon from '@mui/icons-material/Send';

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await onSend(trimmed);
      setText("");
    } catch (err) {
      // show toast or error
      console.error("send failed", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={sending}
        className="message-field"
      />
      <button className="send-btn" type="submit" aria-label="send">
        <SendIcon />
      </button>
    </form>
  );
}
