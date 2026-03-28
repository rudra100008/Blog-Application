"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faCamera,
  faUser,
  faMailBulk,
  faPhone,
  faFileText,
} from "@fortawesome/free-solid-svg-icons";
import api from "../api/api";
import { useAuth } from "../contexts/useAuth";

export default function UpdateProfileComponent({ onClose }) {
  const { userId, userDetails, fetchUserById } = useAuth();

  const [user, setUser] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    description: "",
    image: null,
  });

  const [validationError, setValidationError] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    description: "",
    image: "",
  });

  const handleFileChange = (e) => {
    setUser({ ...user, image: e.target.files[0] });
  };

  const updateProfile = async () => {
    const formData = new FormData();
    formData.append(
      "user",
      new Blob(
        [
          JSON.stringify({
            username: user.username || userDetails?.username || "",
            email: user.email || userDetails?.email || "",
            phoneNumber: user.phoneNumber || userDetails?.phoneNumber || "",
            description: user.description || userDetails?.description || "",
          }),
        ],
        { type: "application/json" }
      )
    );
    if (user.image) formData.append("image", user.image);

    await api
      .put(`/users/${userId}`, formData)
      .then(() => {
        setUser({ username: "", email: "", phoneNumber: "", description: "", image: null });
        toast.success("Profile updated successfully");
        setValidationError({});
        onClose?.();
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          const { message } = error.response.data;
          if (typeof message === "object") setValidationError(message);
          else toast.error(message);
        } else {
          toast.error("Unexpected error occurred");
        }
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProfile();
  };

  useEffect(() => {
    fetchUserById();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .update-modal {
          background: #fff;
          border-radius: 4px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18);
        }
        .update-modal-header {
          padding: 1.75rem 2rem 1.25rem;
          border-bottom: 1px solid #f0ece6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .update-modal-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: #1a1a1a;
        }
        .update-modal-sub {
          font-size: 0.8rem;
          color: #9e9589;
          font-weight: 300;
          margin-top: 2px;
        }
        .modal-close-btn {
          width: 32px; height: 32px;
          background: #f5f1eb;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #4a4540;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .modal-close-btn:hover { background: #1a1a1a; color: #fff; }

        .update-modal-body {
          padding: 1.75rem 2rem;
        }

        /* Avatar section */
        .avatar-section {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.1rem 1.25rem;
          background: #fdf9f5;
          border: 1px solid #e8e3db;
          border-radius: 3px;
          margin-bottom: 1.5rem;
        }
        .avatar-img {
          width: 56px; height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e8e3db;
          flex-shrink: 0;
        }
        .avatar-empty {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: #f0ece6;
          border: 2px dashed #e0dbd3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #c9a96e;
        }
        .avatar-info { flex: 1; }
        .avatar-info-name {
          font-size: 0.82rem;
          color: #4a4540;
          font-weight: 400;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        .avatar-info-hint {
          font-size: 0.72rem;
          color: #9e9589;
          font-weight: 300;
        }
        .avatar-change-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.85rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          color: #4a4540;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .avatar-change-btn:hover { border-color: #c9a96e; color: #1a1a1a; }

        .fields-col { display: flex; flex-direction: column; gap: 1rem; }

        .upd-field-label {
          display: block;
          font-size: 0.71rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #4a4540;
          margin-bottom: 0.4rem;
        }
        .upd-field-wrap { position: relative; }
        .upd-field-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #c9a96e;
          width: 13px;
          pointer-events: none;
        }
        .upd-field-icon-top {
          position: absolute;
          left: 0.85rem;
          top: 0.8rem;
          color: #c9a96e;
          width: 13px;
          pointer-events: none;
        }
        .upd-field-input {
          width: 100%;
          padding: 0.7rem 0.85rem 0.7rem 2.3rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-weight: 300;
        }
        .upd-field-input:focus {
          border-color: #c9a96e;
          box-shadow: 0 0 0 3px rgba(201,169,110,0.1);
        }
        .upd-field-input::placeholder { color: #c5bdb6; }
        .upd-textarea {
          width: 100%;
          padding: 0.7rem 0.85rem 0.7rem 2.3rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: #1a1a1a;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-weight: 300;
          resize: none;
        }
        .upd-textarea:focus {
          border-color: #c9a96e;
          box-shadow: 0 0 0 3px rgba(201,169,110,0.1);
        }
        .upd-textarea::placeholder { color: #c5bdb6; }
        .upd-field-error {
          font-size: 0.74rem;
          color: #c0392b;
          margin-top: 3px;
        }

        .update-modal-footer {
          padding: 1.25rem 2rem 1.75rem;
          border-top: 1px solid #f0ece6;
          display: flex;
          justify-content: flex-end;
          gap: 0.65rem;
        }
        .footer-cancel-btn {
          padding: 0.6rem 1.3rem;
          border: 1px solid #e0dbd3;
          border-radius: 3px;
          background: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          color: #4a4540;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .footer-cancel-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .footer-save-btn {
          padding: 0.6rem 1.6rem;
          background: #1a1a1a;
          border: none;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s;
        }
        .footer-save-btn:hover { background: #c9a96e; }
      `}</style>

      <div className="update-modal">
        <div className="update-modal-header">
          <div>
            <h3 className="update-modal-title">Edit Profile</h3>
            <p className="update-modal-sub">Leave fields blank to keep current values</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} style={{ width: 12 }} />
          </button>
        </div>

        <div className="update-modal-body">
          {/* Avatar */}
          <div className="avatar-section">
            {user.image ? (
              <img src={URL.createObjectURL(user.image)} alt="Preview" className="avatar-img" />
            ) : userDetails?.imageUrl ? (
              <img src={userDetails.imageUrl} alt="Current" className="avatar-img" onError={(e) => { e.target.src = "/default-avatar.png"; }} />
            ) : (
              <div className="avatar-empty">
                <FontAwesomeIcon icon={faCamera} style={{ width: 18 }} />
              </div>
            )}
            <div className="avatar-info">
              <p className="avatar-info-name">{user.image ? user.image.name : "Current photo"}</p>
              <p className="avatar-info-hint">Leave unchanged to keep current photo</p>
            </div>
            <label className="avatar-change-btn">
              <FontAwesomeIcon icon={faCamera} style={{ width: 11 }} />
              Change
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          </div>
          {validationError.image && <p className="upd-field-error" style={{ marginTop: "-0.75rem", marginBottom: "1rem" }}>{validationError.image}</p>}

          <form noValidate onSubmit={handleUpdate}>
            <div className="fields-col">
              <div>
                <label className="upd-field-label">Username</label>
                <div className="upd-field-wrap">
                  <FontAwesomeIcon icon={faUser} className="upd-field-icon" />
                  <input
                    type="text"
                    className="upd-field-input"
                    placeholder={userDetails?.username || "Username"}
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                  />
                </div>
                {validationError.username && <p className="upd-field-error">{validationError.username}</p>}
              </div>

              <div>
                <label className="upd-field-label">Email</label>
                <div className="upd-field-wrap">
                  <FontAwesomeIcon icon={faMailBulk} className="upd-field-icon" />
                  <input
                    type="email"
                    className="upd-field-input"
                    placeholder={userDetails?.email || "email@example.com"}
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                  />
                </div>
                {validationError.email && <p className="upd-field-error">{validationError.email}</p>}
              </div>

              <div>
                <label className="upd-field-label">Phone Number</label>
                <div className="upd-field-wrap">
                  <FontAwesomeIcon icon={faPhone} className="upd-field-icon" />
                  <input
                    type="text"
                    className="upd-field-input"
                    placeholder={userDetails?.phoneNumber || "Phone number"}
                    value={user.phoneNumber}
                    onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                  />
                </div>
                {validationError.phoneNumber && <p className="upd-field-error">{validationError.phoneNumber}</p>}
              </div>

              <div>
                <label className="upd-field-label">About Yourself</label>
                <div className="upd-field-wrap">
                  <FontAwesomeIcon icon={faFileText} className="upd-field-icon-top" />
                  <textarea
                    className="upd-textarea"
                    placeholder={userDetails?.description || "Tell us about yourself..."}
                    rows={3}
                    value={user.description}
                    onChange={(e) => setUser({ ...user, description: e.target.value })}
                  />
                </div>
                {validationError.description && <p className="upd-field-error">{validationError.description}</p>}
              </div>
            </div>
          </form>
        </div>

        <div className="update-modal-footer">
          <button className="footer-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="footer-save-btn" onClick={handleUpdate}>Save Changes</button>
        </div>
      </div>
    </>
  );
}