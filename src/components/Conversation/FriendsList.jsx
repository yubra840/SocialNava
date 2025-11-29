// src/components/Conversation/FriendsList.jsx
import React, { useEffect, useState } from "react";
import "./FriendsList.css";
import FriendCard from "./FriendCard";
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from "../../appwrite/config";
import { Query } from "appwrite";

export default function FriendsList({ currentUser, onSelectFriend, selectedUsername }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Combine followers and following — assumes users have arrays of ids in their user doc
  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    setLoading(true);

    // assume currentUser has fields: followers: [id], following: [id]
    const idsSet = new Set([
      ...(currentUser.followers || []),
      ...(currentUser.following || [])
    ]);
    const ids = Array.from(idsSet);
    if (ids.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    // Appwrite doesn't support "in" queries for many IDs; but Query.search or many Query.equal combined with OR isn't straightforward.
    // We'll fetch users with a QDF by page or multiple queries. For simplicity, fetch top 100 and filter client-side:
    databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
      Query.limit(200)
    ]).then(res => {
      if (!mounted) return;
      const docs = res.documents || [];
      const matched = docs.filter(d => idsSet.has(d.$id));
      setFriends(matched);
      console.log("Fetched friends:", matched);
    }).catch(err => {
      console.error("fetch friends error", err);
      setFriends([]);
    }).finally(() => mounted && setLoading(false));

    return () => mounted = false;
  }, [currentUser]);

  return (
    <div className="friends-panel">
      <div className="friends-header">Friends</div>
      <div className="friends-list">
        {loading && <div className="loading">Loading...</div>}
        {!loading && friends.length === 0 && <div className="empty">No friends yet</div>}
        {!loading && friends.map(f => (
          <FriendCard key={f.$id} friend={f} onClick={() => onSelectFriend(f)} isSelected={selectedUsername === f.username} />
        ))}
      </div>
    </div>
  );
}

