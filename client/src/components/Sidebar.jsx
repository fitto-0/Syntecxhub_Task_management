import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  FiLayout, 
  FiCalendar,
  FiCheckSquare,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiMenu,
  FiX,
  FiPlus
} from "react-icons/fi";
import { useState } from "react";

const mainNavItems = [
  { path: "/", label: "Dashboard", icon: FiLayout },
  { path: "/calendar", label: "Calendar", icon: FiCalendar },
  { path: "/tasks", label: "My Tasks", icon: FiCheckSquare },
  { path: "/statistics", label: "Statistics", icon: FiBarChart2 },
  { path: "/documents", label: "Documents", icon: FiFileText }
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
          <Link to="/" className="logo" onClick={() => setIsMobileOpen(false)}>
            <div className="logo-icon-wrapper">
              
            </div>
            <span className="logo-text">Prolista</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link
            to="/profile"
            className="nav-item nav-item-settings"
            onClick={() => setIsMobileOpen(false)}
          >
            <FiSettings className="nav-icon" />
            <span className="nav-label">Settings</span>
          </Link>
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
