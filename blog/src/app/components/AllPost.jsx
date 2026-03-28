"use client";
import { useEffect, useState, useCallback } from "react";
import Post from "./Post";
import { useCategory } from "../hooks/useCategory";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSortAmountDown,
  faSortAmountUp,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import api from "../api/api";

const AllPost = () => {
  const { categories } = useCategory();
  const [posts, setPosts] = useState([]);
  const [categoryId, setCategoryId] = useState(0);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [sortBy, setSortBy] = useState("postDate");
  const [sortDir, setSortDir] = useState("descending");

  const fetchPosts = useCallback(async (page, category, sort, dir) => {
    if (typeof window === "undefined") return;
    setLoading(true);
    try {
      const url = category === 0 ? `/posts` : `/posts/category/${category}`;
      const response = await api.get(url, {
        params: { pageNumber: page, pageSize: 5, sortBy: sort, sortDir: dir },
      });
      const { data, lastPage } = response.data;
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.postId));
        const newPosts = data.filter((p) => !existingIds.has(p.postId));
        return [...prev, ...newPosts];
      });
      setHasMorePosts(!lastPage);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPosts([]);
    setPageNumber(0);
    setHasMorePosts(true);
    fetchPosts(0, categoryId, sortBy, sortDir);
  }, [categoryId, sortBy, sortDir]);

  useEffect(() => {
    if (pageNumber === 0) return;
    if (!hasMorePosts || loading) return;
    fetchPosts(pageNumber, categoryId, sortBy, sortDir);
  }, [pageNumber]);

  useEffect(() => {
    let timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const nearBottom =
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 200;
        if (nearBottom && hasMorePosts && !loading) {
          setPageNumber((prev) => prev + 1);
        }
      }, 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => { window.removeEventListener("scroll", handleScroll); clearTimeout(timeout); };
  }, [hasMorePosts, loading]);

  const toggleSort = () => {
    setSortDir((prev) => (prev === "ascending" ? "descending" : "ascending"));
  };

  const handleCategoryChange = (e) => {
    setCategoryId(Number(e.target.value));
  };

  const activeCategoryName = categories?.find((c) => c.categoryId === categoryId)?.categoryTitle;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .allpost-wrap {
          max-width: 780px;
          margin: 0 auto;
          padding: 0 1.25rem 4rem;
          font-family: 'DM Sans', sans-serif;
        }
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.1rem 1.5rem;
          background: #fff;
          border: 1px solid #e8e3db;
          border-radius: 4px;
          margin-bottom: 2.5rem;
        }
        .filter-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9e9589;
          margin-right: 0.6rem;
        }
        .sort-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 1rem;
          border-radius: 3px;
          border: 1px solid #e8e3db;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.03em;
        }
        .sort-btn.active {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }
        .sort-btn.inactive {
          background: #fff;
          color: #4a4540;
        }
        .sort-btn.inactive:hover {
          border-color: #1a1a1a;
          color: #1a1a1a;
        }
        .category-select {
          padding: 0.45rem 2rem 0.45rem 0.9rem;
          border: 1px solid #e8e3db;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%239e9589' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.8rem center;
          transition: border-color 0.2s;
        }
        .category-select:focus { border-color: #c9a96e; }
        .active-filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          font-weight: 500;
          color: #1a1a1a;
          background: #f5f1eb;
          border: 1px solid #e0dbd3;
          padding: 0.3rem 0.8rem;
          border-radius: 2px;
          margin-top: 0.75rem;
        }
        .clear-filter-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #9e9589;
          font-size: 1rem;
          line-height: 1;
          padding: 0 2px;
          transition: color 0.2s;
        }
        .clear-filter-btn:hover { color: #1a1a1a; }
        .section-heading {
          font-family: 'Playfair Display', serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: #9e9589;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          padding-bottom: 0.6rem;
          border-bottom: 1px solid #e8e3db;
        }
        .loading-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.6rem;
          padding: 2.5rem 0;
          color: #9e9589;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .end-of-feed {
          text-align: center;
          padding: 2.5rem 0;
          border-top: 1px solid #e8e3db;
          margin-top: 1rem;
        }
        .end-of-feed-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c9a96e;
        }
        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          border: 1px dashed #e0dbd3;
          border-radius: 4px;
          background: #fdf9f5;
        }
        .empty-state-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }
        .empty-state-sub {
          font-size: 0.88rem;
          color: #9e9589;
          font-weight: 300;
        }
        .filter-left, .filter-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>

      <div className="allpost-wrap">
        {/* Filter Bar */}
        <div>
          <div className="filter-bar">
            <div className="filter-left">
              <span className="filter-label">Sort</span>
              <button
                className={`sort-btn ${sortDir === "descending" ? "active" : "inactive"}`}
                onClick={toggleSort}
              >
                <FontAwesomeIcon
                  icon={sortDir === "descending" ? faSortAmountDown : faSortAmountUp}
                  style={{ width: 12 }}
                />
                {sortDir === "descending" ? "Newest First" : "Oldest First"}
              </button>
            </div>
            <div className="filter-right">
              <span className="filter-label">
                <FontAwesomeIcon icon={faFilter} style={{ width: 11, marginRight: 4 }} />
                Category
              </span>
              <select className="category-select" value={categoryId} onChange={handleCategoryChange}>
                <option value="0">All</option>
                {categories?.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryTitle}</option>
                ))}
              </select>
            </div>
          </div>

          {categoryId !== 0 && activeCategoryName && (
            <div style={{ marginBottom: "1.25rem" }}>
              <span className="active-filter-tag">
                Showing: {activeCategoryName}
                <button className="clear-filter-btn" onClick={() => setCategoryId(0)}>×</button>
              </span>
            </div>
          )}
        </div>

        {/* Section label */}
        {posts.length > 0 && (
          <p className="section-heading">Latest Stories</p>
        )}

        {/* Posts */}
        {posts.length > 0 ? (
          <div>
            {posts.map((post) => (
              <Post key={post.postId} post={post} isUserPost={false} onDelete={null} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="empty-state">
              <h3 className="empty-state-title">No stories yet</h3>
              <p className="empty-state-sub">Be the first to share something with the community.</p>
            </div>
          )
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-indicator">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin" style={{ width: 16 }} />
            Loading stories...
          </div>
        )}

        {/* End of feed */}
        {!hasMorePosts && !loading && posts.length > 0 && (
          <div className="end-of-feed">
            <span className="end-of-feed-label">— You're all caught up —</span>
          </div>
        )}
      </div>
    </>
  );
};

export default AllPost;