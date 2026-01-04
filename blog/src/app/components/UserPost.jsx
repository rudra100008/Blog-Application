import axios from "axios";
import { useEffect, useState } from "react";
import base_url from "../api/base_url";
import Post from "./Post";
import Link from "next/link";

export default function UserPost() {
  const [userPost, setUserPost] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [lastPage, setLastPage] = useState(false);

  const getUserId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userId");
    }
    return null;
  };

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const handleDeletePost = (postId) => {
    setUserPost((prevPosts) => {
      prevPosts.filter((post) => post.postId !== postId); // Correctly return the filtered array
    });
  };

  const getUserPostFromServer = async () => {
    await axios
      .get(`${base_url}/posts/user/${getUserId()}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        params: {
          pageNumber: pageNumber,
          pageSize: 3,
        },
      })
      .then((response) => {
        console.log(response.data);
        const { data, lastPage, pageNumber: currentPage } = response.data;
        setUserPost((prevPosts) => {
          const existingPost = new Set(prevPosts.map((post) => post.postId));
          const newPosts = data.filter(
            (post) => !existingPost.has(post.postId)
          );
          return [...prevPosts, ...newPosts];
        }); // Append new posts to the list
        setLastPage(lastPage);
      })
      .catch((error) => {
        console.log(error || "Something went wrong");
      });
  };

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  }

  useEffect(() => {
    getUserPostFromServer();
  }, [pageNumber]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >
          document.documentElement.offsetHeight - 50 &&
        !lastPage // Only increment if it's not the last page
      ) {
        setPageNumber((prevPage) => prevPage + 1);
      }
    };
    const debounceHandler = debounce(handleScroll, 1000); // Correctly debounce the function
    window.addEventListener("scroll", debounceHandler);
    return () => {
      window.removeEventListener("scroll", debounceHandler);
    };
  }, [lastPage]);

  return (
    <div className="max-w-4xl w-full mx-auto my-3">
      {Array.isArray(userPost) && userPost.length > 0 ? (
        <div className="flex flex-wrap -mx-2 ">
          {userPost.map((post, key) => (
            <div className="w-full sm:w-1/2 px-2 mb-4" key={post.postId}>
              <Post post={post} isUserPost={true} onDelete={handleDeletePost} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <p>You have not posted anything</p>
          <Link
            href="/addPost"
            className="no-underline p-2 bg-gray-100 text-center text-xl font-semibold text-gray-400 rounded-lg shadow-lg"
          >
            Do you want to post?
          </Link>
        </>
      )}
    </div>
  );
}
