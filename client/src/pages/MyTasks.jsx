import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api.js";
import { 
  FiCheckSquare, FiFilter, FiEye, FiDownload, FiCalendar, 
  FiClock, FiAlertCircle, FiUser, FiEdit2, FiSave, FiX, 
  FiSearch, FiTrash2, FiChevronRight 
} from "react-icons/fi";

const formatDate = (dateString) => {
  if (!dateString) return "No Date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
};

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesFilter = filter === "all" ? true : t.status === filter;
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

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
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
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

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks(prev => prev.filter(t => t._id !== id));
      } catch (err) {
        console.error("Failed to delete task", err);
      }
    }
  };

  const exportToTxt = () => {
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
Project: ${task.title}
Status: ${task.status.toUpperCase()}
Priority: ${task.priority ? task.priority.toUpperCase() : 'MEDIUM'}
Created: ${task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
---`).join('\n')}
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
            <button className="btn-create" onClick={exportToTxt}>
              <FiDownload /> <span>Export Data</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content-glass">
          <div className="tasks-page-header">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All <span>{tasks.length}</span>
              </button>
              <button 
                className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending <span>{tasks.filter(t => t.status === 'pending').length}</span>
              </button>
              <button 
                className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
                onClick={() => setFilter('in-progress')}
              >
                Active <span>{tasks.filter(t => t.status === 'in-progress').length}</span>
              </button>
              <button 
                className={`filter-tab ${filter === 'done' ? 'active' : ''}`}
                onClick={() => setFilter('done')}
              >
                Done <span>{tasks.filter(t => t.status === 'done').length}</span>
              </button>
            </div>

            <div className="tasks-controls">
              <div className="search-wrapper">
                <FiSearch className="search-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search tasks by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinning"><FiFilter /></div>
              <p>Syncing tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-page-state fade-in">
              <FiCheckSquare className="empty-page-icon" />
              <h2>No tasks found</h2>
              <p>We couldn't find any tasks matching your criteria. Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="tasks-grid-full">
              {filteredTasks.map((task) => (
                <div key={task._id} className="task-card-full fade-in-delayed">
                  <div className="card-glow"></div>
                  <div className="task-card-top">
                    <span className="task-type-badge">{task.status.replace('-', ' ')}</span>
                    <div className="task-card-actions">
                      <button className="action-icon-btn" onClick={() => handleEditTask(task)} title="Edit Task">
                        <FiEdit2 />
                      </button>
                      <button className="action-icon-btn delete" onClick={() => handleDeleteTask(task._id)} title="Delete Task">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className="task-card-main">
                    <h3 className="task-card-title">{task.title}</h3>
                    {task.description && <p className="task-card-desc">{task.description}</p>}
                  </div>

                  <div className="task-card-details">
                    <div className="task-detail-item">
                      <FiCalendar /> {formatDate(task.dueDate)}
                    </div>
                    <div className="task-detail-item">
                      <FiClock /> {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <div className="task-card-footer">
                    <div className="task-pills">
                      <span className={`p-pill ${task.priority || 'medium'}`}>
                        {task.priority || 'medium'}
                      </span>
                    </div>
                    <button className="action-icon-btn" onClick={() => handleViewDetails(task)}>
                      <FiEye />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedTask && (
        <div className="modal-overlay fade-in" onClick={() => setShowDetails(false)}>
          <div className="modal-content lift-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Task Intelligence</h3>
              <button className="close-btn" onClick={() => setShowDetails(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-box">
                <div className="detail-row">
                  <span className="detail-label">Title</span>
                  <span className="detail-val">{selectedTask.title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge status-${selectedTask.status}`}>{selectedTask.status}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Priority</span>
                  <span className={`priority-badge priority-${selectedTask.priority}`}>{selectedTask.priority || 'Medium'}</span>
                </div>
              </div>
              <div className="detail-box">
                <div className="detail-label" style={{ marginBottom: '8px' }}>Description</div>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {selectedTask.description || 'No description provided for this task.'}
                </p>
              </div>
              <div className="detail-box">
                <div className="detail-row">
                  <span className="detail-label">Created At</span>
                  <span className="detail-val">{new Date(selectedTask.createdAt).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Final Deadline</span>
                  <span className="detail-val">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Reuse Dashboard Style) */}
      {editingTask && (
        <div className="modal-overlay fade-in" onClick={() => setEditingTask(null)}>
          <div className="modal-content lift-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Core Data</h3>
              <button className="close-btn" onClick={() => setEditingTask(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  className="modal-input"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="modal-textarea"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="modal-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    className="modal-select"
                    value={editForm.priority}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Target Date</label>
                <input 
                  type="date" 
                  className="modal-input"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-save" onClick={handleSaveTask}>
                <FiSave /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
