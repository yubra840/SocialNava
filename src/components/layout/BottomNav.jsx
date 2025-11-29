// src/components/layout/BottomNav.jsx
import React from "react";
import "./BottomNav.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  PermMedia,
  Explore,
  People,
  Bookmark,
  Comment,
} from "@mui/icons-material";

const BottomNav = () => {
  const user = localStorage.getItem("currentUser");
  const navigate = useNavigate();
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="nav-item">
        <Home className="icon home-icon" />
      </NavLink>

      <NavLink
        to="/create"
        className="nav-item"
        onClick={(e) => {
          if (!user) {
            e.preventDefault(); // stop normal navigation
            navigate("/login?redirectTo=/create"); // redirect to login instead
          }
        }}
      >
        <PermMedia className="icon media-icon" />
      </NavLink>


      <NavLink to="/people" className="nav-item">
        <People className="icon people-icon" />
      </NavLink>

      <NavLink to="/saved" className="nav-item">
        <Bookmark className="icon saved-icon" />
      </NavLink>
 <NavLink
  to="/conversation"
  className="nav-item"
  onClick={(e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login?redirectTo=/conversation");
    }
  }}
>
  <Comment className="icon creators-icon" />
</NavLink>
    </nav>
  );
};

export default BottomNav;
