"use client";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/useAuth";

export default function Login() {
  const router = useRouter();
  const { user, validationErr, setUser, setValidationErr, loginUser } = useAuth();
  const [sessionMessage, setSessionMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const newUser = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setValidationErr({ ...validationErr, [e.target.name]: "" });
  };

  const handleForm = (e) => {
    e.preventDefault();
    loginUser();
  };

  useEffect(() => {
    const message = localStorage.getItem("message");
    if (message) { setSessionMessage(message); localStorage.removeItem("message"); }
  }, []);

  useEffect(() => {
    if (sessionMessage) toast.info(sessionMessage);
  }, [sessionMessage]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
        }

        /* Left decorative panel */
        .login-panel-left {
          background: #1a1a1a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }
        .login-panel-left::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: rgba(201,169,110,0.08);
        }
        .login-panel-left::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(201,169,110,0.05);
        }
        .brand-mark {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          z-index: 1;
        }
        .brand-icon {
          width: 42px; height: 42px;
          background: #c9a96e;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          font-size: 1.3rem;
          color: #1a1a1a;
        }
        .brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.02em;
        }
        .left-center {
          position: relative;
          z-index: 1;
        }
        .left-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.2rem;
          font-weight: 300;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 1.25rem;
        }
        .left-headline em {
          color: #c9a96e;
          font-style: italic;
        }
        .left-sub {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.45);
          font-weight: 300;
          line-height: 1.7;
          max-width: 320px;
        }
        .left-decoration {
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          z-index: 1;
        }
        .left-decoration-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }
        .left-decoration-text {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          font-weight: 500;
        }

        /* Right form panel */
        .login-panel-right {
          background: #fdf9f5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
        }
        .login-form-wrap {
          width: 100%;
          max-width: 380px;
        }
        .form-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.35rem;
        }
        .form-subheading {
          font-size: 0.88rem;
          color: #9e9589;
          font-weight: 300;
          margin-bottom: 2.5rem;
        }
        .session-notice {
          padding: 0.7rem 1rem;
          background: #f0f7ff;
          border-left: 3px solid #4a9eff;
          border-radius: 2px;
          font-size: 0.85rem;
          color: #2a5fa8;
          margin-bottom: 1.5rem;
        }
        .field-group {
          margin-bottom: 1.25rem;
        }
        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4a4540;
          margin-bottom: 0.5rem;
        }
        .field-input-wrap {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: #c9a96e;
          width: 14px;
        }
        .field-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.5rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-weight: 300;
        }
        .field-input:focus {
          border-color: #c9a96e;
          box-shadow: 0 0 0 3px rgba(201,169,110,0.1);
        }
        .field-input::placeholder { color: #c5bdb6; }
        .pw-toggle {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9e9589;
          padding: 2px;
          transition: color 0.2s;
        }
        .pw-toggle:hover { color: #1a1a1a; }
        .field-error {
          font-size: 0.78rem;
          color: #c0392b;
          margin-top: 4px;
          font-weight: 400;
        }
        .form-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.75rem;
        }
        .remember-label {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.82rem;
          color: #4a4540;
          cursor: pointer;
          font-weight: 300;
        }
        .remember-label input[type="checkbox"] { accent-color: #c9a96e; }
        .forgot-link {
          font-size: 0.82rem;
          color: #c9a96e;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .forgot-link:hover { opacity: 0.7; }
        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.75rem;
        }
        .submit-btn:hover { background: #c9a96e; }
        .submit-btn:active { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .divider-line { flex: 1; height: 1px; background: #e8e3db; }
        .divider-text {
          font-size: 0.72rem;
          color: #c5bdb6;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .signup-prompt {
          text-align: center;
          font-size: 0.85rem;
          color: #9e9589;
          font-weight: 300;
        }
        .signup-link {
          color: #1a1a1a;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid #1a1a1a;
          transition: color 0.2s, border-color 0.2s;
        }
        .signup-link:hover { color: #c9a96e; border-color: #c9a96e; }

        @media (max-width: 768px) {
          .login-page { grid-template-columns: 1fr; }
          .login-panel-left { display: none; }
          .login-panel-right { padding: 2rem 1.5rem; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="login-page">
        {/* Left decorative */}
        <div className="login-panel-left">
          <div className="brand-mark">
            <div className="brand-icon">B</div>
            <span className="brand-name">BlogApp</span>
          </div>
          <div className="left-center">
            <h1 className="left-headline">
              Your ideas<br />deserve to be<br /><em>heard.</em>
            </h1>
            <p className="left-sub">
              Join a community of writers, thinkers, and curious minds sharing stories that matter.
            </p>
          </div>
          <div className="left-decoration">
            <div className="left-decoration-line" />
            <span className="left-decoration-text">Est. 2024</span>
            <div className="left-decoration-line" />
          </div>
        </div>

        {/* Right form */}
        <div className="login-panel-right">
          <div className="login-form-wrap">
            <h2 className="form-heading">Welcome back</h2>
            <p className="form-subheading">Sign in to continue reading and writing</p>

            {sessionMessage && (
              <div className="session-notice">{sessionMessage}</div>
            )}

            <form noValidate onSubmit={handleForm}>
              <div className="field-group">
                <label className="field-label">Username</label>
                <div className="field-input-wrap">
                  <FontAwesomeIcon icon={faUser} className="field-icon" />
                  <input
                    type="text"
                    name="username"
                    className="field-input"
                    placeholder="your_username"
                    value={user.username}
                    onChange={newUser}
                    required
                  />
                </div>
                {validationErr.username && <p className="field-error">{validationErr.username}</p>}
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-input-wrap">
                  <FontAwesomeIcon icon={faLock} className="field-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="field-input"
                    placeholder="••••••••"
                    value={user.password}
                    onChange={newUser}
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} style={{ width: 15 }} />
                  </button>
                </div>
                {validationErr.password && <p className="field-error">{validationErr.password}</p>}
              </div>

              <div className="form-meta">
                <label className="remember-label">
                  <input type="checkbox" />
                  Remember me
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <button type="submit" className="submit-btn">
                Sign In
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">New here?</span>
              <div className="divider-line" />
            </div>

            <p className="signup-prompt">
              <a href="/signup" className="signup-link">Create an account</a>
              {" "}and start sharing your stories
            </p>
          </div>
        </div>
      </div>
    </>
  );
}