"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEllipsisV,
  faMessage,
  faPaperPlane,
  faShare,
  faThumbsDown,
  faThumbsUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import UpdatePost from "./UpdatePost";
import { useAuth } from "../contexts/useAuth";
import api from "../api/api";

const DEFAULT_AVATAR = "/default-avatar.png";

const Post = ({ post, isUserPost, onDelete }) => {
  const { userId, imageUrl: loggedInUserImage } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [reactionLoading, setReactionLoading] = useState(false);

  const [clicked, setClicked] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const displayUsername = post?.username || "Unknown User";
  const displayUserImage = post?.userImageUrl || DEFAULT_AVATAR;

  const saveReactionState = (liked, disliked) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `post-${post.postId}-reaction`,
        JSON.stringify({ liked, disliked })
      );
    }
  };

  const loadReactionState = () => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(`post-${post.postId}-reaction`));
        if (saved) {
          setIsLiked(saved.liked ?? false);
          setIsDisliked(saved.disliked ?? false);
        }
      } catch { /* ignore */ }
    }
  };

  const fetchReactionCounts = async () => {
    try {
      const response = await api.get(`/posts/${post.postId}/reactions`);
      setLikeCount(response.data?.likeCount ?? 0);
      setDislikeCount(response.data?.dislikeCount ?? 0);
    } catch (error) {
      console.error("Error fetching reaction counts:", error);
    }
  };

  const handleLikePost = async () => {
    if (reactionLoading) return;
    setReactionLoading(true);
    const wasLiked = isLiked;
    const wasDisliked = isDisliked;
    const newLiked = !wasLiked;
    const newDisliked = wasLiked ? wasDisliked : false;
    setIsLiked(newLiked);
    setIsDisliked(newDisliked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    if (wasDisliked) setDislikeCount((prev) => prev - 1);
    try {
      const response = await api.post(`/likePost`, null, {
        params: { userId, postId: post.postId },
      });
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
      saveReactionState(response.data.liked, newDisliked);
    } catch (error) {
      setIsLiked(wasLiked);
      setIsDisliked(wasDisliked);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
      if (wasDisliked) setDislikeCount((prev) => prev + 1);
      toast.error("Could not update like.");
    } finally {
      setReactionLoading(false);
    }
  };

  const handleDislikePost = async () => {
    if (reactionLoading) return;
    setReactionLoading(true);
    const wasLiked = isLiked;
    const wasDisliked = isDisliked;
    const newDisliked = !wasDisliked;
    const newLiked = wasDisliked ? wasLiked : false;
    setIsDisliked(newDisliked);
    setIsLiked(newLiked);
    setDislikeCount((prev) => (newDisliked ? prev + 1 : prev - 1));
    if (wasLiked) setLikeCount((prev) => prev - 1);
    try {
      const response = await api.post(`/dislikePost`, null, {
        params: { userId, postId: post.postId },
      });
      setIsDisliked(response.data.disliked);
      setDislikeCount(response.data.dislikeCount);
      saveReactionState(newLiked, response.data.disliked);
    } catch (error) {
      setIsDisliked(wasDisliked);
      setIsLiked(wasLiked);
      setDislikeCount((prev) => (newDisliked ? prev - 1 : prev + 1));
      if (wasLiked) setLikeCount((prev) => prev + 1);
      toast.error("Could not update dislike.");
    } finally {
      setReactionLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!post?.postId) return;
    try {
      const response = await api.get(`/comments/post/${post.postId}`, {
        params: { pageNumber: 0, pageSize: 90 },
      });
      setComments(response.data?.data ?? []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) { toast.warning("Please write a comment"); return; }
    try {
      const response = await api.post(`/comments/user/${userId}/post/${post.postId}`, { comments: commentText });
      setComments((prev) => [...prev, response.data]);
      setCommentText("");
      toast.success("Comment posted!");
    } catch (error) {
      toast.error("Failed to post comment.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${post.postId}`);
      if (onDelete) onDelete(post.postId);
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  useEffect(() => {
    if (!post) return;
    loadReactionState();
    fetchReactionCounts();
    fetchComments();
  }, [post?.postId]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .post-card {
          font-family: 'DM Sans', sans-serif;
          background: #ffffff;
          border: 1px solid #e8e3db;
          border-radius: 4px;
          margin-bottom: 2rem;
          overflow: hidden;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
          position: relative;
        }
        .post-card:hover {
          box-shadow: 0 8px 40px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .post-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #1a1a1a 0%, #c9a96e 100%);
        }
        .post-header {
          padding: 1.5rem 1.75rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .author-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .author-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e8e3db;
        }
        .author-name {
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1a1a1a;
        }
        .post-date {
          font-size: 0.75rem;
          color: #9e9589;
          margin-top: 2px;
          font-weight: 300;
        }
        .post-body {
          padding: 1.25rem 1.75rem 1.5rem;
        }
        .post-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.25;
          margin-bottom: 0.85rem;
          letter-spacing: -0.01em;
        }
        .post-content {
          font-size: 0.95rem;
          color: #4a4540;
          line-height: 1.75;
          font-weight: 300;
        }
        .read-more-btn {
          background: none;
          border: none;
          color: #c9a96e;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0;
          margin-left: 6px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid #c9a96e;
          transition: opacity 0.2s;
        }
        .read-more-btn:hover { opacity: 0.7; }
        .post-image-wrap {
          width: 100%;
          max-height: 420px;
          overflow: hidden;
        }
        .post-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .post-card:hover .post-image-wrap img {
          transform: scale(1.01);
        }
        .post-actions {
          padding: 1rem 1.75rem;
          border-top: 1px solid #f0ece6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .action-group {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .action-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          color: #7a7268;
          cursor: pointer;
          padding: 0.35rem 0;
          letter-spacing: 0.03em;
          transition: color 0.2s;
          border-bottom: 2px solid transparent;
        }
        .action-btn:hover { color: #1a1a1a; }
        .action-btn.liked { color: #1a1a1a; border-bottom-color: #c9a96e; }
        .action-btn.disliked { color: #c0392b; border-bottom-color: #c0392b; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.4rem 0.5rem;
          border-radius: 3px;
          color: #9e9589;
          transition: background 0.2s, color 0.2s;
        }
        .menu-btn:hover { background: #f5f1eb; color: #1a1a1a; }
        .dropdown-menu {
          position: absolute;
          right: 1.75rem;
          top: 3.5rem;
          background: #fff;
          border: 1px solid #e8e3db;
          border-radius: 3px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          z-index: 20;
          min-width: 150px;
          overflow: hidden;
        }
        .dropdown-item {
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          padding: 0.75rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          color: #4a4540;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: background 0.15s;
        }
        .dropdown-item:hover { background: #f5f1eb; }
        .dropdown-item.danger:hover { background: #fdf0f0; color: #c0392b; }
        .dropdown-divider { height: 1px; background: #f0ece6; }
        .comment-section {
          padding: 1.25rem 1.75rem 1.75rem;
          border-top: 1px solid #f0ece6;
          background: #fdf9f5;
        }
        .comment-input-wrap {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }
        .comment-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid #e8e3db;
        }
        .comment-textarea {
          flex: 1;
          padding: 0.7rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #1a1a1a;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          resize: none;
          outline: none;
          background: #fff;
          transition: border-color 0.2s;
          font-weight: 300;
        }
        .comment-textarea:focus { border-color: #c9a96e; }
        .comment-submit-btn {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #1a1a1a;
          color: #fff;
          border: none;
          padding: 0.5rem 1.1rem;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .comment-submit-btn:hover { background: #c9a96e; }
        .comment-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          max-height: 360px;
          overflow-y: auto;
        }
        .comment-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 0.9rem;
          background: #fff;
          border: 1px solid #f0ece6;
          border-radius: 3px;
        }
        .comment-author {
          font-weight: 600;
          font-size: 0.8rem;
          color: #1a1a1a;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .comment-text {
          font-size: 0.88rem;
          color: #4a4540;
          line-height: 1.6;
          font-weight: 300;
        }
        .no-comments {
          text-align: center;
          color: #9e9589;
          font-size: 0.85rem;
          padding: 1.5rem 0;
          font-style: italic;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
        }
      `}</style>

      <div className="post-card">
        {/* Header */}
        <div className="post-header">
          <div className="author-row">
            <img
              src={displayUserImage}
              alt={displayUsername}
              className="author-avatar"
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
            />
            <div>
              <div className="author-name">{displayUsername}</div>
              <div className="post-date">
                {post?.postDate
                  ? new Date(post.postDate).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : "Unknown date"}
              </div>
            </div>
          </div>

          {isUserPost && (
            <div style={{ position: "relative" }}>
              <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
                <FontAwesomeIcon icon={faEllipsisV} style={{ width: 16, height: 16 }} />
              </button>
              {isOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setIsOpen(false)} />
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => { setShowModal(true); setIsOpen(false); }}>
                      <FontAwesomeIcon icon={faEdit} style={{ width: 13 }} />
                      Edit Post
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={() => { handleDelete(); setIsOpen(false); }}>
                      <FontAwesomeIcon icon={faTrash} style={{ width: 13 }} />
                      Delete Post
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="post-body">
          <h2 className="post-title">{post?.postTitle || "Untitled Post"}</h2>
          <div className="post-content">
            {post?.content && (
              <>
                {clicked && post.content.length > 200 ? (
                  <>
                    {post.content.substring(0, 200)}...
                    <button className="read-more-btn" onClick={() => setClicked(false)}>Read More</button>
                  </>
                ) : (
                  <>
                    {post.content}
                    {post.content.length > 200 && (
                      <button className="read-more-btn" onClick={() => setClicked(true)}>Show Less</button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Image */}
        {post?.imageUrl && (
          <div className="post-image-wrap">
            <img src={post.imageUrl} alt={post.postTitle} onError={(e) => { e.target.style.display = "none"; }} />
          </div>
        )}

        {/* Actions */}
        <div className="post-actions">
          <div className="action-group">
            {!isUserPost && (
              <>
                <button
                  className={`action-btn ${isLiked ? "liked" : ""}`}
                  onClick={handleLikePost}
                  disabled={reactionLoading}
                >
                  <FontAwesomeIcon icon={faThumbsUp} style={{ width: 14 }} />
                  {likeCount > 0 ? `${likeCount} ` : ""}Like
                </button>
                <button
                  className={`action-btn ${isDisliked ? "disliked" : ""}`}
                  onClick={handleDislikePost}
                  disabled={reactionLoading}
                >
                  <FontAwesomeIcon icon={faThumbsDown} style={{ width: 14 }} />
                  {dislikeCount > 0 ? `${dislikeCount} ` : ""}Dislike
                </button>
              </>
            )}
            <button className="action-btn" onClick={() => setShowComments(!showComments)}>
              <FontAwesomeIcon icon={faMessage} style={{ width: 14 }} />
              {comments.length > 0 ? `${comments.length} ` : ""}Comments
            </button>
          </div>
          <button className="action-btn">
            <FontAwesomeIcon icon={faShare} style={{ width: 14 }} />
            Share
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="comment-section">
            <div className="comment-input-wrap">
              <img
                src={loggedInUserImage || DEFAULT_AVATAR}
                alt="Your avatar"
                className="comment-avatar"
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
              <div style={{ flex: 1 }}>
                <textarea
                  className="comment-textarea"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={2}
                />
                <button
                  className="comment-submit-btn"
                  onClick={handlePostComment}
                  disabled={!commentText.trim()}
                >
                  <FontAwesomeIcon icon={faPaperPlane} style={{ width: 12 }} />
                  Publish
                </button>
              </div>
            </div>

            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <img
                      src={comment.userImageUrl || DEFAULT_AVATAR}
                      alt={comment.username}
                      className="comment-avatar"
                      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div>
                      <div className="comment-author">{comment.username || "Unknown"}</div>
                      <p className="comment-text">{comment.comments}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet — start the conversation.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <UpdatePost post={post} model={() => setShowModal(false)} />
        </div>
      )}
    </>
  );
};

export default Post;