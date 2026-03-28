"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AllPost from "../components/AllPost";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/useAuth";
import api from "../api/api";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { userId, isHydrated } = useAuth();
  const [userDetails, setUserDetails] = useState({
    id: null,
    username: "",
    email: "",
    image: "",
    phoneNumber: "",
    description: "",
  });

  const getUserDetails = useCallback(async () => {
    setLoading(true);
    if (!userId) { setLoading(false); return; }
    try {
      const response = await api.get(`/users/${userId}`);
      const { id, username, email, image, phoneNumber, description, imageUrl, publicId } = response.data;
      setUserDetails({ id, username, email, image, phoneNumber, description, imageUrl, publicId });
    } catch (error) {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") localStorage.removeItem("userId");
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isHydrated && userId && !userDetails.id) getUserDetails();
  }, [userId, userDetails.id, getUserDetails, isHydrated]);

  if (!isHydrated) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .home-page {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Loading ── */
        .home-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          background: #f7f3ee;
        }
        .loading-mark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.02em;
          animation: pulse-opacity 1.4s ease-in-out infinite;
        }
        .loading-mark span { color: #c9a96e; }
        @keyframes pulse-opacity {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .loading-label {
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #9e9589;
        }

        /* ── Hero banner ── */
        .home-hero-wrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 0;
        }
        .home-hero {
          position: relative;
          background: #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          align-items: stretch;
          min-height: 160px;
        }

        /* Decorative left accent bar */
        .hero-accent {
          width: 5px;
          background: linear-gradient(180deg, #c9a96e 0%, #b8924f 100%);
          flex-shrink: 0;
        }

        /* Decorative circles */
        .hero-circle-1 {
          position: absolute;
          top: -80px; right: -80px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(201,169,110,0.07);
          pointer-events: none;
        }
        .hero-circle-2 {
          position: absolute;
          bottom: -60px; right: 180px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(201,169,110,0.04);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex: 1;
          padding: 2.25rem 2.5rem;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .hero-text { }
        .hero-eyebrow {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #c9a96e;
          margin-bottom: 0.6rem;
        }
        .hero-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 0.5rem;
        }
        .hero-headline em {
          font-style: italic;
          color: #c9a96e;
        }
        .hero-sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.38);
          font-weight: 300;
          max-width: 340px;
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 2rem;
          background: #c9a96e;
          color: #1a1a1a;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hero-cta:hover {
          background: #fff;
          transform: translateY(-1px);
        }
        .hero-cta-icon {
          transition: transform 0.2s;
        }
        .hero-cta:hover .hero-cta-icon {
          transform: translateX(3px);
        }

        /* ── Section strip below hero ── */
        .home-meta-strip {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.25rem 1.5rem 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .meta-strip-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 400;
          color: #1a1a1a;
          letter-spacing: -0.01em;
        }
        .meta-strip-label em {
          font-style: italic;
          color: #9e9589;
        }
        .meta-strip-line {
          flex: 1;
          height: 1px;
          background: #e8e3db;
          margin: 0 1.5rem;
        }
        .meta-strip-date {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c9a96e;
        }

        /* ── Feed area ── */
        .home-feed {
          padding-top: 2rem;
        }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="light"
      />

      {loading ? (
        <div className="home-loading">
          <div className="loading-mark">Blog<span>App</span></div>
          <p className="loading-label">Loading your feed</p>
        </div>
      ) : (
        <div className="home-page">
          <Navbar user={userDetails} />

          {/* Hero */}
          <div className="home-hero-wrap">
            <div className="home-hero">
              <div className="hero-accent" />
              <div className="hero-circle-1" />
              <div className="hero-circle-2" />
              <div className="hero-content">
                <div className="hero-text">
                  <p className="hero-eyebrow">Your community awaits</p>
                  <h2 className="hero-headline">
                    Got something <em>worth</em><br />sharing?
                  </h2>
                  <p className="hero-sub">
                    Publish your thoughts, ideas, and stories to readers who care.
                  </p>
                </div>
                <Link href="/addPost" className="hero-cta">
                  <FontAwesomeIcon icon={faPenToSquare} style={{ width: 13 }} />
                  Write a Post
                  <FontAwesomeIcon icon={faArrowRight} className="hero-cta-icon" style={{ width: 12 }} />
                </Link>
              </div>
            </div>
          </div>

          {/* Section strip */}
          <div className="home-meta-strip">
            <span className="meta-strip-label">The <em>feed</em></span>
            <div className="meta-strip-line" />
            <span className="meta-strip-date">
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {/* Feed */}
          <div className="home-feed">
            <AllPost />
          </div>
        </div>
      )}
    </>
  );
}