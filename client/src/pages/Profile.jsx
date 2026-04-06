import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { FiArrowLeft, FiCamera, FiTrash2, FiLoader } from "react-icons/fi";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profilePicture: user?.profilePicture || null
  });
  const [form, setForm] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: ""
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .get("/auth/me")
      .then((res) => {
        if (!mounted) return;
        const userData = res.data.data.user;
        setProfile({
          name: userData.name,
          email: userData.email,
          profilePicture: userData.profilePicture
        });
        setForm((prev) => ({ ...prev, name: userData.name }));
        updateUser(userData);
      })
      .catch(() => {
        // ignore for now, user object is already available
      });
    return () => {
      mounted = false;
    };
  }, [updateUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setUploading(true);
    setError("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result;
        const res = await api.put("/auth/profile", { profilePicture: base64String });
        const updatedUser = res.data.data.user;
        setProfile((prev) => ({ ...prev, profilePicture: updatedUser.profilePicture }));
        updateUser(updatedUser);
        setStatus("Profile picture updated successfully!");
        setTimeout(() => setStatus(""), 3000);
      } catch (err) {
        console.error("Error uploading image:", err);
        const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to upload image";
        setError(errorMsg);
        setTimeout(() => setError(""), 5000);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read image file");
      setUploading(false);
      setTimeout(() => setError(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = async () => {
    setUploading(true);
    try {
      const res = await api.put("/auth/profile", { profilePicture: null });
      const updatedUser = res.data.data.user;
      setProfile((prev) => ({ ...prev, profilePicture: null }));
      updateUser(updatedUser);
      setStatus("Profile picture removed successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove image");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);
    try {
      // 1. Update Profile (Name)
      const res = await api.put("/auth/profile", { name: form.name });
      const updatedUser = res.data.data.user;
      
      // 2. Update Password if provided
      if (form.currentPassword && form.newPassword) {
        await api.put("/auth/password", {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        });
      }

      setProfile((prev) => ({ ...prev, name: updatedUser.name, email: updatedUser.email }));
      updateUser(updatedUser);
      setStatus("Profile updated successfully!");
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatus("");
        setError("");
      }, 4000);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">Profile Settings</h1>
          </div>
          <div className="top-bar-right">
            <button
              type="button"
              className="icon-btn-top"
              onClick={() => navigate("/")}
              aria-label="Back to dashboard"
            >
              <FiArrowLeft />
            </button>
          </div>
        </header>

        <div className="dashboard-content-glass lift-in">
          <div className="widget profile-widget">
            <div className="widget-header">
              <h2>Profile Information</h2>
            </div>
            <div className="widget-body">
              <div className="profile-section">
                <div className="profile-picture-section">
                  <div className="profile-picture-container">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt={profile.name}
                        className="profile-picture-large"
                      />
                    ) : (
                      <div className="profile-picture-placeholder-large">
                        {profile.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="profile-picture-overlay">
                      <label className="upload-btn" htmlFor="profile-upload">
                        {uploading ? <FiLoader className="spinning" /> : <FiCamera />}
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                          disabled={uploading}
                        />
                      </label>
                      {profile.profilePicture && (
                        <button
                          className="remove-btn"
                          onClick={removeImage}
                          disabled={uploading}
                          aria-label="Remove picture"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="profile-picture-hint">
                    Click the camera icon to upload a new profile picture
                  </p>
                </div>

                <form className="profile-form" onSubmit={handleSubmit}>
                  <label>
                    Display Name
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                    />
                  </label>
                  <label>
                    Email Address
                    <input value={profile.email} disabled className="disabled-input" />
                    <span className="field-hint">Email cannot be changed</span>
                  </label>

                  <div className="divider-section">
                    <h3>Change Password</h3>
                    <p className="section-hint">Leave blank to keep current password</p>
                  </div>

                  <label>
                    Current Password
                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      autoComplete="current-password"
                      placeholder="Enter current password"
                    />
                  </label>
                  <label>
                    New Password
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                    />
                  </label>

                  {status && <div className="success-message">{status}</div>}
                  {error && <div className="error-message">{error}</div>}

                  <div className="form-actions">
                    <button type="submit" className="btn primary" disabled={loading || uploading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => navigate("/")}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
