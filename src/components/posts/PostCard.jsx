// src/components/posts/PostCard.jsx

import React, { useState, useEffect } from "react";
import "./PostCard.css";
import { useNavigate } from "react-router-dom";


import Comments from "./Comments";
import { Button } from "@mui/material";
import {
  databases,
  DATABASE_ID,
  POSTS_COLLECTION_ID,
} from "../../appwrite/config";

import avatar from "../../assets/default-avatar.png";
import { Query } from "appwrite";

// UI Icons
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

export default function PostCard({ post, currentUser, onPostUpdated }) {
  const [localPost, setLocalPost] = useState(post);
  const [showComments, setShowComments] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(avatar);
  const navigate = useNavigate();
 

  const userId = currentUser?.$id || currentUser;

  // ------------------------------------------------------------
  // Fetch user profile picture
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const users = await databases.listDocuments(
          DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
          [Query.equal("username", post.username)]
        );

        if (users.total > 0) {
          const user = users.documents[0];
          setProfilePicUrl(user.profilePic || avatar);
        } else {
          setProfilePicUrl(avatar);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setProfilePicUrl(avatar);
      }
    };

    fetchUserProfile();
  }, [post.userId]);

  useEffect(() => {
    console.log(
      "PostCard re-rendered. New commentsCount =",
      localPost?.commentsCount
    );
  }, [localPost]);

  // ------------------------------------------------------------
  // Format time "time ago"
  // ------------------------------------------------------------
  const timeAgo = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const seconds = Math.floor((now - created) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) {
        return count === 1
          ? `${count} ${unit} ago`
          : `${count} ${unit}s ago`;
      }
    }

    return "Just now";
  };

  // ------------------------------------------------------------
  // Like / Save check
  // ------------------------------------------------------------
  const liked =
    userId &&
    Array.isArray(localPost.likedBy) &&
    localPost.likedBy.includes(userId);

  const saved =
    userId &&
    Array.isArray(localPost.savedBy) &&
    localPost.savedBy.includes(userId);

  // ------------------------------------------------------------
  // FORCE LOGIN if not signed in
  // ------------------------------------------------------------
  const requireLogin = () => {
    if (!currentUser) {
      window.location.href = "/login";
      return false;
    }
    return true;
  };

  // ------------------------------------------------------------
  // Toggle Like
  // ------------------------------------------------------------
  const toggleLike = async () => {
    if (!requireLogin()) return;

    const likedBy = [...(localPost.likedBy || [])];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      likedBy.splice(likedBy.indexOf(userId), 1);
    } else {
      likedBy.push(userId);
    }

    const newLikes = likedBy.length;

    setLocalPost((prev) => ({
      ...prev,
      likedBy,
      likes: newLikes,
    }));

    try {
      await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        post.$id,
        { likedBy, likes: newLikes }
      );
    } catch (err) {
      console.error("toggleLike error", err);
    }
  };

  // ------------------------------------------------------------
  // Toggle Save
  // ------------------------------------------------------------
  const toggleSave = async () => {
    if (!requireLogin()) return;

    const savedBy = [...(localPost.savedBy || [])];
    const hasSaved = savedBy.includes(userId);

    if (hasSaved) {
      savedBy.splice(savedBy.indexOf(userId), 1);
    } else {
      savedBy.push(userId);
    }

    const newSaves = savedBy.length;

    setLocalPost((prev) => ({
      ...prev,
      savedBy,
      saves: newSaves,
    }));

    try {
      await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        post.$id,
        { savedBy, saves: newSaves }
      );
    } catch (err) {
      console.error("toggleSave error", err);
    }
  };

  // ------------------------------------------------------------
  // Render Media
  // ------------------------------------------------------------
  const renderMedia = () => {
    if (!localPost.mediaUrl) return null;

    return localPost.mediaType?.startsWith("video") ? (
      <video className="post-media" src={localPost.mediaUrl} controls />
    ) : (
      <img className="post-media" src={localPost.mediaUrl} alt="post" />
    );
  };

  // ------------------------------------------------------------
  // JSX Component
  // ------------------------------------------------------------
  const navigateToProfile = () => {
    navigate(`/profile/${localPost.username}`);
  };
  return (
    <article className="post-card">
      {/* HEADER */}
      <header className="post-header">
        <div
          className="post-user"
          onClick={navigateToProfile}
        >
          <img className="user-avatar" src={profilePicUrl} alt="avatar" />

          <div className="user-meta">
            <div className="user-name">{localPost.username}</div>
            <div className="post-date">{timeAgo(localPost.$createdAt)}</div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="post-body">
        <div className="post-tag">{localPost.tag}</div>
        <div className="post-caption">{localPost.caption}</div>

        <div className="post-media-wrap">{renderMedia()}</div>
      </div>

      {/* ACTIONS */}
      <footer className="post-actions">
        <div className="actions-left">
          {/* LIKE */}
          <button
            className={`action-btn like ${liked ? "active" : ""}`}
            onClick={toggleLike}
          >
            <FavoriteIcon />
            <span>{localPost.likes ?? 0}</span>
          </button>

          {/* SAVE */}
          <button
            className={`action-btn save ${saved ? "active" : ""}`}
            onClick={toggleSave}
          >
            <BookmarkIcon />
            <span>{localPost.saves ?? 0}</span>
          </button>

          {/* COMMENT */}
          <button
            className="action-btn comment"
            onClick={() => {
              if (!requireLogin()) return;
              setShowComments((prev) => !prev);
            }}
          >
            <ChatBubbleOutlineIcon />
            <span>{localPost.commentsCount ?? 0}</span>
          </button>
        </div>
      </footer>

      {/* COMMENTS SECTION */}
      {showComments && (
        <Comments
          post={localPost}
          currentUser={currentUser}
          onPostChange={(updatedPost) => {
            setLocalPost({ ...updatedPost });
            if (typeof onPostUpdated === "function") {
              onPostUpdated(updatedPost);
            }
          }}
        />
      )}
    </article>
  );
}
