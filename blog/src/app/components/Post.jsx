"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import base_url from "../api/base_url";
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
import { useAuthHook } from "../hooks/useAuthHook";
import api from "../api/api";
import { useAuth } from "../contexts/useAuth";

const Post = ({ post, isUserPost, onDelete }) => {
  const { userId } = useAuth();
  const [image, setImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [user, setUser] = useState(null);
  const [clicked, setClicked] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState("");
  const [getAllComments, setGetAllComments] = useState([]);
  const [userImage, setUserImage] = useState({});
  const [username, setUsername] = useState({});

  const saveLike = (liked, disliked) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `post-${post.postId}-like`,
        JSON.stringify({ liked, disliked })
      );
    }
  };

  const loadLikeSaved = () => {
    if (typeof window !== "undefined") {
      const savedLike = JSON.parse(
        localStorage.getItem(`post-${post.postId}-like`)
      );
      if (savedLike) {
        setIsLiked(savedLike.liked);
        setIsDisliked(savedLike.disliked);
      }
    }
  };

  const commentsHandler = async () => {
    const postId = post.postId;

    if (!comments.trim()) {
      toast.warning("Please write a comment");
      return;
    }

    try {
      const response = await api.post(
        `/comments/user/${userId}/post/${postId}`,
        { comments: comments }
      );

      console.log("Comment success", response.data);

      const newComment = response.data;
      setComments("");

      setGetAllComments((prevComments) => {
        const updatedComments = [...prevComments, newComment];
        if (newComment.userId) {
          fetchUserComment(newComment.userId);
        }
        return updatedComments;
      });

      toast.success("Comment posted successfully!");
    } catch (error) {
      console.error(
        "Comment failed:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to post comment.");
    }
  };

  const getAllCommentsFromServer = async () => {
    const postId = post.postId;

    if (!postId) return;

    try {
      const response = await api.get(`/comments/post/${postId}`, {
        params: { pageNumber: 0, pageSize: 90 },
      });
      const { data } = response.data;
      const commentList = data.map(({ comments, id, userId }) => ({
        comments,
        id,
        userId,
      }));
      commentList.forEach((comment) => {
        if (comment.userId) {
          fetchUserComment(comment.userId);
        }
      });
      setGetAllComments(commentList);
    } catch (error) {
      console.log("Error fetching comments:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    await api
      .delete(`/posts/${post.postId}`, {})
      .then((response) => {
        console.log(response.data);
        if (onDelete) {
          onDelete(post.postId);
        }
        toast.success("Post deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post");
      });
  };

  const handleLikePost = async () => {
    const postId = post.postId;

    try {
      const response = await api.post(`/likePost`, null, {
        params: { userId, postId },
      });

      if (response.data) {
        setIsLiked(true);
        setIsDisliked(false);
        saveLike(true, false);
        console.log("Post liked", response.data);
      } else {
        setIsLiked(false);
        saveLike(false, isDisliked);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Could not toggle like on the post.");
    }
  };

  const handleDislikePost = async () => {
    const postId = post.postId;

    try {
      const response = await api.post(`/dislikePost`, null, {
        params: { userId, postId },
      });

      if (response.data) {
        setIsLiked(false);
        setIsDisliked(true);
        saveLike(false, true);
        console.log("Post Disliked", response.data);
      } else {
        setIsDisliked(false);
        saveLike(isLiked, false);
        toast.info("Dislike removed");
      }
    } catch (error) {
      console.error("Error disliking Post:", error);
    }
  };

  const fetchUserComment = async (userId) => {
    if (!userId) return;

    try {
      const response = await api.get(`/users/${userId}`, {});
      const { image, username: userName, imageUrl } = response.data;

      if (imageUrl) {
        setUserImage((prevImage) => ({ ...prevImage, [userId]: imageUrl }));
      } else if (image) {
        fetchUserImage(image, userId);
      }

      setUsername((prevUsername) => ({
        ...prevUsername,
        [userId]: userName,
      }));
    } catch (error) {
      console.log("Error fetching user comment data:", error);
    }
  };

  const fetchUserDetails = async () => {
    if (!post?.userId) {
      console.log("userId is not  available");
      return;
    }

    try {
      const response = await api.get(`/users/${post.userId}`, {});
      setUser(response.data);
    } catch (err) {
      console.log("Error fetching user details:", err);
    }
  };

  useEffect(() => {
    if (!post) return;

    const initializePost = async () => {
      loadLikeSaved();

      if (post.userId) {
        await fetchUserDetails();
      }

      if (post.postId) {
        await getAllCommentsFromServer();
      }
    };

    initializePost();
  }, [post?.postId, post?.userId]);

  // Fallback for user display
  const displayUsername = user?.username || "Unknown User";
  const displayUserImage = user?.imageUrl;

  return (
    <div className="flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-6 overflow-hidden">
        {/* Post Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={displayUserImage}
                alt={displayUsername}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
              />
              <div>
                <h3 className="font-bold text-gray-800 hover:text-indigo-600 cursor-pointer transition-colors">
                  {displayUsername.toUpperCase()}
                </h3>
                <p className="text-xs text-gray-500">
                  {post?.postDate
                    ? new Date(post.postDate).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Unknown date"}
                </p>
              </div>
            </div>

            {/* Options Menu */}
            {isUserPost && (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <FontAwesomeIcon
                    icon={faEllipsisV}
                    className="w-5 h-5 text-gray-600"
                  />
                </button>

                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden">
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center space-x-3 group"
                      >
                        <FontAwesomeIcon
                          icon={faEdit}
                          className="w-4 h-4 text-gray-600 group-hover:text-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                          Edit Post
                        </span>
                      </button>
                      <div className="border-t border-gray-100" />
                      <button
                        onClick={() => {
                          handleDelete();
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center space-x-3 group"
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="w-4 h-4 text-gray-600 group-hover:text-red-600"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                          Delete Post
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Post Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {post?.postTitle || "Untitled Post"}
          </h2>

          {/* Post Content */}
          <div className="text-gray-700 leading-relaxed">
            {post?.content && (
              <>
                {clicked && post.content.length > 200 ? (
                  <>
                    {post.content.substring(0, 200)}...
                    <button
                      onClick={() => setClicked(false)}
                      className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                    >
                      Read More
                    </button>
                  </>
                ) : (
                  <>
                    {post.content}
                    {post.content.length > 200 && (
                      <button
                        onClick={() => setClicked(true)}
                        className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                      >
                        Show Less
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Post Image */}
        {post?.imageUrl && (
          <div className="w-full">
            <img
              src={post.imageUrl}
              alt={post.postTitle}
              className="w-full h-auto max-h-[500px] object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Interaction Buttons */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {!isUserPost && (
                <>
                  <button
                    onClick={handleLikePost}
                    className={`flex items-center space-x-2 transition-all duration-200 ${
                      isLiked
                        ? "text-indigo-600"
                        : "text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    <FontAwesomeIcon icon={faThumbsUp} className="w-5 h-5" />
                    <span className="font-medium text-sm">Like</span>
                  </button>

                  <button
                    onClick={handleDislikePost}
                    className={`flex items-center space-x-2 transition-all duration-200 ${
                      isDisliked
                        ? "text-red-600"
                        : "text-gray-600 hover:text-red-600"
                    }`}
                  >
                    <FontAwesomeIcon icon={faThumbsDown} className="w-5 h-5" />
                    <span className="font-medium text-sm">Dislike</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <FontAwesomeIcon icon={faMessage} className="w-5 h-5" />
                <span className="font-medium text-sm">
                  Comment ({getAllComments.length})
                </span>
              </button>
            </div>

            <button className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <FontAwesomeIcon icon={faShare} className="w-5 h-5" />
              <span className="font-medium text-sm">Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-6 pb-6 border-t border-gray-100">
            {/* Comment Input */}
            <div className="mt-4 mb-6">
              <div className="flex items-start space-x-3">
                <img
                  src={displayUserImage}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none outline-none transition-all"
                    rows={2}
                  />
                  <button
                    onClick={commentsHandler}
                    disabled={!comments.trim()}
                    className="mt-2 flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {getAllComments.length > 0 ? (
                getAllComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={userImage[comment.userId]}
                      alt={username[comment.userId] || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {username[comment.userId] || "Unknown User"}
                        </h4>
                        <span className="text-xs text-gray-500">
                          · Just now
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.comments}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <UpdatePost post={post} model={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};

export default Post;
