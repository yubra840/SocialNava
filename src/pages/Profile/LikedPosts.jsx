// src/pages/Profile/LikedPosts.jsx
import React, { useEffect, useState, useCallback } from "react";
import { databases } from "../../appwrite/config";
import PostCard from "../../components/posts/PostCard";

export default function LikedPosts({ userId, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ useCallback ensures same function reference for reuse in onPostUpdated
  const fetchLiked = useCallback(async () => {
    try {
      const res = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID
      );

      // ✅ filter for posts liked by the user whose profile we are viewing
      const liked = res.documents.filter(
        (p) => Array.isArray(p.likedBy) && p.likedBy.includes(userId)
      );

      // show most recent liked posts first
      setPosts(liked.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)));
    } catch (err) {
      console.error("Error fetching liked posts:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLiked();
  }, [fetchLiked]);

  if (loading) return <p>Loading liked posts...</p>;

  return (
    <div className="liked-posts">
      {posts.length === 0 ? (
        <p>No liked posts yet.</p>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.$id}
            post={p}
            currentUser={currentUser}
            onPostUpdated={fetchLiked}
          />
        ))
      )}
    </div>
  );
}
