"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import base_url from "../api/base_url";
import Post from "./Post";
import { useRouter } from "next/navigation";
import { Form, FormGroup, Input } from "reactstrap";
import { useCategory } from "../hooks/useCategory";

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
    <div className="container mx-auto p-6">
      <div className="flex justify-center space-x-6">
        <div>
          {sortDir === "ascending" && sortBy === "postDate" ? (
            <button
              onClick={() => sortHandler("postDate", "descending")}
              className="px-3 py-1 bg-blue-400 text-white text-lg rounded-xl hover:bg-blue-600 transition"
            >
              Sort by Newest
            </button>
          ) : (
            <button
              onClick={() => sortHandler("postDate", "ascending")}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
            >
              Sort by Oldest
            </button>
          )}
        </div>
        <div>
          <Form>
            <FormGroup>
              <Input
                type="select"
                id="category"
                name="category"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="rounded-2xl text-lg"
              >
                <option value="0">All</option>
                {categories &&
                  categories.length > 0 &&
                  categories.map((category, index) => (
                    <option key={index} value={category.categoryId}>
                      {category.categoryTitle}
                    </option>
                  ))}
              </Input>
            </FormGroup>
          </Form>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div key={post.id || index}>
              <Post post={post} isUserPost={false} onDelete={null} />
            </div>
          ))}
        </div>
      ) : (
        <p></p>
      )}

      {loading && hasMorePosts && (
        <p className="text-center text-xl font-semibold text-gray-500">
          Loading more posts...
        </p>
      )}

      {!hasMorePosts && !loading && (
        <p className="bg-gray-200 p-4 mt-5 text-gray-800 text-center text-xl font-bold rounded-2xl">
          No more posts available.
        </p>
      )}
    </div>
  );
};

export default AllPost;
