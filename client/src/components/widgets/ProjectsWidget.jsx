import React from 'react';
import { FiChevronRight, FiBell, FiMoreVertical, FiPlus, FiAlertCircle, FiCheckCircle, FiZap, FiGift, FiFileText, FiCalendar } from 'react-icons/fi';

const getProjectIcon = (project) => {
  switch (project.status) {
    case "in-progress":
      return <FiZap className="project-status-icon" />;
    case "done":
      return <FiCheckCircle className="project-status-icon" />;
    case "stopped":
      return <FiAlertCircle className="project-status-icon" />;
    case "pending":
      return <FiGift className="project-status-icon" />;
    default:
      return <FiFileText className="project-status-icon" />;
  }
};

const getProjectStatusColor = (status) => {
  switch (status) {
    case "in-progress":
      return "#3b82f6";
    case "done":
      return "#10b981";
    case "stopped":
      return "#ef4444";
    case "pending":
      return "#f59e0b";
    default:
      return "#6b7280";
  }
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

export default function ProjectsWidget({
  projects,
  allProjects,
  taskMenuOpen,
  setTaskMenuOpen,
  handleStopProject,
  handleDelete,
  handleEditTask,
  handlePinTask,
  setForm,
  setShowCreateForm
}) {
  return (
    <div className={`widget projects-widget ${allProjects.some(p => p._id === taskMenuOpen) ? 'widget-active-menu' : ''}`}>
      <div className="widget-header">
        <h2>My Projects ({allProjects.length})</h2>
        <button
          type="button"
          className="btn-create"
          onClick={() => {
            const completedProjects = projects.filter(p => p.status === "done");
            console.log("Completed Projects:", completedProjects);
            alert(`You have ${completedProjects.length} completed projects`);
          }}
        >
          View Completed <FiChevronRight />
        </button>
      </div>
      <div className="widget-body">
        <div className="project-cards-grid">
          {allProjects.map((project) => (
            <div key={project._id} className={`project-card ${taskMenuOpen === project._id ? 'card-active-menu' : ''}`}>
              <div className="project-card-header">
                <div className="project-card-icon" style={{ color: getProjectStatusColor(project.status) }}>
                  {getProjectIcon(project)}
                </div>
                <div className="project-card-status" style={{ backgroundColor: getProjectStatusColor(project.status) + '20', color: getProjectStatusColor(project.status) }}>
                  {project.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>
              <div className="project-card-content">
                <div className="project-card-title">{project.title}</div>
                <div className="project-card-description">{project.description}</div>
                <div className="project-card-meta">
                  <div className="project-card-priority">
                    <span className={`priority-badge priority-${project.priority}`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="project-card-date">
                    <FiCalendar />
                    {formatDate(project.dueDate)}
                  </div>
                </div>
              </div>
              <div className="project-card-actions">
                <button 
                  className="project-card-bell" 
                  aria-label="Set notification"
                  onClick={() => {
                    alert(`Notification set for: ${project.title}`);
                  }}
                  title="Set notification"
                >
                  <FiBell />
                </button>
                {project.status === 'in-progress' && (
                  <button 
                    className="project-card-stop" 
                    aria-label="Stop project"
                    onClick={() => handleStopProject(project._id)}
                    title="Stop project"
                  >
                    <FiAlertCircle />
                  </button>
                )}
                <div className="project-card-menu-wrapper">
                  <button 
                    className="project-card-menu" 
                    aria-label="More options"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskMenuOpen(taskMenuOpen === project._id ? null : project._id);
                    }}
                  >
                    <FiMoreVertical />
                  </button>
                  {taskMenuOpen === project._id && (
                    <div className="task-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => {
                        setTaskMenuOpen(null);
                        if (handlePinTask) handlePinTask(project);
                        else console.log("Pin project:", project.title);
                      }}>
                        Pin Project
                      </button>
                      <button onClick={() => {
                        setTaskMenuOpen(null);
                        if (handleEditTask) handleEditTask(project, true);
                        else console.log("Edit project:", project.title);
                      }}>
                        Edit
                      </button>
                      <button onClick={() => {
                        setTaskMenuOpen(null);
                        handleDelete(project._id, true);
                      }}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            className="add-project-card"
            onClick={() => {
              setForm({
                title: '',
                description: '',
                status: 'in-progress',
                dueDate: '',
                priority: 'high',
                isProject: true
              });
              setShowCreateForm(true);
            }}
          >
            <FiPlus className="add-icon-large" />
            <span>Add Project</span>
          </button>
        </div>
      </div>
    </div>
  );
}
