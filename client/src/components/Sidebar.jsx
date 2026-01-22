import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  FiLayout, 
  FiUser, 
  FiMenu,
  FiX 
} from "react-icons/fi";
import { useState } from "react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: FiLayout },
  { path: "/profile", label: "Profile", icon: FiUser }
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <FiX /> : <FiMenu />}
      </button>
      <aside className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon-wrapper">
              <FiLayout className="logo-icon" />
            </div>
            <span className="logo-text">Prolista</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="user-info">
              <div className="user-name">{user?.name || "User"}</div>
              <div className="user-email">{user?.email || ""}</div>
            </div>
          </div>
        </div>
      </aside>
      {isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
