import React, { createContext, useContext, useEffect, useState } from "react";
import { account, databases, DATABASE_ID } from "../appwrite/config";
import { ID } from "appwrite";

// create the context
const AuthContext = createContext();

// provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ fetch current user from Appwrite
  const getCurrentUser = async () => {
    try {
      const response = await account.get();
      if (response) {
        // get extra profile details from Users collection
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          response.$id
        );
        setUser({ ...response, ...userDoc });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log("No active session:", err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ login function
  const login = async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      await getCurrentUser();
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    }
  };

  // ✅ register new user
  const register = async (email, password, username) => {
    try {
      const newAccount = await account.create(ID.unique(), email, password, username);

      // create a corresponding document in Users collection
      await databases.createDocument(DATABASE_ID, USERS_COLLECTION_ID, newAccount.$id, {
        username,
        email,
        followers: [],
        following: [],
        about: "",
        avatarUrl: "",
      });

      await login(email, password);
    } catch (err) {
      console.error("Registration error:", err.message);
      throw err;
    }
  };

  // ✅ logout
  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

  // ✅ update user info (used for About section, avatar, etc.)
  const updateUserProfile = async (updates) => {
    if (!user) return;
    try {
      const updatedDoc = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        updates
      );
      setUser({ ...user, ...updatedDoc });
    } catch (err) {
      console.error("Profile update error:", err.message);
      throw err;
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updateUserProfile,
        getCurrentUser,
        setUser,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// custom hook
export const useAuth = () => useContext(AuthContext);
