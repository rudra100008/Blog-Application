"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import base_url from "../api/base_url";
import Post from "./Post";
import { useRouter } from "next/navigation";
import { Form, FormGroup, Input } from "reactstrap";
import { useCategory } from "../hooks/useCategory";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faSortAmountDown, faSortAmountUp, faSpinner } from "@fortawesome/free-solid-svg-icons";

const getToken = () => {
  return localStorage.getItem("token");
};

const AllPost = () => {
  const router = useRouter();
  const { categories } = useCategory();
  const [posts, setPosts] = useState([]);
  const [categoryId, setCategoryId] = useState(0);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [sortBy, setSortBy] = useState("postDate");
  const [sortDir, setSortDir] = useState("ascending");

  const fetchPosts = async () => {
    if (loading || !hasMorePosts) return;
    setLoading(true);

    try {
      const token = getToken();

      const url =
        categoryId === 0
          ? `${base_url}/posts`
          : `${base_url}/posts/category/${categoryId}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pageNumber,
          pageSize: 3,
          sortBy,
          sortDir,
        },
      });

      console.log("Response of fetchPosts(): ",response.data)
      const { data, lastPage } = response.data;

      setPosts((prev)=>{
        const existingIds  = new Set(prev.map(post => post.postId));
        console.log("ExistingIds: ",existingIds)
        const newPosts = data.filter(post => !existingIds.has(post.postId));
        console.log("New Posts: ",newPosts);
        return [...prev,...newPosts];
      });
      setHasMorePosts(!lastPage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //   const fetchPostsByCategory = async () => {
  //     try {
  //       const token = getToken();
  //       console.log("CategoryId: ", categoryId);
  //       const response = await axios.get(
  //         `${base_url}/posts/category/${categoryId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //           params: {
  //             pageNumber,
  //             pageSize: 3,
  //             sortDir: "ascending",
  //             sortBy: "postId",
  //           },
  //         }
  //       );
  //       console.log("Data of fetchPostsByCategory():", response.data);
  //       const { data } = response.data;
  //       // setPosts((prevPost) => {
  //       //     const existingIds = new Set(prevPost.map((post) => post.postId));
  //       //     const newPosts = data.filter((post) => !existingIds.has(post.postId));
  //       //     return [...prevPost, ...newPosts];
  //       // });
  //       setPosts(data);

  //       if (data.length === 0) {
  //         setHasMorePosts(false);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching category posts:", error.response);
  //     }
  //   };

  const sortHandler = (criteria, direction) => {
    setSortBy(criteria);
    setSortDir(direction);
    setPosts([]); // Clear posts to refetch with new sort
    setPageNumber(0); // Reset page number
    setHasMorePosts(true); // Allow fetching with new sort
  };

  // useEffect(()=>{
  //     setAllCategories();
  // },[])
  useEffect(() => {
    if (hasMorePosts && !loading) {
      fetchPosts();
    }
  }, [pageNumber, hasMorePosts, sortBy, sortDir,categoryId]);

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

  //   useEffect(() => {
  //     // Reset posts and pagination when categoryId changes
  //     setPageNumber(0); // Reset to first page
  //     setPosts([]); // Clear current posts
  //     setHasMorePosts(true); // Allow further fetching

  //     if (categoryId !== 0) {
  //       // If categoryId is not 0, fetch category-specific posts
  //       fetchPostsByCategory();
  //     } else {
  //       // If categoryId is 0, fetch all posts
  //       fetchPosts();
  //     }
  //   }, [categoryId]);

  useEffect(() => {
    setPosts([]);
    setPageNumber(0);
    setHasMorePosts(true);
  }, [categoryId]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 50 &&
        hasMorePosts &&
        !loading
      ) {
        setPageNumber((prevPageNumber) => prevPageNumber + 1);
      }
    };

    const debounceHandler = debounce(handleScroll, 50);
    window.addEventListener("scroll", debounceHandler);
    return () => {
      window.removeEventListener("scroll", debounceHandler);
    };
  }, [hasMorePosts, loading]);

  console.log("Posts: ",posts)

return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          
          {/* Sort Button */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-gray-600">
              <FontAwesomeIcon icon={faSortAmountDown} className="w-4 h-4" />
              <span className="font-medium text-sm">Sort:</span>
            </div>
            <button
              onClick={() => sortHandler("postDate", sortDir === "ascending" ? "descending" : "ascending")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                sortDir === "descending"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FontAwesomeIcon 
                icon={sortDir === "descending" ? faSortAmountDown : faSortAmountUp} 
                className="w-4 h-4" 
              />
              <span>{sortDir === "descending" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-gray-600">
              <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
              <span className="font-medium text-sm">Filter:</span>
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="0">All Categories</option>
              {categories && categories.length > 0 && categories.map((category, index) => (
                <option key={index} value={category.categoryId}>
                  {category.categoryTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Display */}
        {categoryId !== 0 && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Showing posts in:</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold">
              {categories.find(cat => cat.categoryId === categoryId)?.categoryTitle}
            </span>
            <button
              onClick={() => setCategoryId(0)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div key={post.postId || index}>
              <Post post={post} isUserPost={false} onDelete={null} />
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No posts found</h3>
          <p className="text-gray-600">Be the first to share something amazing!</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && hasMorePosts && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center space-x-3 text-indigo-600">
            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin" />
            <span className="font-semibold">Loading more posts...</span>
          </div>
        </div>
      )}

      {/* End of Posts Message */}
      {!hasMorePosts && !loading && posts.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-2xl p-6 mt-8 text-center">
          <p className="text-indigo-800 font-semibold text-lg">
            🎉 You have reached the end! You are all caught up.
          </p>
        </div>
      )}
    </div>
  );
};

export default AllPost;
