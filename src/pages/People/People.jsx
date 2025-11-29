import React, { useState, useEffect } from "react";
import "./People.css";
import UserCard from "../../components/users/UserCard";
import { account, databases } from "../../appwrite/config";
import { DATABASE_ID, USERS_COLLECTION_ID } from "../../appwrite/config";

export default function People() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserReady, setIsUserReady] = useState(false);

  const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const USERS_COL = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

  // Fetch current user if logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUserAccount = await account.get();
        const profile = await databases.getDocument(DB_ID, USERS_COL, currentUserAccount.$id);
        setCurrentUser(profile);
      } catch (err) {
        console.log("No user logged in, continuing as guest.");
        setCurrentUser(null); // Guest user
      } finally {
        setIsUserReady(true);
      }
    };
    fetchUser();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const result = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);

      // Exclude current user if logged in
      const filteredUsers = currentUser
        ? result.documents.filter((u) => u.$id !== currentUser.$id)
        : result.documents;

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (isUserReady) fetchUsers();
  }, [isUserReady, currentUser]);

  // Filter users by search term
  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="people-page">
      <h2>People</h2>

      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="people-search"
      />

      <div className="people-list">
        {filteredUsers.map((u) => (
          <UserCard key={u.$id} user={u} currentUser={currentUser} />
        ))}
      </div>
    </div>
  );
}
