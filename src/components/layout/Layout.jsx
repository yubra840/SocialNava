// src/components/layout/Layout.jsx
import React from "react";
import "./Layout.css";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-content">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
