import React from 'react';
import { FiChevronRight, FiBell, FiMoreVertical, FiPlus, FiAlertCircle, FiCheckCircle, FiZap, FiGift } from 'react-icons/fi';

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

export default function TasksInProgressWidget({
  tasks,
  inProgressTasks,
  taskMenuOpen,
  setTaskMenuOpen,
  setShowCreateForm,
  handleDelete,
  handleEditTask,
  handlePinTask
}) {
  return (
    <div className={`widget tasks-process-widget ${inProgressTasks.some(t => t._id === taskMenuOpen) ? 'widget-active-menu' : ''}`}>
      <div className="widget-header">
        <h2>Task In process ({inProgressTasks.length})</h2>
        <button
          type="button"
          className="btn-create"
          onClick={() => {
            const completedTasks = tasks.filter(t => t.status === "done");
            console.log("Archive:", completedTasks);
            alert(`You have ${completedTasks.length} completed tasks in archive`);
          }}
        >
          View Archive <FiChevronRight />
        </button>
      </div>
      <div className="widget-body">
        <div className="task-cards-grid">
          {inProgressTasks.map((task) => (
            <div key={task._id} className={`task-card-process ${taskMenuOpen === task._id ? 'card-active-menu' : ''}`}>
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
                      if (handlePinTask) handlePinTask(task);
                      else console.log("Pin task:", task.title);
                    }}>
                      Pin Note
                    </button>
                    <button onClick={() => {
                      setTaskMenuOpen(null);
                      if (handleEditTask) handleEditTask(task, false);
                      else console.log("Edit task:", task.title);
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
  );
}
