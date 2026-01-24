import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api.js";
import { FiBarChart2, FiTrendingUp, FiTrendingDown, FiDownload, FiCalendar, FiClock, FiCheckCircle, FiActivity, FiMenu, FiX } from "react-icons/fi";

export default function Statistics() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    mediumPriority: tasks.filter((t) => t.priority === "medium").length,
    lowPriority: tasks.filter((t) => t.priority === "low").length,
    averagePerDay: tasks.length > 0 ? (tasks.filter((t) => t.status === "done").length / 30).toFixed(1) : 0,
    overdueTasks: tasks.filter((t) => {
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date() && t.status !== "done";
    }).length,
    tasksThisWeek: tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return taskDate <= weekFromNow;
    }).length,
    tasksThisMonth: tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      const currentMonth = new Date().getMonth();
      const taskMonth = taskDate.getMonth();
      return currentMonth === taskMonth;
    }).length
  };

  const downloadPDF = () => {
    const pdfContent = `
TASK MANAGEMENT STATISTICS REPORT
Generated: ${new Date().toLocaleDateString()}

OVERVIEW
==========================================
Total Tasks: ${stats.total}
Completed Tasks: ${stats.done}
In Progress: ${stats.inProgress}
Pending Tasks: ${stats.pending}
Completion Rate: ${stats.completionRate}%

TASK BREAKDOWN BY STATUS
==========================================
Completed: ${stats.done} (${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%)
In Progress: ${stats.inProgress} (${stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0}%)
Pending: ${stats.pending} (${stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%)

TASK BREAKDOWN BY PRIORITY
==========================================
High Priority: ${stats.highPriority}
Medium Priority: ${stats.mediumPriority}
Low Priority: ${stats.lowPriority}

TIME-BASED ANALYTICS
==========================================
Average Tasks per Day: ${stats.averagePerDay}
Overdue Tasks: ${stats.overdueTasks}
Tasks Due This Week: ${stats.tasksThisWeek}
Tasks Due This Month: ${stats.tasksThisMonth}

RECOMMENDATIONS
==========================================
${stats.completionRate < 50 ? '• Consider reviewing task priorities and deadlines' : '• Great job maintaining high completion rate!'}
${stats.overdueTasks > 0 ? `• ${stats.overdueTasks} overdue tasks need immediate attention` : '• No overdue tasks - excellent time management!'}
${stats.highPriority > stats.total * 0.3 ? '• High number of high-priority tasks - consider delegating' : '• Priority distribution looks balanced'}
    `.trim();

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-statistics-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-layout">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <Sidebar className={mobileMenuOpen ? 'mobile-open' : ''} />
      
      <div className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">Statistics</h1>
          </div>
          <div className="top-bar-right">
            <button className="small" onClick={downloadPDF}>
              <FiDownload /> Download Report
            </button>
          </div>
        </header>

        <div className="dashboard-content-glass">
          {loading ? (
            <div className="loading-state">Loading statistics...</div>
          ) : (
            <div className="stats-container">
              {/* Main Stats Grid */}
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
                    <FiActivity />
                  </div>
                  <div className="stat-content">
                    <h3>Completion Rate</h3>
                    <p className="stat-value-large">{stats.completionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="analytics-section">
                <h2>Task Analytics</h2>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-icon">
                      <FiCheckCircle />
                    </div>
                    <div className="analytics-content">
                      <h4>Completion Rate</h4>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${stats.completionRate}%` }}
                        ></div>
                      </div>
                      <span>{stats.completionRate}%</span>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="analytics-icon">
                      <FiClock />
                    </div>
                    <div className="analytics-content">
                      <h4>Overdue Tasks</h4>
                      <p className="analytics-value">{stats.overdueTasks}</p>
                      <span className="analytics-label">Need attention</span>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <div className="analytics-icon">
                      <FiCalendar />
                    </div>
                    <div className="analytics-content">
                      <h4>This Week</h4>
                      <p className="analytics-value">{stats.tasksThisWeek}</p>
                      <span className="analytics-label">Tasks due</span>
                    </div>
                  </div>

                  <div className="priority-breakdown">
                    <h4>Priority Distribution</h4>
                    <div className="priority-bars">
                      <div className="priority-item">
                        <span>High</span>
                        <div className="priority-bar">
                          <div 
                            className="priority-fill high" 
                            style={{ width: `${stats.total ? (stats.highPriority / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span>{stats.highPriority}</span>
                      </div>
                      <div className="priority-item">
                        <span>Medium</span>
                        <div className="priority-bar">
                          <div 
                            className="priority-fill medium" 
                            style={{ width: `${stats.total ? (stats.mediumPriority / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span>{stats.mediumPriority}</span>
                      </div>
                      <div className="priority-item">
                        <span>Low</span>
                        <div className="priority-bar">
                          <div 
                            className="priority-fill low" 
                            style={{ width: `${stats.total ? (stats.lowPriority / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span>{stats.lowPriority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
