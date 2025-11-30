// src/components/layout/Topbar.jsx
import React, { useState, useEffect } from "react";
import "./Topbar.css";
import { Logout } from "@mui/icons-material";
import { account } from "../../appwrite/config";
import { databases } from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import avatar from "../../assets/default-avatar.png";
import logo from "../../assets/logo.PNG";


const Topbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const USERS_COL = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1️⃣ Get the logged-in Appwrite account
        const currentUser = await account.get();

        // 2️⃣ Fetch the user’s profile document from your database
        const profile = await databases.getDocument(
          DB_ID,
          USERS_COL,
          currentUser.$id
        );

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
              onClick={() =>
            (window.location.href = `/`)
          }
            />
      <h2 className="logo-text" onClick={() =>
            (window.location.href = `/`)
          }>SocialNava</h2>
        </div>
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
    </header>
  );
};

export default Topbar;
