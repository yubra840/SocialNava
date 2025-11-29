// src/pages/CreatePost/CreatePost.jsx
import React, { useState, useEffect } from "react";
import "./CreatePost.css";
import {
  databases,
  storage,
  account,
  DATABASE_ID,
  POSTS_COLLECTION_ID,
  BUCKET_ID,
} from "../../appwrite/config";
import { ID } from "appwrite";
import { Button, TextField, MenuItem, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const CreatePost = () => {
  const [user, setUser] = useState(null);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(""); // ✅ to distinguish between image or video
  const [dragActive, setDragActive] = useState(false);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);

  // Available tag options
  const tags = [
    "Nature",
    "Technology",
    "Fashion",
    "Food",
    "Sports",
    "Travel",
    "Education",
    "Music",
    "Art",
  ];

  // ✅ Fetch current logged-in user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        alert("You must be logged in to create a post.");
        window.location.href = "/login";
      }
    };
    getCurrentUser();
  }, []);

  // 🖱️ Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setFileType(droppedFile.type.startsWith("video") ? "video" : "image");
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileType(selected.type.startsWith("video") ? "video" : "image");
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !caption.trim() || !tag) {
      alert("Please add a caption, select a tag, and choose a file (image or video).");
      return;
    }

    if (!user) {
      alert("User not found. Please log in again.");
      return;
    }

    setLoading(true); // start loading

    try {
      // 1️⃣ Upload file to Appwrite Storage
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const mediaUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);

      // 2️⃣ Create new post document in Appwrite Database
      await databases.createDocument(DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), {
        username: user.name || user.email,
        caption,
        tag,
        mediaUrl,
        mediaType: fileType, // ✅ store whether it's an image or video
        likes: 0,
        saves: 0,
      });

      // 3️⃣ Redirect user to Home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Try again.");
    } finally {
      setLoading(false); // end loading
    }
  };

  return (
    <div className="create-post-page">
<div className="create-post">
      {loading && (
        <div className="loading-overlay">
          <CircularProgress color="primary" />
          <p>🌍 Uploading to SocialNava universe...</p>
        </div>
      )}

      <h2>Create New Post</h2>

      <form className="create-post-form" onSubmit={handleSubmit}>
        {/* Caption input */}
        <TextField
          className="textarea"
          label="Caption"
          variant="outlined"
          fullWidth
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          required
        />

        {/* Tag selection */}
        <TextField
          className="textarea"
          select
          label="Select Tag"
          variant="outlined"
          fullWidth
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          required
          style={{ marginTop: "15px" }}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: "#080808ff",
                },
              },
            },
          }}
        >
          {tags.map((option) => (
            <MenuItem
              className="tagoptions"
              key={option}
              value={option}
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "#414141ff" },
              }}
            >
              {option}
            </MenuItem>
          ))}
        </TextField>

        {/* Drag and drop area */}
        <div
          className={`drop-zone ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            fileType === "video" ? (
              <video controls className="preview-video">
                <source src={preview} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={preview} alt="Preview" className="preview-image" />
            )
          ) : (
            <p>Drag and drop your image or video here</p>
          )}
        </div>

        {/* Upload from device */}
        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-btn">
            <CloudUploadIcon /> Upload from device
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            hidden
          />
        </div>

        {/* Submit button */}
        <Button type="submit" variant="contained" color="primary" className="submit-btn">
          Create Post
        </Button>
      </form>
    </div>
    </div>
    
  );
};

export default CreatePost;
