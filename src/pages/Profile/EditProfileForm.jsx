import React, { useState, useEffect } from "react";
import { Button, Avatar, TextField, CircularProgress } from "@mui/material";
import { databases, storage, account } from "../../appwrite/config";
import { Query, ID } from "appwrite";
import { useNavigate } from "react-router-dom";


import "./ProfilePage.css";

export default function EditProfileForm({ userData, onCancel, onUpdate }) {
  const [username, setUsername] = useState(userData.username);
  const [about, setAbout] = useState(userData.about || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false); // <-- Track save/loading state
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [profilePicId, setProfilePicId] = useState(userData.profilePic);
  const [newProfileSelected, setNewProfileSelected] = useState(false);
  const navigate = useNavigate();

  // Generate profile picture preview URL
  useEffect(() => {
    if (profilePicId) {
      const url = storage.getFileView(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        profilePicId
      );
      setProfilePicUrl(url);
    }
  }, [profilePicId]);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const uploadedFile = await storage.createFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        ID.unique(),
        file
      );

      const url = storage.getFileView(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        uploadedFile.$id
      );
      setProfilePicUrl(url);
      setProfilePicId(uploadedFile.$id);
      setNewProfileSelected(true);
    } catch (err) {
      console.error("Error uploading profile picture:", err);
    } finally {
      setUploading(false);
    }
  };

  const checkUsernameExists = async (newName) => {
    const result = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("username", newName)]
    );
    return result.total > 0 && newName !== userData.username;
  };

  const handleSave = async () => {

    try {
      setSaving(true);

      if (await checkUsernameExists(username)) {
        alert("Username is already taken. Please choose a different name.");
        setSaving(false);
        return;
      }

      const updatedData = { username, about };
      if (newProfileSelected) updatedData.profilePic = profilePicUrl;

      await account.updateName(username);

      await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        userData.$id,
        updatedData
      );

      const posts = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
        [Query.equal("username", userData.username)]
      );

      for (const post of posts.documents) {
        await databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
          post.$id,
          { username }
        );
      }
    onUpdate(updatedData);
navigate(`/profile/${username}`);
navigate(0); // Refresh the page to reflect changes
    } catch (err) {
      console.error("Error updating profile:", err);
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-form">
      <Avatar
        src={
          newProfileSelected
            ? profilePicUrl
            : profilePicId
        }
        sx={{ width: 100, height: 100 }}
      />

      <input
        type="file"
        onChange={handleProfilePicChange}
        disabled={uploading}
        style={{ marginTop: "1rem" }}
      />

      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ style: { color: "green", fontWeight: "bold" } }}
      />

      <TextField
        label="About"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        multiline
        rows={4}
        fullWidth
        margin="normal"
        InputLabelProps={{ style: { color: "green", fontWeight: "bold" } }}
      />

      <div className="buttons" style={{ marginTop: "1rem" }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={uploading || saving}
        >
          {saving ? <CircularProgress size={24} color="green" /> : "Save"}
        </Button>

        <Button
          variant="outlined"
          onClick={onCancel}
          style={{ marginLeft: "1rem" }}
          disabled={saving || uploading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
