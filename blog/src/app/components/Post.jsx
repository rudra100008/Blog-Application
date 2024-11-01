"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import base_url from "../api/base_url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumpster, faEdit, faEllipsis, faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import UpdatePost from "./UpdatePost";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import { Button, Form, FormGroup, Input } from "reactstrap";


const Post = ({ post, isUserPost, onDelete }) => {
    const [image, setImage] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isNotLiked, setIsNotLiked] = useState(false);
    const [user, setUser] = useState();
    const [clicked, setClicked] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState('');
    const [getAllComments, setGetAllComments] = useState([])
    const getToken = () => {
        return localStorage.getItem("token");
    };
    const getUserId = () => {
        return localStorage.getItem("userId");
    };
    const saveLike = (liked, disliked) => {
        localStorage.setItem(`post-${post.postId}-like`, JSON.stringify({ liked, disliked }))
    }
    const loadLikeSaved = () => {
        const savedLike = JSON.parse(localStorage.getItem(`post-${post.postId}-like`))
        if (savedLike) {
            setIsLiked(savedLike.liked);
            setIsNotLiked(savedLike.disliked);
        }
    }
    const toggleComment = () => {
        setShowComments(!showComments);
    }
    const commentsHandler = async () => {
        const userId = getUserId();
        const token = getToken();
        const postId = post.postId;
        try {
            const response = await axios.post(`${base_url}/comments/user/${userId}/post/${postId}`, {
                comments: comments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            console.log(response.data);
            console.log("comment success")
            setComments('');
        } catch (error) {
            console.log(error.response.data)
            console.log("comment Failed")
        }
    }
    const getAllCommentsFromServer = async () => {
        const token = getToken();
        const postId = post.postId;
        try {
            const response = await axios.get(`${base_url}/comments/post/${postId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { pagNumber: 0, pageSize: 3 }
            })
            const { data } = response.data;
            const commentList = data.map(({ comments, id }) => ({ comments, id }));
            setGetAllComments(commentList);
        } catch (error) {
            console.log(error)
        }
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

    };
    const handleLikePost = async () => {
        const token = getToken();
        const userId = getUserId();
        const postId = post.postId;

        try {
            const response = await axios.post(`${base_url}/likePost`, null, {
                headers: { Authorization: `Bearer ${token}` },
                params: { userId, postId }
            });

            if (response.data) {
                // A like was added
                setIsLiked(true);
                setIsNotLiked(false); // Ensure dislike is removed if liking
                saveLike(true, false);
                toast.success("Post liked successfully");
                console.log("Post liked", response.data);
            } else {
                // Like was removed
                setIsLiked(false);
                saveLike(false, isNotLiked);
                toast.info("Like removed");
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
                params: { userId, postId }
            })
            if (response.data) {
                setIsLiked(false)
                setIsNotLiked(true);
                saveLike(false, true);
                console.log("Post Disliked", response.data);
            } else {
                setIsNotLiked(false);
                saveLike(isLiked, false)
                toast.info("DisLike removed");
            }

        } catch (error) {
            console.error("Error disliking Post: ", error.response.data);
        }
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
        getAllCommentsFromServer();
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
                    {/* like, Dislike and Comment */}
                    {
                        !isUserPost && (
                            <div className="flex justify-between mt-3 ">
                                <div className="space-x-3">
                                    <button onClick={handleLikePost}
                                        className="group relative">
                                        <FontAwesomeIcon className={`${isLiked ? "text-sky-400" : "text-black"} w-6 h-6 transition-transform duration-150 ease-in-out group-hover:scale-110`}
                                            icon={faThumbsUp} />
                                    </button>
                                    <button onClick={handleDislikePost} className="group relative focus:outline-none">
                                        <FontAwesomeIcon className={`${isNotLiked ? "text-sky-400" : "text-black"} w-6 h-6 transition-transform duration-150 ease-in-out group-hover:scale-110`}
                                            icon={faThumbsDown} />
                                    </button>
                                </div>
                                <button onClick={toggleComment}>
                                    <FontAwesomeIcon icon={faComment} className="w-6 h-6 transition-transform duration-150 ease-in-out group-hover:scale-110" />
                                </button>
                            </div>
                        )
                    }
                </div>
                {/* Image Container */}

            </div>
            {/*Comment section */}
            {
                showComments &&
                <>
                    <div className="bg-gray-100 rounded-2xl shadow-xl max-w-sm w-full py-3 px-4 ">
                        <Form onSubmit={(e) => e.preventDefault()}>
                            <FormGroup>
                                <Input
                                    id="comment"
                                    name="comment"
                                    type="text"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Write a comment...."
                                />
                            </FormGroup>
                            <button onClick={commentsHandler} className=" bg-sky-300 rounded-2xl shadow-lg py-2 px-4 font-semibold transition-transform hover:scale-110 hover:text-white" >
                                Comment
                            </button>
                        </Form>
                        {getAllComments.length > 0 &&
                            getAllComments.map((comment) => (
                                <div key={comment.id} className="border-b py-3">
                                    {/* <img src={image} className="w-4 h-4 rounded-full" alt="" /> */}
                                    <p className="text-gray-700 text-sm">{comment.comments}</p>
                                </div>
                            ))
                        }
                    </div>
                </>
            }
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
