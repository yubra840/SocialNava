import React, { useEffect, useState } from "react";
import { databases } from "../../appwrite/config";
import { Button, Avatar } from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import "./ProfilePage.css";
import UserPosts from "./UserPosts";
import LikedPosts from "./LikedPosts";
import { Query } from "appwrite";

export default function OtherUserProfile({ userData: initialUserData, currentUser }) {
  const [userData, setUserData] = useState(initialUserData);
  const [likesCount, setLikesCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [freshCurrentUser, setFreshCurrentUser] = useState(null);

  // 🟢 Fetch updated current user document from database
  useEffect(() => {
    const fetchCurrentUserData = async () => {
      try {
        const res = await databases.getDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
          currentUser.$id
        );
        setFreshCurrentUser(res);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    if (currentUser?.$id) fetchCurrentUserData();
  }, [currentUser]);

  // 🟢 Determine follow status dynamically
  useEffect(() => {
    if (freshCurrentUser && userData) {
      const followingList = freshCurrentUser.following || [];
      setIsFollowing(followingList.includes(userData.$id));
    }
  }, [freshCurrentUser, userData]);

  // 🟢 Fetch total likes for user’s posts
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const posts = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
          [Query.equal("username", userData.username)]
        );
        const total = posts.documents.reduce((sum, p) => sum + (p.likes || 0), 0);
        setLikesCount(total);
      } catch (err) {
        console.error("Error fetching likes:", err);
      }
    };
    fetchLikes();
  }, [userData.username]);

  // 🟢 Follow handler
  const handleFollow = async () => {
    try {
      const updatedFollowing = [...(freshCurrentUser.following || []), userData.$id];
      const updatedFollowers = [...(userData.followers || []), freshCurrentUser.$id];

      // Update both users in Appwrite
      await Promise.all([
        databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
          freshCurrentUser.$id,
          { following: updatedFollowing }
        ),
        databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
          userData.$id,
          { followers: updatedFollowers }
        ),
      ]);

      // 🟢 Update frontend instantly
      setIsFollowing(true);
      setUserData((prev) => ({
        ...prev,
        followers: updatedFollowers,
      }));
      setFreshCurrentUser((prev) => ({
        ...prev,
        following: updatedFollowing,
      }));
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  // 🟢 Unfollow handler
  const handleUnfollow = async () => {
    try {
      const updatedFollowing = (freshCurrentUser.following || []).filter(
        (id) => id !== userData.$id
      );
      const updatedFollowers = (userData.followers || []).filter(
        (id) => id !== freshCurrentUser.$id
      );

      // Update both users in Appwrite
      await Promise.all([
        databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
          freshCurrentUser.$id,
          { following: updatedFollowing }
        ),
        databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
          userData.$id,
          { followers: updatedFollowers }
        ),
      ]);

      // 🟢 Update frontend instantly
      setIsFollowing(false);
      setUserData((prev) => ({
        ...prev,
        followers: updatedFollowers,
      }));
      setFreshCurrentUser((prev) => ({
        ...prev,
        following: updatedFollowing,
      }));
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };
  const sendMessage = (e) => {
    e.stopPropagation();
    window.location.href = `/conversation/${userData.username}`;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <Avatar
          src={userData.profilePic}
          alt={userData.username}
          sx={{ width: 100, height: 100 }}
        />
        <div className="profile-info">
          <h2>{userData.username}</h2>
          <div className="profile-actions">
            <Button
              variant="outlined"
              startIcon={<MessageIcon />}
              sx={{ fontSize: "10px" }}
              onClick={sendMessage}
            >
              Message
            </Button>

            {isFollowing ? (
              <Button
                variant="contained"
                color="error"
                sx={{ fontSize: "10px" }}
                startIcon={<PersonRemoveIcon />}
                onClick={handleUnfollow}
              >
                Unfollow
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={{ fontSize: "10px" }}
                startIcon={<PersonAddIcon />}
                onClick={handleFollow}
              >
                Follow
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <span>
          <strong>{userData.followers?.length || 0}</strong> Followers
        </span>
        <span>
          <strong>{userData.following?.length || 0}</strong> Following
        </span>
        <span>
          <strong>{likesCount}</strong> Likes
        </span>
      </div>

      <div className="profile-about">
        <h3>About</h3>
        <p>{userData.about || "No about info for this user."}</p>
      </div>

      <div className="profile-tabs">
        <button
          className={activeTab === "posts" ? "active" : ""}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={activeTab === "liked" ? "active" : ""}
          onClick={() => setActiveTab("liked")}
        >
          Liked Posts
        </button>
      </div>

      <div className="profile-posts-section">
        {activeTab === "posts" ? (
      <UserPosts userId={userData.username} currentUser={currentUser} />
        ) : (
      <LikedPosts userId={userData.$id} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}
