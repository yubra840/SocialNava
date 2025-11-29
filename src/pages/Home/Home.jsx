// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import "./home.css";
import PostCard from "../../components/posts/PostCard";
import { databases, account, DATABASE_ID, POSTS_COLLECTION_ID } from "../../appwrite/config";
import { Query } from "appwrite";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const u = await account.get();
        setUser(u);
      } catch (err) {
        setUser(null);
      }
    };
    getUser();
  }, []);

  // fetch posts
  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await databases.listDocuments(DATABASE_ID, POSTS_COLLECTION_ID, [
          Query.orderDesc("$createdAt"),
        ]);
        if (!mounted) return;
        setPosts(res.documents || []);
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // helper to refresh a single post (after update)
  const refreshPost = async (postId) => {
    try {
      const res = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId);
      setPosts((prev) => prev.map(p => p.$id === postId ? res : p));
    } catch (err) {
      console.error("refreshPost error", err);
    }
  };

  // helper to prepend newly created posts quickly (if you have a create flow redirect here)
  const addPostToTop = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="home-page">
      <div className="feed-container">
                <h3 className="home-title">Home feed</h3>
        {loading && <div className="loading">Loading posts...</div>}
        {!loading && posts.length === 0 && <div className="empty">No posts yet</div>}
        {posts.map(post => (
          <PostCard
            key={post.$id}
            post={post}
            currentUser={user}
            onPostUpdated={() => refreshPost(post.$id)}
          />
        ))}
      </div>
    </div>
  );
}
