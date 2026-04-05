import React from 'react';
import { FiX, FiCheckSquare, FiFileText } from 'react-icons/fi';

export default function TaskTypeModal({
  showTaskTypeModal,
  setShowTaskTypeModal,
  handleTaskTypeSelect
}) {
  if (!showTaskTypeModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowTaskTypeModal(false)}>
      <div className="modal-content task-type-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>What would you like to create?</h2>
          <button
            className="icon-btn-small"
            onClick={() => setShowTaskTypeModal(false)}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="task-type-options">
            <button
              className="task-type-option"
              onClick={() => handleTaskTypeSelect('task')}
            >
              <div className="task-type-icon">
                <FiCheckSquare />
              </div>
              <div className="task-type-content">
                <h3>Task</h3>
                <p>Create a single task with specific details and deadlines</p>
              </div>
            </button>
            <button
              className="task-type-option"
              onClick={() => handleTaskTypeSelect('project')}
            >
              <div className="task-type-icon project">
                <FiFileText />
              </div>
              <div className="task-type-content">
                <h3>Project</h3>
                <p>Create a larger project with multiple phases and high priority</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
