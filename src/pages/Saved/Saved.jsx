import React, { useEffect, useState } from "react";
import "./Saved.css";
import { account, databases } from "../../appwrite/config";
import { Query } from "appwrite";
import {
  DATABASE_ID,
  POSTS_COLLECTION_ID,
} from "../../appwrite/config";
import PostCard from "../../components/posts/PostCard";
import { useNavigate } from "react-router-dom";

export default function Saved() {
  const [currentUser, setCurrentUser] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 1. Get current logged-in user (no auth context available)
  const fetchCurrentUser = async () => {
    try {
      const user = await account.get();
      setCurrentUser(user.$id);
    } catch (error) {
      setCurrentUser(null); // No account logged in
    }
  };

  // 2. Fetch posts and filter saved ones
  const fetchSavedPosts = async (userId) => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [
          Query.search("savedBy", userId), // savedBy should be an array in your collection
        ]
      );

      setSavedPosts(res.documents);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCurrentUser();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchSavedPosts(currentUser);
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="saved-loading">
        <p>Loading saved posts...</p>
      </div>
    );
  }

  const noPosts = !currentUser || savedPosts.length === 0;

  return (
    <div className="savedpage">
 <div className="saved-container">
        <h3 className="saved-title">Saved Posts</h3>
      {noPosts ? (
        <div className="saved-empty">
          <p>No saved posts for this user</p>
          <button
            className="back-home-btn"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="saved-posts-grid">
          {savedPosts.map((post) => (
            <PostCard key={post.$id} post={post} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
    </div>
   
  );
}
