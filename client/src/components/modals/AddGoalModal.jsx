import React from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

export default function AddGoalModal({
  showGoalModal,
  setShowGoalModal,
  newGoalText,
  setNewGoalText,
  handleSubmitGoal
}) {
  if (!showGoalModal) return null;
  
  return (
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
  );
}
