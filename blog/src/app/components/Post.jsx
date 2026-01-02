"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import base_url from "../api/base_url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumpster,
  faEdit,
  faEllipsis,
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import UpdatePost from "./UpdatePost";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { Form, FormGroup, Input } from "reactstrap";

const Post = ({ post, isUserPost, onDelete }) => {
  const [image, setImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isNotLiked, setIsNotLiked] = useState(false);
  const [user, setUser] = useState();
  const [clicked, setClicked] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState("");
  const [getAllComments, setGetAllComments] = useState([]);
  const [userImage, setUserImage] = useState({});
  const [username, setUsername] = useState([]);
  const getToken = () => {
    return localStorage.getItem("token");
  };
  const getUserId = () => {
    return localStorage.getItem("userId");
  };
  const saveLike = (liked, disliked) => {
    localStorage.setItem(
      `post-${post.postId}-like`,
      JSON.stringify({ liked, disliked })
    );
  };
  const loadLikeSaved = () => {
    const savedLike = JSON.parse(
      localStorage.getItem(`post-${post.postId}-like`)
    );
    if (savedLike) {
      setIsLiked(savedLike.liked);
      setIsNotLiked(savedLike.disliked);
    }
  };
  const toggleComment = () => {
    setShowComments(!showComments);
  };
  const commentsHandler = async () => {
    const userId = getUserId();
    const token = getToken();
    const postId = post.postId;
    try {
      const response = await axios.post(
        `${base_url}/comments/user/${userId}/post/${postId}`,
        { comments: comments },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Comment success", response.data);

      const newComment = response.data; // Assuming response.data contains the newly created comment
      setComments(""); // Clear the comment input

      // Update the comments list with the new comment
      setGetAllComments((prevComments) => {
        const updatedComments = [...prevComments, newComment];
        if (newComment.userId) {
          fetchUserComment(newComment.userId); // Fetch the user's image for the new comment
        }
        return updatedComments;
      });
    } catch (error) {
      console.error(
        "Comment failed:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to post comment.");
    }
  };

  const getAllCommentsFromServer = async () => {
    const token = getToken();
    const postId = post.postId;
    try {
      const response = await axios.get(`${base_url}/comments/post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { pagNumber: 0, pageSize: 3 },
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
      console.log(error);
    }
  };

  const handleDelete = () => {
    axios
      .delete(`${base_url}/posts/${post.postId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        onDelete(post.postId); // Call the delete handler passed from the parent
        toast.success("Post deleted successfully"); // Show success toast
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post"); // Show error toast
      });
  };
  const fetchImage = async () => {
    const token = getToken();
    await axios
      .get(`${base_url}${post.image}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Ensures we get the image as a blob
      })
      .then((response) => {
        const imageURL = URL.createObjectURL(response.data); // Create a URL for the blob

        setImage(imageURL); // Update the state with the image URL
      })
      .catch((err) => {
        console.log("Cannot fetch the image:", err);
      });
  };
  const showProfile = () => {};
  const handleLikePost = async () => {
    const token = getToken();
    const userId = getUserId();
    const postId = post.postId;

    try {
      const response = await axios.post(`${base_url}/likePost`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId, postId },
      });

      if (response.data) {
        // A like was added
        setIsLiked(true);
        setIsNotLiked(false); // Ensure dislike is removed if liking
        saveLike(true, false);
        console.log("Post liked", response.data);
      } else {
        // Like was removed
        setIsLiked(false);
        saveLike(false, isNotLiked);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Could not toggle like on the post.");
    }
  };

  const handleDislikePost = async () => {
    const token = getToken();
    const userId = getUserId();
    const postId = post.postId;
    try {
      const response = await axios.post(`${base_url}/dislikePost`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId, postId },
      });
      if (response.data) {
        setIsLiked(false);
        setIsNotLiked(true);
        saveLike(false, true);
        console.log("Post Disliked", response.data);
      } else {
        setIsNotLiked(false);
        saveLike(isLiked, false);
        toast.info("DisLike removed");
      }
    } catch (error) {
      console.error("Error disliking Post: ", error.response.data);
    }
  };

  const fetchUserImage = async (imageName, userId) => {
    const token = getToken();
    await axios
      .get(`${base_url}/users/getImage/${imageName}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })
      .then((response) => {
        const imageURL = URL.createObjectURL(response.data);
        setUserImage((prevImage) => ({ ...prevImage, [userId]: imageURL }));
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const fetchUserComment = async (userId) => {
    const token = getToken();
    await axios
      .get(`${base_url}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const { image, username } = response.data;
        if (image) {
          fetchUserImage(image, userId);
        }
        setUsername((prevUsername) => ({
          ...prevUsername,
          [userId]: username,
        }));
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  const fetchUserDetails = async () => {
    const token = getToken();
    await axios
      .get(`${base_url}/users/${post.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };

  useEffect(() => {
    if (post?.image) {
      fetchImage();
    }
    if (post?.userId) {
      fetchUserDetails();
    }
    getAllCommentsFromServer();
    // getUserData();
    loadLikeSaved();
  }, [post?.image, post?.userId]);

  return (
    <div className="flex justify-center flex-col items-center">
      <div className="max-w-sm w-full h-auto rounded-md overflow-hidden shadow-lg bg-white m-4 cursor-pointer transition-transform hover:scale-105 hover:shadow-xl">
        <div className="px-6 py-4 h-auto flex flex-col justify-between">
          {/* Post Date */}
          <div className="flex justify-between ">
            <p className="text-gray-500 text-xs mb-2">
              {new Date(post?.postDate).toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="relative">
              {isUserPost && (
                <div>
                  {/* Three-dot icon button */}
                  <button
                    onClick={() => setIsOpen((prevState) => !prevState)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    aria-label="Post options"
                  >
                    <FontAwesomeIcon
                      icon={faEllipsis}
                      className="w-5 h-5 text-gray-600"
                    />
                  </button>

                  {/* Dropdown menu with animation */}
                  {isOpen && (
                    <>
                      {/* Backdrop to close dropdown when clicking outside */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                      />

                      {/* Dropdown content */}
                      <div className="absolute right-0 top-12 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden animate-slideDown">
                        {/* Delete option */}
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors duration-150 flex items-center gap-3 group"
                          onClick={() => {
                            handleDelete();
                            setIsOpen(false);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faDumpster}
                            className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors duration-150"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                            Delete Post
                          </span>
                        </button>

                        {/* Divider */}
                        <div className="border-t border-gray-100" />

                        {/* Edit option */}
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors duration-150 flex items-center gap-3 group"
                          onClick={() => {
                            setShowModel(true);
                            setIsOpen(false);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            className="w-4 h-4 text-gray-500 group-hover:text-green-500 transition-colors duration-150"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                            Edit Post
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {user && (
            <p className="text-gray-700 text-sm mb-2 ">
              <span className="font-medium text-lg no-underline hover:underline decoration-cyan-300 hover:text-cyan-300 hover:underline-offset-4">
                {user.username.toUpperCase()}
              </span>
            </p>
          )}
          {/* Post Title */}
          <h2 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">
            {post?.postTitle}
          </h2>

          {/* Post Content (Truncated) */}
          <p
            className={`text-gray-700 text-base mb-4 overflow-hidden ${
              clicked ? "line-clamp-3" : ""
            }`}
          >
            {post?.content.length > 99 && clicked ? (
              <>
                {`${post?.content.substring(0, 100)}.....`}
                <button
                  onClick={() => setClicked(false)}
                  className="text-blue-300 text-xs hover:underline"
                >
                  Read More
                </button>
              </>
            ) : (
              <>
                {post?.content}
                {post?.content.length > 99 && (
                  <button
                    onClick={() => setClicked(true)}
                    className="text-blue-300 text-xs hover:underline"
                  >
                    Read Less
                  </button>
                )}
              </>
            )}
          </p>

          {/* Read More Button */}
          <div className="mt-auto"></div>
          {image && (
            <div className="mt-4  bg-gray-100 relative ">
              <img
                className=" w-full h-full object-contain transition-opacity hover:opacity-90"
                src={image}
                alt={post?.postTitle}
              />
            </div>
          )}
          {/* like, Dislike and Comment */}
          {!isUserPost && (
            <div className="flex justify-between mt-3 ">
              <div className="space-x-3">
                <button onClick={handleLikePost} className="group relative">
                  <FontAwesomeIcon
                    className={`${
                      isLiked ? "text-sky-400" : "text-black"
                    } w-6 h-6 transition-transform duration-150 ease-in-out group-hover:scale-110`}
                    icon={faThumbsUp}
                  />
                </button>
                <button
                  onClick={handleDislikePost}
                  className="group relative focus:outline-none"
                >
                  <FontAwesomeIcon
                    className={`${
                      isNotLiked ? "text-sky-400" : "text-black"
                    } w-6 h-6 transition-transform duration-150 ease-in-out group-hover:scale-110`}
                    icon={faThumbsDown}
                  />
                </button>
              </div>
              <button onClick={toggleComment}>
                <FontAwesomeIcon
                  icon={faComment}
                  className="w-6 h-6 transition-transform duration-150 ease-in-out group-hover:scale-110"
                />
              </button>
            </div>
          )}
        </div>
        {/* Image Container */}
      </div>
      {/* Comment Section */}
      {showComments && (
        <div className="bg-gray-100 rounded-xl shadow-xl max-w-sm w-full py-3 px-4">
          <Form onSubmit={(e) => e.preventDefault()}>
            <FormGroup>
              <Input
                id="comment"
                name="comment"
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Write a comment...."
                className="border-gray-300 shadow-md"
              />
            </FormGroup>
            <button
              onClick={commentsHandler}
              className="bg-sky-300 rounded-xl shadow-lg py-2 px-4 font-semibold text-white transition-transform hover:scale-110 hover:bg-sky-400"
            >
              Comment
            </button>
          </Form>

          {/* Comment List */}
          <div className="max-h-48 overflow-y-auto mt-3">
            {" "}
            {/* Fixed height and scrollable content */}
            {getAllComments.length > 0 &&
              getAllComments.map((comment) => (
                <div key={comment.id} className="border-b py-3  space-x-3">
                  {/* User's Image and Name */}
                  <div className="flex items-center space-x-2">
                    {userImage[comment.userId] ? (
                      <img
                        src={userImage[comment.userId]}
                        className="w-8 h-8 rounded-full"
                        alt="User Avatar"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300"></div> // Placeholder if no image
                    )}
                    <span className="font-semibold text-sm text-gray-800">
                      {username[comment.userId]}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <div className="text-sm mx-5 text-gray-700 mt-1">
                    {comment.comments}
                  </div>

                  {/* Optionally, you can add the comment date here */}
                  {/* <span className="text-xs text-gray-500 mt-1 ml-2">{new Date(comment.createdAt).toLocaleString()}</span> */}
                </div>
              ))}
          </div>
        </div>
      )}

      {showModel && (
        <div className="">
          <UpdatePost post={post} model={() => setShowModel(false)} />
        </div>
      )}
    </div>
  );
};
export default Post;
