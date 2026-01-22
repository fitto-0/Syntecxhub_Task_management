import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api.js";
import { FiCheckSquare, FiFilter } from "react-icons/fi";

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api
      .get("/tasks")
      .then((res) => setTasks(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = tasks.filter((t) => 
    filter === "all" ? true : t.status === filter
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">My Tasks</h1>
          </div>
          <div className="top-bar-right">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select-top"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </header>

        <div className="dashboard-content-glass">
          {loading ? (
            <div className="loading-state">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-page-state">
              <FiCheckSquare className="empty-page-icon" />
              <h2>No tasks found</h2>
              <p>Create your first task to get started!</p>
            </div>
          ) : (
            <div className="tasks-grid-view">
              {filteredTasks.map((task) => (
                <div key={task._id} className="task-card-view">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <div className="task-meta-view">
                    <span className={`status-badge status-${task.status}`}>
                      {task.status}
                    </span>
                    {task.priority && (
                      <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
