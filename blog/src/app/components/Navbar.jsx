"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faInfoCircle,
  faBars,
  faSignOut,
  faTimes,
  faRightFromBracket,
  faPenToSquare,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { logout } from "../services/AuthService";
import { useAuth } from "../contexts/useAuth";

const DEFAULT_AVATAR = "/default-avatar.png";

const Navbar = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userId } = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogout = async () => {
    try {
      await logout(router);
      toast.success("Logout successful");
    } catch (err) {
      toast.error("Logout unsuccessful");
    }
  };

  useEffect(() => {
    setLoggedIn(!!userId);
  }, [userId]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const displayUsername = user?.username || "";
  const displayImage = user?.imageUrl || DEFAULT_AVATAR;

  const navLinks = [
    { href: "/home", label: "Home", icon: faHome },
    { href: "/about", label: "About", icon: faInfoCircle },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .navbar {
          background: #fff;
          border-bottom: 1px solid #e8e3db;
          position: sticky;
          top: 0;
          z-index: 50;
          font-family: 'DM Sans', sans-serif;
        }

        /* Thin gold top-line — brand signature */
        .navbar::before {
          content: '';
          display: block;
          height: 2px;
          background: linear-gradient(90deg, #1a1a1a 0%, #c9a96e 60%, #1a1a1a 100%);
        }

        .navbar-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        /* ── Brand ── */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .brand-icon {
          width: 32px;
          height: 32px;
          background: #1a1a1a;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #c9a96e;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .navbar-brand:hover .brand-icon { background: #c9a96e; color: #1a1a1a; }
        .brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.01em;
        }

        /* ── Desktop nav links ── */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.9rem;
          border-radius: 3px;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #7a7268;
          text-decoration: none;
          transition: color 0.2s, background 0.2s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #c9a96e;
          transition: width 0.2s;
        }
        .nav-link:hover { color: #1a1a1a; }
        .nav-link.active { color: #1a1a1a; font-weight: 600; }
        .nav-link.active::after { width: calc(100% - 1.8rem); }

        /* ── Right side ── */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }

        /* Write button */
        .write-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.42rem 1rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          background: #fdf9f5;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #4a4540;
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .write-btn:hover {
          border-color: #1a1a1a;
          color: #1a1a1a;
          background: #fff;
        }

        /* Divider */
        .nav-divider {
          width: 1px;
          height: 20px;
          background: #e8e3db;
        }

        /* User pill */
        .user-pill {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.3rem 0.75rem 0.3rem 0.3rem;
          border-radius: 3px;
          border: 1px solid transparent;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
          cursor: pointer;
        }
        .user-pill:hover {
          border-color: #e0dbd3;
          background: #fdf9f5;
        }
        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid #e8e3db;
          flex-shrink: 0;
        }
        .user-avatar-placeholder {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #f0ece6;
          border: 1.5px solid #e8e3db;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9e9589;
          flex-shrink: 0;
        }
        .user-name {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #1a1a1a;
        }

        /* Logout button */
        .logout-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.42rem 0.85rem;
          border: 1px solid #f0c9c6;
          border-radius: 3px;
          background: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          color: #c0392b;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .logout-btn:hover {
          background: #fdf0f0;
          border-color: #c0392b;
        }

        /* Sign up link */
        .signup-btn {
          display: inline-flex;
          align-items: center;
          padding: 0.45rem 1.25rem;
          background: #1a1a1a;
          color: #fff;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s;
        }
        .signup-btn:hover { background: #c9a96e; color: #1a1a1a; }

        /* ── Mobile hamburger ── */
        .hamburger-btn {
          display: none;
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid #e8e3db;
          border-radius: 3px;
          cursor: pointer;
          color: #4a4540;
          transition: border-color 0.2s, color 0.2s;
        }
        .hamburger-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }

        /* ── Mobile drawer ── */
        .mobile-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 48;
        }
        .mobile-drawer {
          display: none;
          position: fixed;
          top: 0; left: 0;
          width: 280px;
          height: 100vh;
          background: #fff;
          z-index: 49;
          flex-direction: column;
          border-right: 1px solid #e8e3db;
          overflow-y: auto;
        }
        .drawer-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f0ece6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .drawer-close {
          width: 30px; height: 30px;
          background: #f5f1eb;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #4a4540;
          transition: background 0.2s;
        }
        .drawer-close:hover { background: #1a1a1a; color: #fff; }
        .drawer-user {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f0ece6;
          text-decoration: none;
        }
        .drawer-user-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e8e3db;
        }
        .drawer-user-name {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #1a1a1a;
        }
        .drawer-user-sub {
          font-size: 0.72rem;
          color: #9e9589;
          font-weight: 300;
          margin-top: 1px;
        }
        .drawer-nav {
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }
        .drawer-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 3px;
          font-size: 0.88rem;
          font-weight: 500;
          color: #4a4540;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .drawer-nav-link:hover { background: #f5f1eb; color: #1a1a1a; }
        .drawer-nav-link.active { background: #f5f1eb; color: #1a1a1a; font-weight: 600; }
        .drawer-nav-link .link-icon { width: 16px; color: #c9a96e; }
        .drawer-section-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c5bdb6;
          padding: 0.6rem 1rem 0.3rem;
        }
        .drawer-divider { height: 1px; background: #f0ece6; margin: 0.5rem 0; }
        .drawer-footer {
          padding: 1rem 0.75rem;
          border-top: 1px solid #f0ece6;
        }
        .drawer-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 3px;
          border: none;
          background: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: #c0392b;
          cursor: pointer;
          transition: background 0.15s;
        }
        .drawer-logout:hover { background: #fdf0f0; }

        /* ── Responsive breakpoints ── */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .write-btn { display: none; }
          .nav-divider { display: none; }
          .user-pill .user-name { display: none; }
          .logout-btn span { display: none; }
          .hamburger-btn { display: flex; }
        }

        @media (max-width: 480px) {
          .user-pill { display: none; }
          .logout-btn { display: none; }
        }

        .mobile-open .mobile-backdrop { display: block; }
        .mobile-open .mobile-drawer { display: flex; }
      `}</style>

      <div className={isMenuOpen ? "mobile-open" : ""}>
        <nav className="navbar">
          <div className="navbar-inner">
            {/* Brand */}
            <Link href="/home" className="navbar-brand">
              <div className="brand-icon">B</div>
              <span className="brand-name">BlogApp</span>
            </Link>

            {/* Desktop nav links — centered */}
            <ul className="nav-links">
              {navLinks.map(({ href, label, icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`nav-link ${pathname === href ? "active" : ""}`}
                  >
                    <FontAwesomeIcon icon={icon} style={{ width: 12 }} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right side */}
            <div className="navbar-right">
              {loggedIn ? (
                <>
                  {/* Write shortcut */}
                  <Link href="/addPost" className="write-btn">
                    <FontAwesomeIcon icon={faPenToSquare} style={{ width: 11 }} />
                    Write
                  </Link>

                  <div className="nav-divider" />

                  {/* User pill → profile */}
                  <Link href="/profile" className="user-pill">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={displayUsername}
                        className="user-avatar"
                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        <FontAwesomeIcon icon={faUser} style={{ width: 12 }} />
                      </div>
                    )}
                    {displayUsername && (
                      <span className="user-name">@{displayUsername.toUpperCase()}</span>
                    )}
                  </Link>

                  {/* Logout */}
                  <button className="logout-btn" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faRightFromBracket} style={{ width: 12 }} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link href="/signup" className="signup-btn">Sign Up</Link>
              )}

              {/* Mobile hamburger */}
              <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
                <FontAwesomeIcon icon={faBars} style={{ width: 14 }} />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile backdrop */}
        <div className="mobile-backdrop" onClick={() => setIsMenuOpen(false)} />

        {/* Mobile drawer (slides in from left) */}
        <div className="mobile-drawer">
          {/* Drawer header */}
          <div className="drawer-header">
            <Link href="/home" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>
              <div className="brand-icon">B</div>
              <span className="brand-name">BlogApp</span>
            </Link>
            <button className="drawer-close" onClick={() => setIsMenuOpen(false)}>
              <FontAwesomeIcon icon={faTimes} style={{ width: 11 }} />
            </button>
          </div>

          {/* User section (if logged in) */}
          {loggedIn && displayUsername && (
            <Link href="/profile" className="drawer-user" onClick={() => setIsMenuOpen(false)}>
              {displayImage ? (
                <img src={displayImage} alt={displayUsername} className="drawer-user-avatar" onError={(e) => { e.target.src = DEFAULT_AVATAR; }} />
              ) : (
                <div className="user-avatar-placeholder" style={{ width: 44, height: 44 }}>
                  <FontAwesomeIcon icon={faUser} style={{ width: 16 }} />
                </div>
              )}
              <div>
                <p className="drawer-user-name">@{displayUsername.toUpperCase()}</p>
                <p className="drawer-user-sub">View profile</p>
              </div>
            </Link>
          )}

          {/* Nav links */}
          <div className="drawer-nav">
            <p className="drawer-section-label">Navigation</p>
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`drawer-nav-link ${pathname === href ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FontAwesomeIcon icon={icon} className="link-icon" />
                {label}
              </Link>
            ))}

            {loggedIn && (
              <>
                <div className="drawer-divider" />
                <p className="drawer-section-label">Create</p>
                <Link
                  href="/addPost"
                  className="drawer-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="link-icon" />
                  Write a Post
                </Link>
              </>
            )}
          </div>

          {/* Drawer footer */}
          {loggedIn && (
            <div className="drawer-footer">
              <button
                className="drawer-logout"
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              >
                <FontAwesomeIcon icon={faSignOut} style={{ width: 14, color: "#c0392b" }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;