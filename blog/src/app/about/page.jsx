"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/api";
import { useAuth } from "../contexts/useAuth";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faUsers,
  faHeart,
  faGlobe,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const STATS = [
  { value: "10K+", label: "Stories Published", desc: "and growing every day" },
  { value: "3.2K", label: "Active Writers", desc: "from all over the world" },
  { value: "48K", label: "Monthly Readers", desc: "who keep coming back" },
  { value: "120+", label: "Categories", desc: "for every kind of story" },
];

const STEPS = [
  {
    num: "01",
    icon: faUsers,
    title: "Create an Account",
    desc: "Sign up in under a minute. A username and email is all you need — no credit card, no friction, no noise.",
  },
  {
    num: "02",
    icon: faPenToSquare,
    title: "Write Your Story",
    desc: "A clean, distraction-free editor. Add a title, your content, a cover image, and pick a category. Then publish.",
  },
  {
    num: "03",
    icon: faHeart,
    title: "Connect & Engage",
    desc: "Like posts that move you. Leave comments that start conversations. Build a readership around your ideas.",
  },
  {
    num: "04",
    icon: faGlobe,
    title: "Reach the World",
    desc: "Every story you publish is immediately discoverable by every reader on the platform. No waiting, no gatekeeping.",
  },
];

export default function About() {
  const { userId } = useAuth();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState({
    id: null, username: "", email: "", image: "",
    phoneNumber: "", description: "",
  });

  useEffect(() => {
    if (!userId) return;
    api.get(`/users/${userId}`)
      .then(({ data }) => {
        const { id, username, email, image, phoneNumber, description, imageUrl, publicId } = data;
        setUserDetails({ id, username, email, image, phoneNumber, description, imageUrl, publicId });
      })
      .catch((err) => console.log(err.response?.data || err.message));
  }, [router, userId]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .about-page {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          color: #1a1a1a;
        }

        /* ─── HERO ───────────────────────── */
        .about-hero {
          background: #1a1a1a;
          position: relative;
          overflow: hidden;
          padding: 5.5rem 1.5rem 5rem;
          text-align: center;
        }
        .about-hero::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 700px; height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero-ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }
        .ornament-line { width: 48px; height: 1px; background: rgba(201,169,110,0.35); }
        .ornament-diamond {
          width: 6px; height: 6px;
          background: #c9a96e;
          transform: rotate(45deg);
        }
        .hero-eyebrow {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #c9a96e;
          margin-bottom: 1.1rem;
          position: relative;
          z-index: 1;
        }
        .hero-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          font-weight: 300;
          color: #fff;
          line-height: 1.08;
          margin: 0 auto 1.5rem;
          position: relative;
          z-index: 1;
          max-width: 680px;
          letter-spacing: -0.01em;
        }
        .hero-headline em { font-style: italic; color: #c9a96e; }
        .hero-sub {
          font-size: 0.92rem;
          color: rgba(255,255,255,0.38);
          font-weight: 300;
          line-height: 1.85;
          max-width: 480px;
          margin: 0 auto 2.75rem;
          position: relative;
          z-index: 1;
        }
        .hero-cta-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .hero-btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 2rem;
          background: #c9a96e;
          color: #1a1a1a;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .hero-btn-gold:hover { background: #fff; transform: translateY(-1px); }
        .hero-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.75rem;
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.5);
          border-radius: 3px;
          font-size: 0.8rem;
          font-weight: 500;
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: border-color 0.2s, color 0.2s;
        }
        .hero-btn-ghost:hover { border-color: rgba(255,255,255,0.38); color: #fff; }

        /* ─── STATS ──────────────────────── */
        .stats-outer {
          background: #fff;
          border-bottom: 1px solid #e8e3db;
        }
        .stats-grid {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .stat-tile {
          padding: 3.25rem 1.75rem 2.75rem;
          text-align: center;
          border-right: 1px solid #f0ece6;
          position: relative;
        }
        .stat-tile:last-child { border-right: none; }
        .stat-tile::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 28px; height: 2px;
          background: #c9a96e;
        }
        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.2rem;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1;
          letter-spacing: -0.03em;
          margin-bottom: 0.45rem;
        }
        .stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1a1a1a;
          margin-bottom: 0.35rem;
        }
        .stat-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.9rem;
          font-style: italic;
          color: #c5bdb6;
          font-weight: 300;
        }

        /* ─── HOW IT WORKS ───────────────── */
        .about-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .section { padding: 5rem 0; }

        .section-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c9a96e;
          margin-bottom: 0.9rem;
        }
        .section-eyebrow::before {
          content: '';
          display: inline-block;
          width: 22px; height: 2px;
          background: #c9a96e;
          flex-shrink: 0;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 2.9rem);
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.15;
          margin-bottom: 0.65rem;
          letter-spacing: -0.01em;
        }
        .section-title em { font-style: italic; color: #9e9589; }
        .section-intro {
          font-size: 0.9rem;
          color: #7a7268;
          font-weight: 300;
          line-height: 1.85;
          max-width: 520px;
          margin-bottom: 3rem;
        }

        /* Timeline */
        .steps-timeline {
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .steps-timeline::before {
          content: '';
          position: absolute;
          left: 27px;
          top: 50px;
          bottom: 50px;
          width: 1px;
          background: linear-gradient(180deg, #c9a96e 0%, rgba(201,169,110,0.08) 100%);
        }
        .step-row {
          display: flex;
          align-items: flex-start;
          gap: 1.75rem;
          padding: 2rem 0;
          border-bottom: 1px solid #f0ece6;
          position: relative;
        }
        .step-row:last-child { border-bottom: none; }
        .step-marker {
          flex-shrink: 0;
          width: 54px; height: 54px;
          background: #1a1a1a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          border: 3px solid #f7f3ee;
          transition: background 0.2s;
        }
        .step-row:hover .step-marker { background: #c9a96e; }
        .step-marker-icon { color: #c9a96e; width: 17px; transition: color 0.2s; }
        .step-row:hover .step-marker-icon { color: #1a1a1a; }

        .step-card-inner {
          flex: 1;
          background: #fdf9f5;
          border: 1px solid #ede8e2;
          border-radius: 4px;
          padding: 1.5rem 1.75rem;
          position: relative;
          overflow: hidden;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.25s;
        }
        .step-row:hover .step-card-inner {
          background: #fff;
          border-color: #d8d3cc;
          box-shadow: 0 6px 24px rgba(0,0,0,0.06);
        }
        /* Ghost number */
        .step-card-inner::after {
          content: attr(data-num);
          position: absolute;
          right: 1rem;
          bottom: -0.75rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 4.5rem;
          font-weight: 700;
          color: rgba(201,169,110,0.1);
          line-height: 1;
          pointer-events: none;
          letter-spacing: -0.04em;
          transition: color 0.2s;
        }
        .step-row:hover .step-card-inner::after { color: rgba(201,169,110,0.16); }
        .step-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }
        .step-card-desc {
          font-size: 0.87rem;
          color: #7a7268;
          line-height: 1.8;
          font-weight: 300;
          max-width: 560px;
        }

        /* ─── CTA ────────────────────────── */
        .cta-section { padding: 0 0 5.5rem; }
        .cta-banner {
          background: #1a1a1a;
          border-radius: 4px;
          padding: 3.5rem 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }
        .cta-banner::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: rgba(201,169,110,0.07);
          pointer-events: none;
        }
        .cta-left-bar {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #c9a96e, #b8924f);
        }
        .cta-text { position: relative; z-index: 1; }
        .cta-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.1rem;
          font-weight: 300;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 0.4rem;
        }
        .cta-headline em { font-style: italic; color: #c9a96e; }
        .cta-sub {
          font-size: 0.83rem;
          color: rgba(255,255,255,0.35);
          font-weight: 300;
        }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 2rem;
          background: #c9a96e;
          color: #1a1a1a;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          position: relative;
          z-index: 1;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cta-btn:hover { background: #fff; transform: translateY(-1px); }

        /* ─── RESPONSIVE ─────────────────── */
        @media (max-width: 700px) {
          .stats-grid { grid-template-columns: 1fr 1fr; padding: 0 1.5rem; }
          .stat-tile { border-right: none; border-bottom: 1px solid #f0ece6; }
          .stat-tile:nth-child(odd) { border-right: 1px solid #f0ece6; }
          .stat-tile:nth-child(3), .stat-tile:nth-child(4) { border-bottom: none; }
          .steps-timeline::before { left: 23px; }
          .step-marker { width: 46px; height: 46px; }
          .cta-banner { flex-direction: column; text-align: center; padding: 2.5rem 1.75rem; }
          .cta-left-bar { left: 0; right: 0; top: 0; bottom: auto; width: auto; height: 3px; }
          .section { padding: 3.5rem 0; }
        }
      `}</style>

      <div className="about-page">
        <Navbar user={userDetails} />

        {/* ── Hero ── */}
        <div className="about-hero">
          <div className="hero-ornament">
            <div className="ornament-line" />
            <div className="ornament-diamond" />
            <div className="ornament-line" />
          </div>
          <p className="hero-eyebrow">About BlogApp</p>
          <h1 className="hero-headline">
            A place for words<br />that <em>matter.</em>
          </h1>
          <p className="hero-sub">
            BlogApp was built on a simple belief — that every person has a story worth telling, and every story deserves to be read.
          </p>
          <div className="hero-cta-row">
            <Link href="/signup" className="hero-btn-gold">
              <FontAwesomeIcon icon={faPenToSquare} style={{ width: 12 }} />
              Start Writing
            </Link>
            <Link href="/home" className="hero-btn-ghost">
              Browse Stories
              <FontAwesomeIcon icon={faArrowRight} style={{ width: 11 }} />
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="stats-outer">
          <div className="stats-grid">
            {STATS.map(({ value, label, desc }) => (
              <div className="stat-tile" key={label}>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
                <div className="stat-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── How It Works ── */}
        <div className="about-container">
          <div className="section">
            <p className="section-eyebrow">How It Works</p>
            <h2 className="section-title">
              From blank page<br />to <em>published story.</em>
            </h2>
            <p className="section-intro">
              No complicated setup. No learning curve. BlogApp gets out of the way and lets you write.
            </p>

            <div className="steps-timeline">
              {STEPS.map((step) => (
                <div className="step-row" key={step.num}>
                  <div className="step-marker">
                    <FontAwesomeIcon icon={step.icon} className="step-marker-icon" />
                  </div>
                  <div className="step-card-inner" data-num={step.num}>
                    <h3 className="step-card-title">{step.title}</h3>
                    <p className="step-card-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="cta-section">
            <div className="cta-banner">
              <div className="cta-left-bar" />
              <div className="cta-text">
                <h2 className="cta-headline">
                  Ready to share your<br /><em>first story?</em>
                </h2>
                <p className="cta-sub">Join thousands of writers already publishing on BlogApp.</p>
              </div>
              <Link href="/addPost" className="cta-btn">
                <FontAwesomeIcon icon={faPenToSquare} style={{ width: 12 }} />
                Write a Post
                <FontAwesomeIcon icon={faArrowRight} style={{ width: 11 }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}