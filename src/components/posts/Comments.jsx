// src/components/posts/Comments.jsx
import React, { useEffect, useState } from "react";
import "./Comments.css";

import { databases, account } from "../../appwrite/config";
import { ID, Query } from "appwrite";

import {
  DATABASE_ID,
  USERS_COLLECTION_ID,
  POSTS_COLLECTION_ID,
  COMMENTS_COLLECTION_ID,
} from "../../appwrite/config";

import ReplyIcon from "@mui/icons-material/Reply";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import avatar from "../../assets/default-avatar.png";

export default function Comments({ post, onPostChange }) {
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [openRepliesFor, setOpenRepliesFor] = useState(null);


  const currentUsername = localStorage.getItem("currentUsername");

  /* --------------------------------------------
     GET CURRENT USER
  -------------------------------------------- */
  useEffect(() => {
    const getUser = async () => {
      try {
        const authUser = await account.get();

        const res = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal("$id", authUser.$id)]
        );

        if (res.documents.length > 0) {
          const profile = res.documents[0];

          setCurrentUser({
            ...profile,
            profilePic: profile.profilePic || avatar,
          });

        } else {
          console.warn("No matching user profile found.");
        }
      } catch (err) {
        console.error("Error getting user:", err);
      }
    };

    getUser();
  }, []);

  const usernamee = currentUser?.username;

  /* --------------------------------------------
     FETCH COMMENTS
  -------------------------------------------- */
  const fetchComments = async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        [Query.orderDesc("$createdAt")]
      );

      const filtered = res.documents.filter((c) => c.post === post.$id);
      const finalTree = buildTree(filtered);
      setComments(finalTree);
    } catch (err) {
      console.error("fetchComments error:", err);
    }
  };

  /* --------------------------------------------
     BUILD COMMENT TREE
  -------------------------------------------- */
  const buildTree = (list) => {
    const map = {};
    const roots = [];

    list.forEach((c) => {
      map[c.$id] = { ...c, replies: [] };
    });

    list.forEach((c) => {
      if (c.parent?.[0]) {
        const parentId = c.parent[0].$id;
        map[parentId]?.replies.push(map[c.$id]);
      } else {
        roots.push(map[c.$id]);
      }
    });

    return roots;
  };

  useEffect(() => {
    fetchComments();
  }, [post.$id]);

  /* --------------------------------------------
     CREATE COMMENT
  -------------------------------------------- */

  const createComment = async () => {
  if (!newText.trim()) return;

  setLoading(true);

  try {
   
    // 1. Create the comment
    await databases.createDocument(
      DATABASE_ID,
      COMMENTS_COLLECTION_ID,
      ID.unique(),
      {
        post: post.$id,
        user: currentUser.$id,
        username: currentUsername,
        profilePic: currentUser.profilePic,
        text: newText.trim(),
        likedBy: [],
        likes: 0,
      }
    );
     // 3. Increment comment count in post
      await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION_ID, post.$id, {
        commentsCount: (post.commentsCount || 0) + 1,
      });
       // 4. Update frontend immediately
           const newCount = (post.commentsCount || 0) + 1;

    if (typeof onPostChange === "function") {
      onPostChange({
        ...post,
        commentsCount: newCount,
      });
    }
    
    // 5. Refresh UI
    setNewText("");
    fetchComments();

  } catch (err) {
    console.error("createComment error:", err);
  } finally {
    setLoading(false);
  }
};

  /* --------------------------------------------
     CREATE REPLY
  -------------------------------------------- */
  const createReply = async (parentId) => {
    if (!replyText.trim()) return;

    setLoading(true);

    try {
      await databases.createDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          post: post.$id,
          user: currentUser.$id,
          username: currentUsername,
          profilePic: currentUser.profilePic,
          parent: [parentId],
          text: replyText.trim(),
          likedBy: [],
          likes: 0,
        }
      );
      

      setReplyTo(null);
      setReplyText("");
      fetchComments();
    } catch (err) {
      console.error("createReply error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------
     LIKE / UNLIKE COMMENT
  -------------------------------------------- */
  const toggleLike = async (commentId, likedBy = []) => {
    const updated = likedBy.includes(usernamee)
      ? likedBy.filter((u) => u !== usernamee)
      : [...likedBy, usernamee];

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        commentId,
        {
          likedBy: updated,
          likes: updated.length,
        }
      );

      fetchComments();
    } catch (err) {
      console.error("toggleLike error:", err);
    }
  };

  /* --------------------------------------------
     RENDER
  -------------------------------------------- */
  return (
    <div className="comments-root">

      {/* Add Comment Input */}
      <div className="add-comment">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Write a comment..."
          disabled={loading}
        />

        <button onClick={createComment} disabled={loading}>
          {loading ? "Posting..." : "Comment"}
        </button>
      </div>

      {/* Comment List */}
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.$id} className="comment-item">

            <div className="comment-main">
              <div className="comment-meta"
               onClick={() =>
            (window.location.href = `/profile/${c.username}`)
          }
              >
                <img
                  src={c.profilePic || avatar}
                  alt={c.username || "User"}
                  className="comment-user-pic"
                />

                <span className="comment-user">{c.username || "Unknown"}</span>
              </div>

              <div className="comment-text">{c.text}</div>

              <div className="comment-actions">
                <button
                  onClick={() => toggleLike(c.$id, c.likedBy || [])}
                  className={(c.likedBy || []).includes(usernamee) ? "active" : ""}
                >
                  <ThumbUpAltIcon className="comment-like-icon" /> {c.likes || 0}
                </button>

                <button
                   onClick={() => {
                   setReplyTo(c.$id); 
                   setOpenRepliesFor(openRepliesFor === c.$id ? null : c.$id);
                 }}
                >
                <ReplyIcon className="comment-reply-icon" />
                </button>
              </div>
            </div>

            {/* Replies */}
            <div className="replies">

  {/* SHOW REPLIES ONLY WHEN REPLY ICON IS CLICKED */}
  {openRepliesFor === c.$id &&
    c.replies.map((r) => (
      <div key={r.$id} className="reply-item">
        <div
          className="reply-meta"
          onClick={() => (window.location.href = `/profile/${r.username}`)}
        >
          <img
            src={r.profilePic || avatar}
            alt={r.username || "User"}
            className="comment-user-pic"
          />

          <span className="reply-user">{r.username || "Unknown"}</span>
        </div>

        <div className="reply-text">{r.text}</div>

        <button
          onClick={() => toggleLike(r.$id, r.likedBy || [])}
          className={(r.likedBy || []).includes(usernamee) ? "active" : ""}
        >
          <ThumbUpAltIcon className="reply-like-icon" /> {r.likes || 0}
        </button>
      </div>
    ))}

  {/* Reply Input Box */}
  {replyTo === c.$id && (
    <div className="reply-input">
      <input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder={`Reply to ${c.username || "comment"}...`}
        disabled={loading}
      />

      <button onClick={() => createReply(c.$id)} disabled={loading}>
        {loading ? "Posting..." : "Reply"}
      </button>
    </div>
  )}

</div>
          </div>
        ))}
      </div>
    </div>
  );
}
