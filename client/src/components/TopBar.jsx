import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiBell, FiPlus, FiBarChart2, FiDownload, FiX } from 'react-icons/fi';

export default function TopBar({
  user,
  handleAddTaskClick,
  handleViewFullChart,
  handleDownloadReport
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showNotifications && !e.target.closest('.notifications-panel') && !e.target.closest('.icon-btn-top')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-left">
          <h1 className="top-greeting">Hi, {user?.name?.split(" ")[0] || "User"}!</h1>
        </div>
        <div className="top-bar-right">
          <button
            type="button"
            className="btn-create"
            onClick={handleAddTaskClick}
          >
            <FiPlus />
            Create
          </button>
          <button 
            type="button" 
            className="icon-btn-top export-btn" 
            aria-label="View Full Chart"
            onClick={handleViewFullChart}
            title="View Full Analytics Chart"
          >
            <FiBarChart2 />
          </button>
          <button 
            type="button" 
            className="icon-btn-top export-btn" 
            aria-label="Export Data"
            onClick={handleDownloadReport}
            title="Export Task Report"
          >
            <FiDownload />
          </button>
          <button 
            type="button" 
            className="icon-btn-top" 
            aria-label="Search"
            onClick={() => {
              setShowSearch(!showSearch);
              if (!showSearch) {
                setTimeout(() => {
                  const searchInput = document.querySelector(".search-input");
                  if (searchInput) searchInput.focus();
                }, 100);
              }
            }}
          >
            <FiSearch />
          </button>
          <button 
            type="button" 
            className="icon-btn-top" 
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell />
            {showNotifications && <span className="notification-badge"></span>}
          </button>
          <Link to="/profile" className="profile-btn-top">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="top-avatar" />
            ) : (
              <div className="top-avatar-placeholder">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </Link>
        </div>
      </header>

      {showSearch && (
        <div className="search-bar-overlay">
          <div className="search-bar">
            <FiSearch className="search-bar-icon" />
            <input
              type="text"
              className="search-input-full"
              placeholder="Search tasks, projects..."
              autoFocus
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            />
            <button
              type="button"
              className="search-close"
              onClick={() => setShowSearch(false)}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button onClick={() => setShowNotifications(false)}>
              <FiX />
            </button>
          </div>
          <div className="notifications-content">
            <p className="no-notifications">No new notifications</p>
          </div>
        </div>
      )}
    </>
  );
}
