import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api.js";
import { FiBarChart2, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function Statistics() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/tasks")
      .then((res) => setTasks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    completionRate: tasks.length ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100) : 0,
    highPriority: tasks.filter((t) => t.priority === "high").length,
    averagePerDay: tasks.length > 0 ? (tasks.filter((t) => t.status === "done").length / 30).toFixed(1) : 0
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">Statistics</h1>
          </div>
        </header>

        <div className="dashboard-content-glass">
          {loading ? (
            <div className="loading-state">Loading statistics...</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card-large">
                <div className="stat-icon-wrapper">
                  <FiBarChart2 />
                </div>
                <div className="stat-content">
                  <h3>Total Tasks</h3>
                  <p className="stat-value-large">{stats.total}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon-wrapper success">
                  <FiTrendingUp />
                </div>
                <div className="stat-content">
                  <h3>Completed</h3>
                  <p className="stat-value-large">{stats.done}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon-wrapper warning">
                  <FiTrendingDown />
                </div>
                <div className="stat-content">
                  <h3>In Progress</h3>
                  <p className="stat-value-large">{stats.inProgress}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon-wrapper info">
                  <FiBarChart2 />
                </div>
                <div className="stat-content">
                  <h3>Completion Rate</h3>
                  <p className="stat-value-large">{stats.completionRate}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
