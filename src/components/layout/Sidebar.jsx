import "./Sidebar.css";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { account, databases } from "../../appwrite/config";
import avatar from "../../assets/default-avatar.png";
import logo from "../../assets/logo.PNG";


import {
  Home,
  PermMedia,
  Explore,
  People,
  Bookmark,
  Logout,
  Comment
} from "@mui/icons-material";

const Sidebar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const USERS_COL = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get();
        const profile = await databases.getDocument(DB_ID, USERS_COL, currentUser.$id);
        setUser(profile);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ------------------------------------------------------------
  // Helper function to protect routes
  // -------------------const navigateToProfile = () => {
   const navigateToProfile = () => {
    navigate(`/profile/${user.username}`);
  };
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img
          src={logo}
          alt="Logo"
          className="logo-image"
          onClick={() => (window.location.href = `/`)}
        />
        <h2 className="logo-text" onClick={() => (window.location.href = `/`)}>
          SocialNava
        </h2>
      </div>

      <div className="profile">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <img
              src={user?.profilePic || avatar}
              alt="Profile"
              className="profile-pic"
              onClick={navigateToProfile}
            />
            <h2 className="username" onClick={navigateToProfile}>
              @{user?.username || "User"}
            </h2>
          </>
        )}
      </div>

      <nav className="sidenav-links">
        <NavLink to="/" className="sidenav-item">
          <Home className="icon home-icon" /> <span>Home</span>
        </NavLink>

        {/* CREATE POST */}
       <NavLink
  to="/create"
  className="sidenav-item"
  onClick={(e) => {
    if (!user) {
      e.preventDefault(); // stop normal navigation
      navigate("/login?redirectTo=/create"); // redirect to login instead
    }
  }}
>
  <PermMedia className="icon media-icon" /> <span>Create Post</span>
</NavLink>

        <NavLink to="/people" className="sidenav-item">
          <People className="icon people-icon" /> <span>People</span>
        </NavLink>

        <NavLink to="/saved" className="sidenav-item">
          <Bookmark className="icon saved-icon" /> <span>Saved</span>
        </NavLink>

        {/* MESSAGES */}
        <NavLink
  to="/conversation"
  className="sidenav-item"
  onClick={(e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login?redirectTo=/conversation");
    }
  }}
>
  <Comment className="icon creators-icon" /> <span>Messages</span>
</NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <Logout /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
