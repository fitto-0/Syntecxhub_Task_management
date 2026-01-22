import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Sidebar from "../components/Sidebar.jsx";
import {
  FiSearch,
  FiSun,
  FiMoon,
  FiRefreshCw,
  FiBarChart2,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiPlus,
  FiX,
  FiCalendar,
  FiZap,
  FiCheckCircle,
  FiFileText,
  FiAlertCircle
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
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: ""
  });
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
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

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const completion = total ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, pending, completion };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => (filter === "all" ? true : t.status === filter))
      .filter((t) => (showOnlyFavorites ? t.isFavorite : true))
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority || "medium"] - priorityOrder[b.priority || "medium"];
      });
  }, [tasks, filter, showOnlyFavorites, search]);

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
        status: "pending",
        dueDate: "",
        priority: "medium"
      });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await api.put(`/tasks/${id}`, updates);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
      setTimeout(() => setError(""), 2500);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
      setTimeout(() => setError(""), 2500);
    }
  };

  const toggleFavorite = (task) => {
    handleUpdate(task._id, { isFavorite: !task.isFavorite });
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority || "medium",
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    await handleUpdate(id, editForm);
    setEditingId(null);
  };

  const getTaskIcon = (task) => {
    if (task.priority === "high") return <FiAlertCircle className="task-icon" />;
    if (task.status === "done") return <FiCheckCircle className="task-icon" />;
    if (task.status === "in-progress") return <FiZap className="task-icon" />;
    return <FiFileText className="task-icon" />;
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h1 className="greeting">Hi, {user?.name?.split(" ")[0] || "User"}!</h1>
          </div>
          <div className="header-right">
            <button
              type="button"
              className="icon-btn search-btn"
              onClick={() => document.querySelector(".search-input")?.focus()}
              aria-label="Search"
            >
              <FiSearch />
            </button>
            <button
              type="button"
              className="icon-btn theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>
            <Link to="/profile" className="profile-btn">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="header-avatar" />
              ) : (
                <div className="header-avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </Link>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Overall Information Widget */}
          <div className="widget overall-info">
            <div className="widget-header">
              <h2>Overall Information</h2>
              <div className="widget-actions">
                <button className="icon-btn-small">
                  <FiMoreVertical />
                </button>
              </div>
            </div>
            <div className="widget-body">
              <div className="info-stats">
                <div className="info-stat">
                  <span className="stat-number">{stats.done}</span>
                  <span className="stat-label">Tasks done</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">{stats.inProgress}</span>
                  <span className="stat-label">In Progress</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">{stats.pending}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress Widget */}
          <div className="widget weekly-progress">
            <div className="widget-header">
              <h2>Weekly Progress</h2>
              <button className="icon-btn-small">
                <FiRefreshCw />
              </button>
            </div>
            <div className="widget-body">
              <div className="progress-visual">
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${stats.completion}%` }}
                  />
                </div>
                <div className="progress-text">
                  <span>{stats.completion}% completed this week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Month Progress Widget */}
          <div className="widget month-progress">
            <div className="widget-header">
              <h2>Month Progress</h2>
              <button className="icon-btn-small">
                <FiBarChart2 />
              </button>
            </div>
            <div className="widget-body">
              <div className="month-stats">
                <div className="month-stat-circle">
                  <span className="circle-value">{stats.completion}%</span>
                </div>
                <div className="month-legend">
                  <div className="legend-item">
                    <span className="legend-dot done-dot"></span>
                    <span>Done</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot progress-dot"></span>
                    <span>In Progress</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot pending-dot"></span>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks In Process */}
          <div className="widget tasks-in-process">
            <div className="widget-header">
              <h2>Tasks In Process ({inProgressTasks.length})</h2>
            </div>
            <div className="widget-body">
              <div className="task-cards-list">
                {inProgressTasks.map((task) => (
                  <div key={task._id} className="task-card">
                    <div className="task-card-icon">{getTaskIcon(task)}</div>
                    <div className="task-card-content">
                      <div className="task-card-title">{task.title}</div>
                      <div className="task-card-date">
                        <FiCalendar className="date-icon" />
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No due date"}
                      </div>
                    </div>
                    <div className="task-card-actions">
                      <button
                        className="icon-btn-small"
                        onClick={() => startEdit(task)}
                        aria-label="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="icon-btn-small"
                        onClick={() => handleDelete(task._id)}
                        aria-label="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className="add-task-card"
                  onClick={() => setShowCreateForm(true)}
                >
                  <FiPlus className="add-icon" />
                  <span>Add task</span>
                </button>
              </div>
            </div>
          </div>

          {/* All Tasks Section */}
          <div className="widget all-tasks">
            <div className="widget-header">
              <h2>All Tasks</h2>
              <div className="toolbar">
                <div className="search-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    className="search-input"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={`favorite-toggle ${showOnlyFavorites ? "active" : ""}`}
                  onClick={() => setShowOnlyFavorites((v) => !v)}
                  aria-label="Toggle favorites"
                >
                  <FiStar />
                </button>
              </div>
            </div>
            <div className="widget-body">
              {loading ? (
                <div className="loading-state">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <FiFileText className="empty-icon" />
                  <p>No tasks found</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {filteredTasks.map((task, index) => (
                    <div
                      key={task._id}
                      className={`task-item task-${task.status}`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <button
                        type="button"
                        className={`star-btn ${task.isFavorite ? "starred" : ""}`}
                        onClick={() => toggleFavorite(task)}
                        aria-label={task.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <FiStar />
                      </button>
                      <div className="task-content">
                        {editingId === task._id ? (
                          <div className="edit-panel">
                            <input
                              name="title"
                              value={editForm.title}
                              onChange={handleEditChange}
                              className="edit-input"
                            />
                            <textarea
                              name="description"
                              value={editForm.description}
                              onChange={handleEditChange}
                              rows={2}
                              className="edit-textarea"
                            />
                            <div className="edit-controls">
                              <select
                                name="status"
                                value={editForm.status}
                                onChange={handleEditChange}
                                className="edit-select"
                              >
                                {statusOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <select
                                name="priority"
                                value={editForm.priority}
                                onChange={handleEditChange}
                                className="edit-select"
                              >
                                {priorityOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="date"
                                name="dueDate"
                                value={editForm.dueDate}
                                onChange={handleEditChange}
                                className="edit-date"
                              />
                            </div>
                            <div className="edit-actions">
                              <button
                                type="button"
                                className="btn-small primary"
                                onClick={() => saveEdit(task._id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn-small ghost"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="task-header">
                              <span className="task-title">{task.title}</span>
                              <span className={`priority-badge priority-${task.priority}`}>
                                {task.priority}
                              </span>
                            </div>
                            {task.description && (
                              <div className="task-description">{task.description}</div>
                            )}
                            <div className="task-meta">
                              <select
                                value={task.status}
                                onChange={(e) =>
                                  handleUpdate(task._id, { status: e.target.value })
                                }
                                className="status-select"
                              >
                                {statusOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {task.dueDate && (
                                <span className="date-chip">
                                  <FiCalendar className="chip-icon" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="task-actions">
                        {editingId !== task._id && (
                          <button
                            className="action-btn"
                            onClick={() => startEdit(task)}
                            aria-label="Edit"
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        <button
                          className="action-btn"
                          onClick={() => handleDelete(task._id)}
                          aria-label="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
      </div>
    </div>
  );
}
