import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { databases, account } from "../../appwrite/config";
import CurrentUserProfile from "./CurrentUserProfile";
import OtherUserProfile from "./OtherUserProfile";
import "./ProfilePage.css";
import { Query } from "appwrite";

export default function ProfilePage() {
  const { username } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);

  // fetch current logged-in user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await account.get();
        setCurrentUser(res);
      } catch (err) {
        console.warn("No logged in user:", err);
        setCurrentUser(null);
      } finally {
        setLoadingCurrentUser(false);
      }
    };
    getCurrentUser();
  }, []);

  // fetch profile user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
          [Query.equal("username", username)]
        );
        if (res.documents.length > 0) setUserData(res.documents[0]);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoadingUserData(false);
      }
    };
    fetchUser();
  }, [username]);

  // wait for both currentUser and userData
  if (loadingUserData || loadingCurrentUser) return <div className="profile-loading">Loading...</div>;
  if (!userData) return <div className="profile-error">User not found</div>;

  // check if the profile is the current user
  const isCurrentUser = currentUser?.name?.trim() === userData?.username?.trim();

  return (
    <div className="profile-page">
      {isCurrentUser ? (
        <CurrentUserProfile userData={userData} currentUser={currentUser} />
      ) : (
        <OtherUserProfile userData={userData} currentUser={currentUser} />
      )}
    </div>
  );
}
