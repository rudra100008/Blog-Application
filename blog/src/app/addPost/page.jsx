"use client";
import { Fragment, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useCategory } from "../hooks/useCategory";
import api from "../api/api";
import { useAuth } from "../contexts/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faChevronLeft, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function AddPost() {
  const { categories } = useCategory();
  const router = useRouter();
  const { userId, isHydrated } = useAuth();
  const [postData, setPostData] = useState({
    postTitle: "",
    content: "",
    image: null,
    categoryId: "",
  });
  const [validationError, setValidationError] = useState({
    postTitle: "",
    content: "",
    image: "",
    categoryId: "",
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isHydrated && !userId) {
      toast.error("Please login to create a post");
      router.push("/login");
    }
  }, [userId, isHydrated, router]);

  const handleChange = (e) => {
    setPostData({ ...postData, [e.target.name]: e.target.value });
    setValidationError({ ...validationError, [e.target.name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPostData({ ...postData, image: file });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setPostData({ ...postData, image: file });
    }
  };

  const postDataToServer = async () => {
    if (!userId) { toast.error("Please login to create a post"); return; }
    const formData = new FormData();
    formData.append("postDTO", new Blob([JSON.stringify({ postTitle: postData.postTitle, content: postData.content })], { type: "application/json" }));
    formData.append("image", postData.image);
    formData.append("userId", userId);
    formData.append("categoryId", postData.categoryId);

    await api.post(`/posts`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(() => {
        setPostData({ postTitle: "", content: "", image: null, categoryId: "" });
        setValidationError({ postTitle: "", content: "", image: "", categoryId: "" });
        toast.success("Post published!");
        router.push("/home");
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          const { message } = error.response.data;
          if (typeof message === "object") {
            setValidationError({ postTitle: message.postTitle, content: message.content, image: message.image });
          }
        } else {
          toast.error("Unexpected error occurred");
        }
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postData.categoryId) {
      setValidationError({ ...validationError, categoryId: "Please select a category" });
      return;
    }
    await postDataToServer();
  };

  if (!isHydrated || !userId) return null;

  const charCount = postData.content.length;
  const titleCount = postData.postTitle.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .addpost-page {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
        }
        .addpost-topbar {
          background: #fff;
          border-bottom: 1px solid #e8e3db;
          padding: 0 2rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1a1a1a;
          text-decoration: none;
        }
        .topbar-brand-icon {
          width: 32px; height: 32px;
          background: #1a1a1a;
          border-radius: 3px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          font-weight: 700;
          color: #c9a96e;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1rem;
          background: none;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          color: #4a4540;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .back-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .publish-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1.4rem;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .publish-btn:hover { background: #c9a96e; }

        .addpost-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* Main editor */
        .editor-panel {
          background: #fff;
          border: 1px solid #e8e3db;
          border-radius: 4px;
          overflow: hidden;
        }
        .editor-inner {
          padding: 2.5rem 3rem;
        }
        .editor-section-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c9a96e;
          margin-bottom: 0.6rem;
        }
        .title-input {
          width: 100%;
          border: none;
          outline: none;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.2;
          resize: none;
          background: transparent;
          padding: 0;
          margin-bottom: 0.25rem;
        }
        .title-input::placeholder { color: #d4cfc9; }
        .title-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
          padding-bottom: 1.75rem;
          border-bottom: 1px solid #f0ece6;
        }
        .field-error-inline {
          font-size: 0.78rem;
          color: #c0392b;
        }
        .char-count {
          font-size: 0.75rem;
          color: #c5bdb6;
          font-weight: 300;
        }
        .content-textarea {
          width: 100%;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          color: #2a2520;
          line-height: 1.85;
          font-weight: 300;
          resize: none;
          background: transparent;
          padding: 0;
          min-height: 380px;
        }
        .content-textarea::placeholder { color: #d4cfc9; }
        .content-meta {
          padding-top: 1rem;
          border-top: 1px solid #f0ece6;
          margin-top: 1rem;
          display: flex;
          justify-content: flex-end;
        }

        /* Sidebar */
        .sidebar-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .sidebar-card {
          background: #fff;
          border: 1px solid #e8e3db;
          border-radius: 4px;
          overflow: hidden;
        }
        .sidebar-card-header {
          padding: 0.9rem 1.25rem;
          border-bottom: 1px solid #f0ece6;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9e9589;
        }
        .sidebar-card-body {
          padding: 1.25rem;
        }
        .image-dropzone {
          border: 2px dashed #e0dbd3;
          border-radius: 3px;
          padding: 1.75rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
        }
        .image-dropzone.dragging {
          border-color: #c9a96e;
          background: rgba(201,169,110,0.04);
        }
        .image-dropzone:hover { border-color: #c9a96e; }
        .dropzone-icon {
          width: 36px; height: 36px;
          margin: 0 auto 0.75rem;
          color: #c9a96e;
        }
        .dropzone-label {
          font-size: 0.85rem;
          color: #4a4540;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .dropzone-sub {
          font-size: 0.75rem;
          color: #9e9589;
          font-weight: 300;
        }
        .image-file-input {
          display: none;
        }
        .image-preview-wrap {
          position: relative;
        }
        .image-preview {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 3px;
          display: block;
        }
        .image-remove-btn {
          position: absolute;
          top: 0.5rem; right: 0.5rem;
          width: 26px; height: 26px;
          background: rgba(0,0,0,0.6);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s;
        }
        .image-remove-btn:hover { background: rgba(192,57,43,0.8); }
        .category-select-field {
          width: 100%;
          padding: 0.7rem 2rem 0.7rem 0.9rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          appearance: none;
          cursor: pointer;
          font-weight: 300;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%239e9589' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.9rem center;
          transition: border-color 0.2s;
        }
        .category-select-field:focus { border-color: #c9a96e; }
        .sidebar-error { font-size: 0.78rem; color: #c0392b; margin-top: 5px; }

        .writing-tips {
          font-size: 0.8rem;
          color: #9e9589;
          font-weight: 300;
          line-height: 1.7;
        }
        .writing-tips li {
          list-style: none;
          padding-left: 1rem;
          position: relative;
          margin-bottom: 0.4rem;
        }
        .writing-tips li::before {
          content: '—';
          position: absolute;
          left: 0;
          color: #c9a96e;
        }

        @media (max-width: 800px) {
          .addpost-layout {
            grid-template-columns: 1fr;
          }
          .editor-inner { padding: 1.5rem; }
          .title-input { font-size: 1.8rem; }
        }
      `}</style>

      <div className="addpost-page">
        {/* Top Bar */}
        <div className="addpost-topbar">
          <a href="/home" className="topbar-brand">
            <div className="topbar-brand-icon">B</div>
            BlogApp
          </a>
          <div className="topbar-actions">
            <button className="back-btn" onClick={() => router.back()}>
              <FontAwesomeIcon icon={faChevronLeft} style={{ width: 10 }} />
              Back
            </button>
            <button className="publish-btn" onClick={handleSubmit}>
              Publish
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="addpost-layout">
          {/* Main Editor */}
          <div className="editor-panel">
            <div className="editor-inner">
              <p className="editor-section-label">Post Title</p>
              <textarea
                className="title-input"
                name="postTitle"
                value={postData.postTitle}
                onChange={handleChange}
                placeholder="Write a compelling title..."
                rows={2}
              />
              <div className="title-meta">
                <span className="field-error-inline">{validationError.postTitle}</span>
                <span className="char-count">{titleCount} chars</span>
              </div>

              <p className="editor-section-label">Content</p>
              <textarea
                className="content-textarea"
                name="content"
                value={postData.content}
                onChange={handleChange}
                placeholder="Share your story, ideas, insights..."
              />
              {validationError.content && (
                <p className="field-error-inline">{validationError.content}</p>
              )}
              <div className="content-meta">
                <span className="char-count">{charCount} characters</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar-panel">
            {/* Cover image */}
            <div className="sidebar-card">
              <div className="sidebar-card-header">Cover Image</div>
              <div className="sidebar-card-body">
                {postData.image ? (
                  <div className="image-preview-wrap">
                    <img
                      src={URL.createObjectURL(postData.image)}
                      alt="Preview"
                      className="image-preview"
                    />
                    <button
                      className="image-remove-btn"
                      onClick={() => setPostData({ ...postData, image: null })}
                    >
                      <FontAwesomeIcon icon={faTimes} style={{ width: 10 }} />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`image-dropzone ${isDragging ? "dragging" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      className="image-file-input"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <FontAwesomeIcon icon={faImage} className="dropzone-icon" />
                    <p className="dropzone-label">Drop image or click to upload</p>
                    <p className="dropzone-sub">PNG, JPG, WEBP supported</p>
                  </label>
                )}
                {validationError.image && <p className="sidebar-error">{validationError.image}</p>}
              </div>
            </div>

            {/* Category */}
            <div className="sidebar-card">
              <div className="sidebar-card-header">Category</div>
              <div className="sidebar-card-body">
                <select
                  className="category-select-field"
                  name="categoryId"
                  value={postData.categoryId}
                  onChange={handleChange}
                >
                  <option value="" disabled>Choose a category</option>
                  {categories?.map((cat, i) => (
                    <option key={i} value={cat.categoryId}>{cat.categoryTitle}</option>
                  ))}
                </select>
                {validationError.categoryId && (
                  <p className="sidebar-error">{validationError.categoryId}</p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="sidebar-card">
              <div className="sidebar-card-header">Writing Tips</div>
              <div className="sidebar-card-body">
                <ul className="writing-tips">
                  <li>Hook readers with a strong opening line</li>
                  <li>Keep paragraphs short and scannable</li>
                  <li>Use a cover image to increase engagement</li>
                  <li>Choose the right category to reach your audience</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}