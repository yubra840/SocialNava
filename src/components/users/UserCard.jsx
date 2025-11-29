import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserCard.css";
import MessageIcon from "@mui/icons-material/Message";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { databases } from "../../appwrite/config";
import { DATABASE_ID, USERS_COLLECTION_ID } from "../../appwrite/config";
import avatar from "../../assets/default-avatar.png";

export default function UserCard({ user, currentUser }) {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (currentUser?.following?.includes(user.$id)) {
      setIsFollowing(true);
    }
  }, [currentUser, user.$id]);

  const redirectToLogin = () => {
    // Redirect to login page with a query param to come back to /people
    navigate(`/login?redirect=/people`);
  };

  const handleFollow = async (e) => {
    e.stopPropagation();

    try {
      const updatedFollowings = [...(currentUser.following || []), user.$id];
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, currentUser.$id, {
        following: updatedFollowings,
      });

      const updatedFollowers = [...(user.followers || []), currentUser.$id];
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id, {
        followers: updatedFollowers,
      });

      setIsFollowing(true);
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnfollow = async (e) => {
    e.stopPropagation();

    try {
      const updatedFollowings = (currentUser.following || []).filter((id) => id !== user.$id);
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, currentUser.$id, {
        following: updatedFollowings,
      });

      const updatedFollowers = (user.followers || []).filter((id) => id !== currentUser.$id);
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id, {
        followers: updatedFollowers,
      });

      setIsFollowing(false);
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  const sendMessage = (e) => {
    e.stopPropagation();
    navigate(`/conversation/${user.username}`);
  };

  const navigateToProfile = () => {
    navigate(`/profile/${user.username}`);
  };

  return (
    <div className="user-card" onClick={navigateToProfile}>
      <img src={user.profilePic || avatar} alt="Profile" className="user-avatar" />
      <p className="username">{user.username}</p>

      <div className="user-actions" onClick={(e) => e.stopPropagation()}>
        {/* MESSAGE BUTTON */}
        <button className="action-btn message-btn" onClick={sendMessage}>
          <MessageIcon className="usermessage" onClick={(e) => {
          if (!currentUser) {
            e.preventDefault(); // stop normal navigation
            navigate("/login?redirectTo=/people"); // redirect to login instead
          }
        }} />
        </button>

        {/* FOLLOW / UNFOLLOW BUTTON */}
        {isFollowing ? (
          <button className="action-btn unfollow-btn" onClick={handleUnfollow}>
            <PersonRemoveIcon />
            <span>Unfollow</span>
          </button>
        ) : (
          <button className="action-btn follow-btn" onClick={handleFollow}>
            <PersonAddIcon onClick={(e) => {
          if (!currentUser) {
            e.preventDefault(); // stop normal navigation
            navigate("/login?redirectTo=/people"); // redirect to login instead
          }
        }}/>
            <span onClick={(e) => {
          if (!currentUser) {
            e.preventDefault(); // stop normal navigation
            navigate("/login?redirectTo=/people"); // redirect to login instead
          }
        }}>Follow</span>
          </button>
        )}
      </div>
    </div>
  );
}
