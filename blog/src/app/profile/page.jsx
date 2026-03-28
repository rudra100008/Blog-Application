"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import UserPost from "../components/UserPost";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCamera,
  faEdit,
  faMailBulk,
  faPhone,
  faPlus,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import { logout } from "../services/AuthService";
import api from "../api/api";
import UpdateProfilePage from "../updateprofile/page";
import { useAuth } from "../contexts/useAuth";

const Profile = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [active, setActive] = useState("posts");
  const [showModel, setShowModel] = useState(false);
  const [userDetails, setUserDetails] = useState({
    id: null,
    username: "",
    email: "",
    image: "",
    phoneNumber: "",
    description: "",
  });

  const handleGoBack = () => router.back();

  const handleLogout = async () => {
    if (typeof window === "undefined") return;
    try {
      await logout(router);
      toast.success("Logout successful");
    } catch (err) {
      toast.error("Logout unsuccessful");
    }
  };

  const getUserDetails = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/users/${userId}`);
      const { id, username, email, image, phoneNumber, description, imageUrl } = response.data;
      setUserDetails({ id, username, email, image, phoneNumber, description, imageUrl });
    } catch (error) {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") localStorage.removeItem("userId");
        router.push("/");
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userId) getUserDetails();
  }, [userId]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .profile-page {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
        }

        /* Top nav */
        .profile-nav {
          background: #fff;
          border-bottom: 1px solid #e8e3db;
          padding: 0 2rem;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          text-decoration: none;
        }
        .nav-brand-icon {
          width: 30px; height: 30px;
          background: #1a1a1a;
          border-radius: 3px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem;
          font-weight: 700;
          color: #c9a96e;
          font-family: 'Cormorant Garamond', serif;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.9rem;
          border-radius: 3px;
          border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          background: none;
        }
        .nav-btn-back { color: #4a4540; border-color: #e0dbd3; }
        .nav-btn-back:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .nav-btn-logout { color: #c0392b; border-color: #f5cbc8; }
        .nav-btn-logout:hover { background: #fdf0f0; }

        /* Profile hero */
        .profile-hero {
          background: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .profile-hero::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: rgba(201,169,110,0.07);
        }
        .profile-hero::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 250px; height: 250px;
          border-radius: 50%;
          background: rgba(201,169,110,0.05);
        }
        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 3.5rem 2rem 0;
          display: flex;
          align-items: flex-end;
          gap: 2.5rem;
        }
        .hero-avatar-wrap {
          position: relative;
          flex-shrink: 0;
          margin-bottom: -40px;
        }
        .hero-avatar {
          width: 130px; height: 130px;
          border-radius: 50%;
          object-fit: cover;
          border: 5px solid #fff;
          display: block;
          background: #2a2520;
        }
        .hero-avatar-edit {
          position: absolute;
          bottom: 4px; right: 4px;
          width: 30px; height: 30px;
          background: #c9a96e;
          border: 2px solid #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
        }
        .hero-avatar-edit:hover { background: #b8924f; }
        .hero-text { padding-bottom: 1.5rem; }
        .hero-username {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.02em;
          margin-bottom: 0.3rem;
        }
        .hero-description {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.45);
          font-weight: 300;
          max-width: 480px;
        }

        /* Profile body */
        .profile-body {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 2rem 4rem;
        }

        /* Info strip */
        .info-strip {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #e8e3db;
          margin: 3.5rem 0 2rem;
          border: 1px solid #e8e3db;
          border-radius: 4px;
          overflow: hidden;
        }
        .info-tile {
          background: #fff;
          padding: 1.1rem 1.4rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .info-tile-icon {
          width: 34px; height: 34px;
          background: #f5f1eb;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a96e;
          flex-shrink: 0;
        }
        .info-tile-label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9e9589;
          margin-bottom: 2px;
        }
        .info-tile-value {
          font-size: 0.88rem;
          color: #1a1a1a;
          font-weight: 400;
        }

        /* Action buttons */
        .profile-actions {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }
        .profile-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 1.4rem;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .btn-primary {
          background: #1a1a1a;
          color: #fff;
        }
        .btn-primary:hover { background: #c9a96e; }
        .btn-secondary {
          background: #fff;
          color: #4a4540;
          border: 1px solid #e0dbd3;
        }
        .btn-secondary:hover { border-color: #1a1a1a; color: #1a1a1a; }

        /* Tabs */
        .tabs-row {
          display: flex;
          border-bottom: 1px solid #e8e3db;
          margin-bottom: 2rem;
          gap: 0;
        }
        .tab-btn {
          padding: 0.75rem 1.75rem;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          color: #9e9589;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .tab-btn:hover { color: #1a1a1a; }
        .tab-btn.active { color: #1a1a1a; border-bottom-color: #c9a96e; }

        /* Details tab */
        .details-card {
          background: #fff;
          border: 1px solid #e8e3db;
          border-radius: 4px;
          padding: 2rem;
        }
        .details-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0ece6;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 0.8rem 0;
          border-bottom: 1px solid #f7f3ee;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-key {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9e9589;
        }
        .detail-value {
          font-size: 0.9rem;
          color: #1a1a1a;
          font-weight: 300;
          text-align: right;
          max-width: 60%;
        }

        /* Modal */
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

      <div className="profile-page">
        {/* Nav */}
        <div className="profile-nav">
          <a href="/home" className="nav-brand">
            <div className="nav-brand-icon">B</div>
            BlogApp
          </a>
          <div className="nav-actions">
            <button className="nav-btn nav-btn-back" onClick={handleGoBack}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ width: 12 }} />
              Back
            </button>
            <button className="nav-btn nav-btn-logout" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOut} style={{ width: 12 }} />
              Logout
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="profile-hero">
          <div className="hero-inner">
            <div className="hero-avatar-wrap">
              <img
                src={userDetails.imageUrl || "/default-avatar.png"}
                alt={userDetails.username}
                className="hero-avatar"
                onError={(e) => { e.target.src = "/default-avatar.png"; }}
              />
              <button className="hero-avatar-edit">
                <FontAwesomeIcon icon={faCamera} style={{ width: 12, color: "#fff" }} />
              </button>
            </div>
            <div className="hero-text">
              <h1 className="hero-username">{userDetails.username || "Your Name"}</h1>
              <p className="hero-description">{userDetails.description || "Writer & storyteller"}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="profile-body">
          {/* Info strip */}
          <div className="info-strip">
            <div className="info-tile">
              <div className="info-tile-icon">
                <FontAwesomeIcon icon={faPhone} style={{ width: 14 }} />
              </div>
              <div>
                <p className="info-tile-label">Mobile</p>
                <p className="info-tile-value">{userDetails.phoneNumber || "—"}</p>
              </div>
            </div>
            <div className="info-tile">
              <div className="info-tile-icon">
                <FontAwesomeIcon icon={faMailBulk} style={{ width: 14 }} />
              </div>
              <div>
                <p className="info-tile-label">Email</p>
                <p className="info-tile-value">{userDetails.email || "—"}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button className="profile-action-btn btn-primary" onClick={() => setShowModel(true)}>
              <FontAwesomeIcon icon={faEdit} style={{ width: 12 }} />
              Edit Profile
            </button>
            <button className="profile-action-btn btn-secondary" onClick={() => router.push("/addPost")}>
              <FontAwesomeIcon icon={faPlus} style={{ width: 12 }} />
              New Post
            </button>
          </div>

          {/* Tabs */}
          <div className="tabs-row">
            <button className={`tab-btn ${active === "posts" ? "active" : ""}`} onClick={() => setActive("posts")}>
              Posts
            </button>
            <button className={`tab-btn ${active === "details" ? "active" : ""}`} onClick={() => setActive("details")}>
              Details
            </button>
          </div>

          {/* Tab content */}
          {active === "posts" ? (
            <UserPost />
          ) : (
            <div className="details-card">
              <h3 className="details-card-title">Account Information</h3>
              {[
                { key: "Username", value: userDetails.username },
                { key: "Email", value: userDetails.email },
                { key: "Phone", value: userDetails.phoneNumber },
                { key: "Bio", value: userDetails.description || "No bio yet." },
              ].map(({ key, value }) => (
                <div className="detail-row" key={key}>
                  <span className="detail-key">{key}</span>
                  <span className="detail-value">{value || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModel && (
        <div className="modal-overlay">
          <UpdateProfilePage userDetails={userDetails} onClose={() => setShowModel(false)} />
        </div>
      )}
    </>
  );
};

export default Profile;