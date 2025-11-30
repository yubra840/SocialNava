// src/components/layout/Topbar.jsx
import React, { useState, useEffect } from "react";
import "./Topbar.css";
import { Logout } from "@mui/icons-material";
import { account, databases } from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import avatar from "../../assets/default-avatar.png";
import logo from "../../assets/logo.PNG";

const Topbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const USERS_COL = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get();

        const profile = await databases.getDocument(
          DB_ID,
          USERS_COL,
          currentUser.$id
        );

        setUser(profile);
      } catch (err) {
        console.warn("No user logged in.");
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

  const navigateToProfile = () => {
    if (!user) {
      navigate(`/login?redirectTo=/profile`);
    } else {
      navigate(`/profile/${user.username}`);
    }
  };
  return (
    <header className="topbar">
      <div className="top-logo-container">
        <img
          src={logo}
          alt="Logo"
          className="logo-image"
          onClick={() => (window.location.href = `/`)}
        />
        <h2
          className="logo-text"
          onClick={() => (window.location.href = `/`)}
        >
          SocialNava
        </h2>
      </div>

      {/* ✔️ If user is not logged in → show Login button */}
      {!loading && !user ? (
        <button className="login-btn-top" onClick={() => {
    const currentPath = window.location.pathname;
    navigate(`/login?redirectTo=${currentPath}`);
  }}
>
  Login
</button>
      ) : (
        <div className="topbar-right">
          <>
            <img
              src={user?.profilePic || avatar}
              alt="Profile"
              className="top-profile"
              onClick={navigateToProfile}
            />
            <button className="logout-btn-top" onClick={handleLogout}>
              <Logout />
            </button>
          </>
        </div>
      )}
    </header>
  );
};

export default Topbar;
