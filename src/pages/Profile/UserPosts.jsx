// src/pages/Profile/UserPosts.jsx
import React, { useEffect, useState } from "react";
import { databases } from "../../appwrite/config";
import PostCard from "../../components/posts/PostCard";
import { Query } from "appwrite";

export default function UserPosts({ userId, currentUser }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
          [Query.equal("username", userId)]
        );
        setPosts(res.documents);
      } catch (err) {
        console.error("Error fetching user posts:", err);
      }
    };
    fetchPosts();
  }, [userId]);

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.$id === updatedPost.$id ? updatedPost : p))
    );
  };

  return (
    <div className="user-posts">
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.$id}
            post={p}
            currentUser={currentUser}
            onPostUpdated={handlePostUpdated}
          />
        ))
      )}
    </div>
  );
}
