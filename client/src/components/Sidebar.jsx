import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { 
  FiLayout, 
  FiCalendar,
  FiCheckSquare,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState, useEffect } from "react";

const mainNavItems = [
  { path: "/", label: "Dashboard", icon: FiLayout },
  { path: "/calendar", label: "Calendar", icon: FiCalendar },
  { path: "/tasks", label: "My Tasks", icon: FiCheckSquare },
  { path: "/statistics", label: "Statistics", icon: FiBarChart2 },
  { path: "/documents", label: "Documents", icon: FiFileText }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileOpen(false);
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileOpen && !e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileOpen]);

  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay show" onClick={() => setIsMobileOpen(false)} />}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
        type="button"
      >
        {isMobileOpen ? <FiX /> : <FiMenu />}
      </button>
      <aside className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <div className="logo-icon-wrapper" />
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
                >
                  <Icon className="nav-icon" aria-hidden="true" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="nav-item nav-item-settings">
            <FiSettings className="nav-icon" aria-hidden="true" />
            <span className="nav-label">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="nav-item nav-item-logout"
            type="button"
          >
            <FiLogOut className="nav-icon" aria-hidden="true" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
