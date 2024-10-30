"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import base_url from "../api/base_url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumpster, faEdit, faEllipsis, faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import UpdatePost from "./UpdatePost";


const Post = ({ post, isUserPost, onDelete }) => {
    const [image, setImage] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isNotLiked, setIsNotLiked] = useState(false);
    const [user, setUser] = useState();
    const [clicked, setClicked] = useState(true);
    const getToken = () => {
        return localStorage.getItem("token");
    };
    const getUserId = () => {
        return localStorage.getItem("userId");
    }

    const handleDelete = () => {
        axios.delete(`${base_url}/posts/${post.postId}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
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
        await axios.get(`${base_url}/posts/image/${post.image}`, {
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
    const showProfile = () => {

    }
    const handleLikePost = async () => {
        const token = getToken();
        const userId = getUserId();
        const postId = post.postId;
    
        try {
            // Only call the API if `isLiked` state has changed
            const response = await axios.post(`${base_url}/likePost`, null, {
                headers: { Authorization: `Bearer ${token}` },
                params: { userId, postId }
            });
            console.log("Liked post:", response.data);
            setIsLiked(true); // Set like status to true
            toast.success("Post liked successfully");
        } catch (error) {
            console.error("Error liking post:", error);
            toast.error("Could not like the post.");
        }
    };
    
    const handleDislikePost = () => {

    }
    const fetchUserDetails = async () => {
        const token = getToken();
        await axios.get(`${base_url}/users/${post.userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            setUser(response.data)
        }).catch((err) => {
            console.log(err.response.data)
        })
    }
    useEffect(() => {
        if (post?.image) {
            fetchImage();
        }
        if (post?.userId) {
            fetchUserDetails();
        }
    }, [post?.image, post?.userId]);

    return (
        <div className="flex justify-center">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <div className="max-w-sm w-full h-auto rounded-md overflow-hidden shadow-lg bg-white m-4 cursor-pointer transition-transform hover:scale-105 hover:shadow-xl">

                <div className="px-6 py-4 h-auto flex flex-col justify-between">
                    {/* Post Date */}
                    <div className="flex justify-between ">
                        <p className="text-gray-500 text-xs mb-2">
                            {new Date(post?.postDate).toLocaleString("en-US", {
                                weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                        <div className="relative">
                            {isUserPost && (
                                <div>
                                    <FontAwesomeIcon icon={faEllipsis}
                                        onClick={() => setIsOpen((prevState) => !prevState)} />
                                    {isOpen && (
                                        <div className="absolute right-0 top-6 mt-1 w-32 text-sm z-auto bg-white rounded-lg shadow-lg">
                                            <p
                                                className="cursor-pointer py-2 px-4 rounded-lg  hover:bg-gray-300 hover:text-red-400"
                                                onClick={handleDelete}
                                            >
                                                <FontAwesomeIcon icon={faDumpster} /> <span>Delete</span>
                                            </p>
                                            <p
                                                className="cursor-pointer py-2 px-4 rounded-lg  hover:bg-gray-300 p-2 hover:text-green-400"
                                                onClick={() => setShowModel(true)}>
                                                <FontAwesomeIcon icon={faEdit} /> <span>Edit Post</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {user && (
                        <p className="text-gray-700 text-sm mb-2 ">
                            <span onClick={showProfile()} className="font-medium text-lg no-underline hover:underline decoration-cyan-300 hover:text-cyan-300 hover:underline-offset-4">
                                {user.username.toUpperCase()}
                            </span>
                        </p>
                    )}
                    {/* Post Title */}
                    <h2 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">
                        {post?.postTitle}
                    </h2>

                    {/* Post Content (Truncated) */}
                    <p className={`text-gray-700 text-base mb-4 overflow-hidden ${clicked ? 'line-clamp-3' : ''}`}>
                        {post?.content.length > 99 && clicked
                            ? (<>
                                {`${post?.content.substring(0, 100)}.....`}
                                <button onClick={() => setClicked(false)} className="text-blue-300 text-xs hover:underline">
                                    Read More
                                </button>
                            </>
                            ) : (
                                <>
                                    {post?.content}
                                    {post?.content.length > 99 &&
                                        <button onClick={() => setClicked(true)} className="text-blue-300 text-xs hover:underline">
                                            Read Less
                                        </button>}
                                </>
                            )}
                    </p>

                    {/* Read More Button */}
                    <div className="mt-auto">

                    </div>
                    {image && (
                        <div className="mt-4  bg-gray-100 relative ">
                            <img
                                className=" w-full h-full object-contain transition-opacity hover:opacity-90"
                                src={image}
                                alt={post?.postTitle}
                            />
                        </div>
                    )}
                    {
                        !isUserPost && (
                            <div className="flex justify-between mt-3 ">
                                <div className="space-x-3">
                                    <button onClick={() => {
                                        setIsLiked(prev => !prev);
                                        handleLikePost();
                                    }}
                                        className="group relative">
                                        <FontAwesomeIcon className={`${isLiked ? "text-sky-400" : "text-black"} w-6 h-6 transition-transform duration-150 ease-in-out group-hover:scale-110`}
                                            icon={faThumbsUp} />
                                    </button>
                                    <button onClick={() => setIsNotLiked((prevState) => !prevState)} className="group relative focus:outline-none">
                                        <FontAwesomeIcon className={`${isNotLiked ? "text-sky-400" : "text-black"} w-6 h-6 transition-transform duration-150 ease-in-out group-hover:scale-110`}
                                            icon={faThumbsDown} />
                                    </button>
                                </div>
                                <button>Comment</button>
                            </div>
                        )
                    }
                </div>
                {/* Image Container */}

            </div>
            {
                showModel &&
                (
                    <div className="">
                        <UpdatePost post={post} model={() => setShowModel(false)} />
                    </div>
                )
            }
        </div>
    );
};
export default Post;
