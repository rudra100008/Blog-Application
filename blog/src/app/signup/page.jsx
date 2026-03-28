"use client";
import axios from "axios";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import base_url from "../api/base_url";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faEye,
  faEyeSlash,
  faFileText,
  faLock,
  faMailBulk,
  faPhone,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function Signup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    description: "",
    image: null,
  });
  const [validationError, setValidationError] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    description: "",
    image: "",
  });

  const handleFileChange = (e) => {
    setUser({ ...user, image: e.target.files[0] });
  };

  const postUserToServer = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append(
      "user",
      new Blob(
        [
          JSON.stringify({
            username: user.username,
            email: user.email,
            password: user.password,
            phoneNumber: user.phoneNumber,
            description: user.description,
          }),
        ],
        { type: "application/json" }
      )
    );
    formData.append("image", user.image);

    await axios
      .post(`${base_url}/register`, formData)
      .then((response) => {
        setUser({ username: "", email: "", password: "", phoneNumber: "", description: "" });
        toast.success(response.data.message);
        setValidationError({});
        setTimeout(() => router.push("/"), 1000);
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          const { message } = error.response.data;
          if (typeof message === "string") toast.error(message);
          else if (typeof message === "object") setValidationError(message);
        } else {
          toast.error("Unexpected error occurred.");
        }
      })
      .finally(() => setIsLoading(false));
  };

  const handleForm = (e) => {
    e.preventDefault();
    postUserToServer();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .signup-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 380px 1fr;
          font-family: 'DM Sans', sans-serif;
        }

        /* Left sticky sidebar */
        .signup-sidebar {
          background: #1a1a1a;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem 2.5rem;
          overflow: hidden;
        }
        .signup-sidebar::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: rgba(201,169,110,0.07);
          pointer-events: none;
        }
        .signup-sidebar::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(201,169,110,0.04);
          pointer-events: none;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          position: relative;
          z-index: 1;
        }
        .sidebar-brand-icon {
          width: 38px; height: 38px;
          background: #c9a96e;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          font-size: 1.2rem;
          color: #1a1a1a;
        }
        .sidebar-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #fff;
        }
        .sidebar-center { position: relative; z-index: 1; }
        .sidebar-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem;
          font-weight: 300;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 1.25rem;
        }
        .sidebar-headline em { color: #c9a96e; font-style: italic; }
        .sidebar-desc {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          font-weight: 300;
          line-height: 1.7;
        }
        .sidebar-steps {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sidebar-step {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .step-num {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(201,169,110,0.15);
          border: 1px solid rgba(201,169,110,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          color: #c9a96e;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .step-text {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
          font-weight: 300;
          line-height: 1.5;
        }

        /* Right form area */
        .signup-main {
          background: #f7f3ee;
          padding: 3rem 3.5rem 4rem;
          overflow-y: auto;
        }
        .signup-form-header {
          margin-bottom: 2.5rem;
        }
        .signup-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.3rem;
        }
        .signup-form-sub {
          font-size: 0.88rem;
          color: #9e9589;
          font-weight: 300;
        }

        /* Section dividers */
        .form-section-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c9a96e;
          margin-bottom: 1rem;
          margin-top: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .form-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8e3db;
        }

        .fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .field-full { grid-column: 1 / -1; }

        .field-group { margin-bottom: 0; }
        .field-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #4a4540;
          margin-bottom: 0.45rem;
        }
        .field-input-wrap { position: relative; }
        .field-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: #c9a96e;
          width: 13px;
          pointer-events: none;
        }
        .field-icon-top {
          position: absolute;
          left: 0.9rem;
          top: 0.85rem;
          color: #c9a96e;
          width: 13px;
          pointer-events: none;
        }
        .field-input {
          width: 100%;
          padding: 0.75rem 0.9rem 0.75rem 2.4rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
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
        .field-textarea {
          width: 100%;
          padding: 0.75rem 0.9rem 0.75rem 2.4rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-weight: 300;
          resize: none;
        }
        .field-textarea:focus {
          border-color: #c9a96e;
          box-shadow: 0 0 0 3px rgba(201,169,110,0.1);
        }
        .field-textarea::placeholder { color: #c5bdb6; }
        .pw-toggle-btn {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9e9589;
          transition: color 0.2s;
          padding: 2px;
        }
        .pw-toggle-btn:hover { color: #1a1a1a; }
        .field-error {
          font-size: 0.75rem;
          color: #c0392b;
          margin-top: 4px;
        }

        /* Avatar uploader */
        .avatar-upload-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.1rem 1.25rem;
          background: #fff;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
        }
        .avatar-preview {
          width: 60px; height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e8e3db;
          flex-shrink: 0;
        }
        .avatar-placeholder {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: #f5f1eb;
          border: 2px dashed #e0dbd3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #c9a96e;
        }
        .avatar-upload-info { flex: 1; }
        .avatar-upload-name {
          font-size: 0.82rem;
          color: #4a4540;
          font-weight: 400;
          margin-bottom: 4px;
        }
        .avatar-upload-hint {
          font-size: 0.72rem;
          color: #9e9589;
          font-weight: 300;
        }
        .avatar-upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.9rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          background: #fdf9f5;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          color: #4a4540;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .avatar-upload-btn:hover { border-color: #c9a96e; color: #1a1a1a; }

        /* Submit */
        .submit-section {
          margin-top: 2.5rem;
          padding-top: 1.75rem;
          border-top: 1px solid #e8e3db;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .signin-prompt {
          font-size: 0.85rem;
          color: #9e9589;
          font-weight: 300;
        }
        .signin-link {
          color: #1a1a1a;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid #1a1a1a;
          transition: color 0.2s, border-color 0.2s;
        }
        .signin-link:hover { color: #c9a96e; border-color: #c9a96e; }
        .create-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .create-btn:hover { background: #c9a96e; }
        .create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 860px) {
          .signup-page { grid-template-columns: 1fr; }
          .signup-sidebar { display: none; }
          .signup-main { padding: 2rem 1.5rem 3rem; }
          .fields-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="signup-page">
        {/* Left sidebar */}
        <div className="signup-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">B</div>
            <span className="sidebar-brand-name">BlogApp</span>
          </div>
          <div className="sidebar-center">
            <h1 className="sidebar-headline">
              Start your<br /><em>writing</em><br />journey.
            </h1>
            <p className="sidebar-desc">
              Create an account to publish stories, connect with readers, and build your audience.
            </p>
          </div>
          <div className="sidebar-steps">
            {["Fill in your details", "Upload a profile photo", "Write your first post"].map((s, i) => (
              <div className="sidebar-step" key={i}>
                <div className="step-num">{i + 1}</div>
                <p className="step-text">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="signup-main">
          <div className="signup-form-header">
            <h2 className="signup-form-title">Create your account</h2>
            <p className="signup-form-sub">All fields are required unless noted</p>
          </div>

          <form noValidate onSubmit={handleForm}>
            <p className="form-section-label">Account Details</p>
            <div className="fields-grid">
              <div className="field-group">
                <label className="field-label">Username</label>
                <div className="field-input-wrap">
                  <FontAwesomeIcon icon={faUser} className="field-icon" />
                  <input
                    type="text"
                    className="field-input"
                    placeholder="your_username"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                  />
                </div>
                {validationError.username && <p className="field-error">{validationError.username}</p>}
              </div>

              <div className="field-group">
                <label className="field-label">Phone Number</label>
                <div className="field-input-wrap">
                  <FontAwesomeIcon icon={faPhone} className="field-icon" />
                  <input
                    type="text"
                    className="field-input"
                    placeholder="10-digit number"
                    value={user.phoneNumber}
                    onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                  />
                </div>
                {validationError.phoneNumber && <p className="field-error">{validationError.phoneNumber}</p>}
              </div>

              <div className="field-group field-full">
                <label className="field-label">Email</label>
                <div className="field-input-wrap">
                  <FontAwesomeIcon icon={faMailBulk} className="field-icon" />
                  <input
                    type="email"
                    className="field-input"
                    placeholder="you@example.com"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                  />
                </div>
                {validationError.email && <p className="field-error">{validationError.email}</p>}
              </div>

              <div className="field-group field-full">
                <label className="field-label">Password</label>
                <div className="field-input-wrap">
                  <FontAwesomeIcon icon={faLock} className="field-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="field-input"
                    placeholder="••••••••"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                  />
                  <button type="button" className="pw-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} style={{ width: 14 }} />
                  </button>
                </div>
                {validationError.password && <p className="field-error">{validationError.password}</p>}
              </div>
            </div>

            <p className="form-section-label">Profile</p>

            <div style={{ marginBottom: "1rem" }}>
              <label className="field-label">Profile Photo</label>
              <div className="avatar-upload-row">
                {user.image ? (
                  <img src={URL.createObjectURL(user.image)} alt="Preview" className="avatar-preview" />
                ) : (
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faCamera} style={{ width: 20 }} />
                  </div>
                )}
                <div className="avatar-upload-info">
                  <p className="avatar-upload-name">
                    {user.image ? user.image.name : "No file chosen"}
                  </p>
                  <p className="avatar-upload-hint">PNG, JPG up to 5MB</p>
                </div>
                <label className="avatar-upload-btn">
                  <FontAwesomeIcon icon={faCamera} style={{ width: 12 }} />
                  Browse
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </label>
              </div>
              {validationError.image && <p className="field-error">{validationError.image}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">About Yourself <span style={{ color: "#9e9589", fontWeight: 300, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <div className="field-input-wrap">
                <FontAwesomeIcon icon={faFileText} className="field-icon-top" />
                <textarea
                  className="field-textarea"
                  placeholder="Tell readers who you are..."
                  rows={3}
                  value={user.description}
                  onChange={(e) => setUser({ ...user, description: e.target.value })}
                />
              </div>
              {validationError.description && <p className="field-error">{validationError.description}</p>}
            </div>

            <div className="submit-section">
              <p className="signin-prompt">
                Already have an account?{" "}
                <a href="/" className="signin-link">Sign in</a>
              </p>
              <button type="submit" className="create-btn" disabled={isLoading}>
                {isLoading ? (
                  <><div className="spinner" />Creating...</>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}