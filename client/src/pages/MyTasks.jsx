import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api.js";
import { FiCheckSquare, FiFilter, FiEye, FiDownload, FiCalendar, FiClock, FiAlertCircle, FiUser, FiEdit2, FiSave, FiX } from "react-icons/fi";

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: ''
  });

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

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'medium',
      dueDate: task.dueDate || ''
    });
  };

  const handleSaveTask = async () => {
    try {
      const response = await api.put(`/tasks/${editingTask._id}`, editForm);
      setTasks(tasks.map(task => 
        task._id === editingTask._id ? response.data : task
      ));
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const exportToPDF = () => {
    const pdfContent = `
TASK MANAGEMENT REPORT
Generated: ${new Date().toLocaleDateString()}
User: ${user?.name || 'Unknown'}

TASK SUMMARY
==========================================
Total Tasks: ${tasks.length}
Pending: ${tasks.filter(t => t.status === 'pending').length}
In Progress: ${tasks.filter(t => t.status === 'in-progress').length}
Completed: ${tasks.filter(t => t.status === 'done').length}

TASK DETAILS
==========================================
${filteredTasks.map(task => `
Task: ${task.title}
Status: ${task.status}
Priority: ${task.priority || 'N/A'}
Description: ${task.description || 'No description'}
Created: ${task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
${task.status === 'done' ? 'Completed: Yes' : 'Completed: No'}
---`).join('\n')}

NOTES
==========================================
This report contains ${filteredTasks.length} task(s).
Filter Applied: ${filter}
Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">My Tasks</h1>
          </div>
          <div className="top-bar-right">
            <button 
              className="small" 
              onClick={exportToPDF}
              title="Export tasks to PDF"
            >
              <FiDownload /> Export Data
            </button>
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
            <div className="tasks-container">
              <div className="tasks-grid-view">
                {filteredTasks.map((task) => (
                  <div key={task._id} className="task-card-view">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <button
                        className="task-view-btn"
                        onClick={() => handleViewDetails(task)}
                        title="View task details"
                      >
                        <FiEye />
                      </button>
                    </div>
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
                    <div className="task-actions-view">
                      <button
                        className="task-action-btn"
                        onClick={() => handleViewDetails(task)}
                      >
                        View Details
                      </button>
                      <button
                        className="task-action-btn edit-btn"
                        onClick={() => handleEditTask(task)}
                      >
                        <FiEdit2 /> Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {showDetails && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Task Details</h3>
              <button
                className="ghost small"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="task-detail-section">
                <h4>Task Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Title:</label>
                    <p>{selectedTask.title}</p>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge status-${selectedTask.status}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Priority:</label>
                    <span className={`priority-badge priority-${selectedTask.priority}`}>
                      {selectedTask.priority || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Description:</label>
                    <p>{selectedTask.description || 'No description provided'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <p>{selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Due Date:</label>
                    <p>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Assigned to:</label>
                    <p><FiUser /> {user?.name || 'Current User'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="ghost small"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button
                className="ghost small"
                onClick={() => setEditingTask(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Task Title
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Description
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </label>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Status
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    Priority
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>
                  Due Date
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                  />
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="primary small"
                onClick={handleSaveTask}
              >
                <FiSave /> Save Changes
              </button>
              <button
                className="ghost small"
                onClick={() => setEditingTask(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
