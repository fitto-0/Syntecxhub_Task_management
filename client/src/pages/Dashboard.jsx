import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Sidebar from "../components/Sidebar.jsx";
import {
  FiSearch,
  FiBell,
  FiPlus,
  FiMoreVertical,
  FiRefreshCw,
  FiBarChart2,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiZap,
  FiCheckCircle,
  FiFileText,
  FiAlertCircle,
  FiGift,
  FiActivity,
  FiChevronRight,
  FiX,
  FiSun,
  FiMoon
} from "react-icons/fi";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" }
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [taskMenuOpen, setTaskMenuOpen] = useState(null);
  const [widgetMenuOpen, setWidgetMenuOpen] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [monthGoals, setMonthGoals] = useState([
    { id: 1, text: "Read 2 books", completed: true },
    { id: 2, text: "Sports every day", completed: false },
    { id: 3, text: "Complete the course", completed: false },
    { id: 4, text: "Bend down with a parachute", completed: false }
  ]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "in-progress",
    dueDate: "",
    priority: "medium"
  });

  useEffect(() => {
    let mounted = true;
    api
      .get("/tasks")
      .then((res) => mounted && setTasks(res.data))
      .catch(() => mounted && setError("Unable to load tasks"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (taskMenuOpen && !e.target.closest('.task-card-menu-wrapper')) {
        setTaskMenuOpen(null);
      }
      if (widgetMenuOpen && !e.target.closest('.widget-menu-wrapper')) {
        setWidgetMenuOpen(null);
      }
      if (showNotifications && !e.target.closest('.notifications-panel') && !e.target.closest('.icon-btn-top')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [taskMenuOpen, widgetMenuOpen, showNotifications]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const completion = total ? Math.round((done / total) * 100) : 0;
    const projectsStopped = 2; // Mock data
    return { total, done, inProgress, pending, completion, projectsStopped };
  }, [tasks]);

  const inProgressTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "in-progress").slice(0, 3);
  }, [tasks]);


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/tasks", form);
      setTasks((prev) => [res.data, ...prev]);
      setForm({
        title: "",
        description: "",
        status: "in-progress",
        dueDate: "",
        priority: "medium"
      });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    api
      .get("/tasks")
      .then((res) => setTasks(res.data))
      .catch(() => setError("Unable to load tasks"))
      .finally(() => setLoading(false));
  };

  const handleDownloadReport = () => {
    const report = {
      totalTasks: stats.total,
      completed: stats.done,
      inProgress: stats.inProgress,
      pending: stats.pending,
      completionRate: stats.completion,
      date: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddGoal = () => {
    setShowGoalModal(true);
  };

  const handleSubmitGoal = (e) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      setMonthGoals(prev => [...prev, {
        id: Date.now(),
        text: newGoalText.trim(),
        completed: false
      }]);
      setNewGoalText("");
      setShowGoalModal(false);
    }
  };

  const handleDeleteGoal = (id) => {
    setMonthGoals(prev => prev.filter(g => g.id !== id));
  };

  const toggleGoal = (id) => {
    setMonthGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const getTaskIcon = (task) => {
    if (task.priority === "high") return <FiAlertCircle className="task-icon" />;
    if (task.status === "done") return <FiCheckCircle className="task-icon" />;
    if (task.status === "in-progress") return <FiZap className="task-icon" />;
    return <FiGift className="task-icon" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Today";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">Hi, {user?.name?.split(" ")[0] || "User"}!</h1>
          </div>
          <div className="top-bar-right">
            <button
              type="button"
              className="btn-create"
              onClick={() => setShowCreateForm(true)}
            >
              <FiPlus />
              Create
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
              aria-label="Toggle theme"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <FiMoon /> : <FiSun />}
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

        {/* Search Bar */}
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

        {/* Notifications Panel */}
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

        {/* Dashboard Content */}
        <div className="dashboard-content-glass">
          <div className="dashboard-grid">
            {/* Overall Information */}
            <div className="widget overall-info-widget">
              <div className="widget-header">
                <h2>Overall Information</h2>
                <div className="widget-menu-wrapper">
                  <button 
                    className="icon-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWidgetMenuOpen(widgetMenuOpen === 'overall' ? null : 'overall');
                    }}
                    aria-label="More options"
                  >
                    <FiMoreVertical />
                  </button>
                  {widgetMenuOpen === 'overall' && (
                    <div className="widget-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleRefresh();
                        }}
                      >
                        <FiRefreshCw /> Refresh
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleDownloadReport();
                        }}
                      >
                        <FiDownload /> Export Data
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          console.log("View details");
                        }}
                      >
                        <FiBarChart2 /> View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-body">
                <div className="overall-stats">
                  <div className="overall-stat-large">
                    <span className="stat-big-number">{stats.done}</span>
                    <span className="stat-big-label">Tasks done for all time</span>
                  </div>
                  <div className="overall-stat-large">
                    <span className="stat-big-number">{stats.projectsStopped}</span>
                    <span className="stat-big-label">projects are stopped</span>
                  </div>
                </div>
                <div className="overall-circles">
                  <div className="overall-circle">
                    <span className="circle-number">{stats.total}</span>
                    <span className="circle-label">Projects</span>
                  </div>
                  <div className="overall-circle">
                    <span className="circle-number">{stats.inProgress}</span>
                    <span className="circle-label">In Progress</span>
                  </div>
                  <div className="overall-circle">
                    <span className="circle-number">{stats.done}</span>
                    <span className="circle-label">Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="widget weekly-progress-widget">
              <div className="widget-header">
                <h2>Weekly progress</h2>
                <div className="widget-menu-wrapper">
                  <button 
                    className="icon-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWidgetMenuOpen(widgetMenuOpen === 'weekly' ? null : 'weekly');
                    }}
                    aria-label="More options"
                  >
                    <FiMoreVertical />
                  </button>
                  {widgetMenuOpen === 'weekly' && (
                    <div className="widget-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleRefresh();
                        }}
                      >
                        <FiRefreshCw /> Refresh
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          console.log("View chart");
                        }}
                      >
                        <FiBarChart2 /> View Full Chart
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleDownloadReport();
                        }}
                      >
                        <FiDownload /> Export
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-body">
                <div className="progress-legend">
                  <div className="legend-item">
                    <span className="legend-dot sport-dot"></span>
                    <span>Sport</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot study-dot"></span>
                    <span>Study</span>
                  </div>
                </div>
                <div className="progress-chart">
                  <div className="chart-line sport-line">
                    <div className="chart-point" style={{ left: "14%", top: "60%" }}></div>
                    <div className="chart-point" style={{ left: "28%", top: "50%" }}></div>
                    <div className="chart-point" style={{ left: "42%", top: "40%" }}></div>
                    <div className="chart-point" style={{ left: "56%", top: "35%" }}></div>
                    <div className="chart-point" style={{ left: "70%", top: "30%" }}></div>
                    <div className="chart-point highlight" style={{ left: "84%", top: "20%" }}>
                      <span className="chart-badge">+24%</span>
                    </div>
                    <div className="chart-point" style={{ left: "98%", top: "25%" }}></div>
                  </div>
                  <div className="chart-line study-line">
                    <div className="chart-point" style={{ left: "14%", top: "80%" }}></div>
                    <div className="chart-point" style={{ left: "28%", top: "75%" }}></div>
                    <div className="chart-point" style={{ left: "42%", top: "70%" }}></div>
                    <div className="chart-point" style={{ left: "56%", top: "65%" }}></div>
                    <div className="chart-point" style={{ left: "70%", top: "60%" }}></div>
                    <div className="chart-point" style={{ left: "84%", top: "55%" }}></div>
                    <div className="chart-point" style={{ left: "98%", top: "50%" }}></div>
                  </div>
                  <div className="chart-labels">
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                    <span>S</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Month Progress */}
            <div className="widget month-progress-widget">
              <div className="widget-header">
                <h2>Month progress</h2>
                <div className="widget-menu-wrapper">
                  <button 
                    className="icon-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWidgetMenuOpen(widgetMenuOpen === 'month' ? null : 'month');
                    }}
                    aria-label="More options"
                  >
                    <FiMoreVertical />
                  </button>
                  {widgetMenuOpen === 'month' && (
                    <div className="widget-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleDownloadReport();
                        }}
                      >
                        <FiDownload /> Download Report
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          console.log("View statistics");
                        }}
                      >
                        <FiBarChart2 /> View Statistics
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleRefresh();
                        }}
                      >
                        <FiRefreshCw /> Refresh
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-body">
                <div className="month-progress-subtitle">+20% compared to last month</div>
                <div className="month-progress-circle-large">
                  <div className="progress-ring">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="8"
                        strokeDasharray={`${120 * Math.PI * 0.8} ${120 * Math.PI}`}
                        strokeDashoffset="0"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                  </div>
                  <div className="progress-center">
                    <span className="progress-percent">120%</span>
                  </div>
                </div>
                <div className="month-progress-legend">
                  <div className="legend-item">
                    <span className="legend-dot sport-dot"></span>
                    <span>Sport</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot study-dot"></span>
                    <span>Study</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot project-dot"></span>
                    <span>Project</span>
                  </div>
                </div>
                <button 
                  className="btn-download"
                  onClick={handleDownloadReport}
                >
                  <FiDownload />
                  Download Report
                </button>
              </div>
            </div>

            {/* Month Goals */}
            <div className="widget month-goals-widget">
              <div className="widget-header">
                <h2>Month goals:</h2>
                <div className="widget-header-actions">
                  <button 
                    className="icon-btn-small"
                    onClick={() => setEditingGoal(!editingGoal)}
                    aria-label="Edit goals"
                    title={editingGoal ? "Done editing" : "Edit goals"}
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    className="icon-btn-small"
                    onClick={handleAddGoal}
                    aria-label="Add goal"
                    title="Add new goal"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
              <div className="widget-body">
                <div className="goals-list">
                  {monthGoals.map((goal) => (
                    <div key={goal.id} className="goal-item">
                      <label className="goal-label">
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={() => toggleGoal(goal.id)}
                          className="goal-checkbox"
                        />
                        <span className={goal.completed ? "goal-text completed" : "goal-text"}>
                          {editingGoal ? (
                            <input
                              type="text"
                              defaultValue={goal.text}
                              onBlur={(e) => {
                                if (e.target.value.trim()) {
                                  setMonthGoals(prev => prev.map(g => 
                                    g.id === goal.id ? { ...g, text: e.target.value.trim() } : g
                                  ));
                                }
                              }}
                              className="goal-edit-input"
                              autoFocus
                            />
                          ) : (
                            goal.text
                          )}
                        </span>
                      </label>
                      {editingGoal && (
                        <button
                          className="goal-delete-btn"
                          onClick={() => handleDeleteGoal(goal.id)}
                          aria-label="Delete goal"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks In Process */}
            <div className="widget tasks-process-widget">
              <div className="widget-header">
                <h2>Task In process ({inProgressTasks.length})</h2>
                <button
                  type="button"
                  className="archive-link"
                  onClick={() => {
                    const completedTasks = tasks.filter(t => t.status === "done");
                    console.log("Archive:", completedTasks);
                    alert(`You have ${completedTasks.length} completed tasks in archive`);
                  }}
                >
                  Open archive <FiChevronRight />
                </button>
              </div>
              <div className="widget-body">
                <div className="task-cards-grid">
                  {inProgressTasks.map((task) => (
                    <div key={task._id} className="task-card-process">
                      <div className="task-card-icon">{getTaskIcon(task)}</div>
                      <div className="task-card-content">
                        <div className="task-card-title">{task.title}</div>
                        <div className="task-card-date">{formatDate(task.dueDate)}</div>
                      </div>
                      <button 
                        className="task-card-bell" 
                        aria-label="Set notification"
                        onClick={() => {
                          alert(`Notification set for: ${task.title}`);
                        }}
                        title="Set notification"
                      >
                        <FiBell />
                      </button>
                      <div className="task-card-menu-wrapper">
                        <button 
                          className="task-card-menu" 
                          aria-label="More options"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskMenuOpen(taskMenuOpen === task._id ? null : task._id);
                          }}
                        >
                          <FiMoreVertical />
                        </button>
                        {taskMenuOpen === task._id && (
                          <div className="task-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => {
                              setTaskMenuOpen(null);
                              // Pin functionality
                              console.log("Pin task:", task.title);
                            }}>
                              Pin Note
                            </button>
                            <button onClick={() => {
                              setTaskMenuOpen(null);
                              // Edit functionality - you can add edit modal here
                              console.log("Edit task:", task.title);
                            }}>
                              Edit
                            </button>
                            <button onClick={() => {
                              setTaskMenuOpen(null);
                              handleDelete(task._id);
                            }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    className="add-task-card-process"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <FiPlus className="add-icon-large" />
                    <span>Add task</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Create Task Modal */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Task</h2>
                <button
                  className="icon-btn-small"
                  onClick={() => setShowCreateForm(false)}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleAdd}>
                <label>
                  Title
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="What do you want to accomplish?"
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Add context, links, or notes"
                  />
                </label>
                <div className="form-row">
                  <label>
                    Status
                    <select name="status" value={form.status} onChange={handleChange}>
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Priority
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                    >
                      {priorityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Due date
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </label>
                {error && <div className="error-message">{error}</div>}
                <div className="modal-actions">
                  <button type="submit" className="btn primary">
                    Create Task
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Goal Modal */}
        {showGoalModal && (
          <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
            <div className="modal-content goal-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Goal</h2>
                <button
                  className="icon-btn-small"
                  onClick={() => {
                    setShowGoalModal(false);
                    setNewGoalText("");
                  }}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleSubmitGoal}>
                <label>
                  Goal
                  <input
                    type="text"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    placeholder="What do you want to achieve this month?"
                    autoFocus
                    required
                  />
                </label>
                <div className="modal-actions">
                  <button type="submit" className="btn primary">
                    <FiPlus />
                    Add Goal
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      setShowGoalModal(false);
                      setNewGoalText("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
