import React from "react";
import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Explore from "../pages/Explore/Explore";
import People from "../pages/People/People";
import Saved from "../pages/Saved/Saved";
import ConversationPage from "../pages/ConversationPage/ConversationPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import CreatePost from "../pages/CreatePost/CreatePost";

const AppRouter = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
       <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/people" element={<People />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/conversation">
                  <Route index element={<ConversationPage />} />
                  <Route path=":username" element={<ConversationPage />} />
          </Route>
          <Route path="/profile/:username" element={<ProfilePage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
