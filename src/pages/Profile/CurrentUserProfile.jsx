// src/pages/Profile/CurrentUserProfile.jsx
import React, { useEffect, useState } from "react";
import { databases, storage } from "../../appwrite/config";
import { Button, Avatar } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Query } from "appwrite";

import "./ProfilePage.css";
import UserPosts from "./UserPosts";
import LikedPosts from "./LikedPosts";
import EditProfileForm from "./EditProfileForm";

export default function CurrentUserProfile({ userData }) {
  const [likesCount, setLikesCount] = useState(0);
  const [about, setAbout] = useState(userData.about || "");
  const [editAbout, setEditAbout] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [editing, setEditing] = useState(false);
  const [localUserData, setLocalUserData] = useState(userData);

  const [profilePicUrl, setProfilePicUrl] = useState("");

  // 🔥 Generate preview URL from Appwrite Storage
  useEffect(() => {
    if (localUserData.profilePic) {
      const url = storage.getFilePreview(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        localUserData.profilePic
      );
      setProfilePicUrl(url.href);
    }
  }, [localUserData.profilePic]);

  // Fetch likes
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const posts = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
          [Query.equal("username", localUserData.username)]
        );

        const totalLikes = posts.documents.reduce(
          (sum, post) => sum + (post.likes || 0),
          0
        );

        setLikesCount(totalLikes);
      } catch (err) {
        console.error("Error fetching likes:", err);
      }
    };

    fetchLikes();
  }, [localUserData.username]);

  // When user updates profile
  const handleProfileUpdate = (updated) => {
    setLocalUserData({ ...localUserData, ...updated });
    setEditing(false);
  };

  // If user is editing, replace component
  if (editing) {
    return (
      <EditProfileForm
        userData={localUserData}
        onCancel={() => setEditing(false)}
        onUpdate={handleProfileUpdate}
      />
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <Avatar
          src={localUserData.profilePic}
          alt={localUserData.username}
          sx={{ width: 100, height: 100 }}
        />

        <div className="profile-info">
          <h2>{localUserData.username}</h2>

          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <span>
          <strong>{localUserData.followers?.length || 0}</strong> Followers
        </span>
        <span>
          <strong>{localUserData.following?.length || 0}</strong> Following
        </span>
        <span>
          <strong>{likesCount}</strong> Likes
        </span>
      </div>

      {/* About */}
      <div className="profile-about">
        <h3>About</h3>

        {editAbout ? (
          <div className="about-edit">
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
            <Button variant="contained">Save</Button>
          </div>
        ) : about ? (
          <p>{about}</p>
        ) : (
          <p>No about info. Click edit profile to add.</p>
        )}
      </div>

      {/* Tabs */}
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

      {/* Posts */}
      <div className="profile-posts-section">
        {activeTab === "posts" ? (
          <UserPosts
            userId={localUserData.username}
            currentUser={localUserData}
          />
        ) : (
          <LikedPosts
            userId={localUserData.$id}
            currentUser={localUserData}
          />
        )}
      </div>
    </div>
  );
}
