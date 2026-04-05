import React from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function MonthGoalsWidget({
  monthGoals,
  editingGoal,
  setEditingGoal,
  handleAddGoal,
  toggleGoal,
  updateGoalText,
  handleDeleteGoal
}) {
  return (
    <div className="widget month-goals-widget">
      <div className="widget-header">
        <h2>Month goals:</h2>
        <div className="widget-header-actions">
          <button 
            className="icon-btn-small"
            onClick={() => setEditingGoal(!editingGoal)}
            aria-label="Edit goals"
            title={editingGoal ? "Done editing" : "Edit goals"}
          >
            <FiEdit2 />
          </button>
          <button 
            className="icon-btn-small"
            onClick={handleAddGoal}
            aria-label="Add goal"
            title="Add new goal"
          >
            <FiPlus />
          </button>
        </div>
      </div>
      <div className="widget-body">
        <div className="goals-list">
          {monthGoals.map((goal) => (
            <div key={goal._id} className="goal-item">
              <label className="goal-label">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoal(goal._id)}
                  className="goal-checkbox"
                />
                <span className={goal.completed ? "goal-text completed" : "goal-text"}>
                  {editingGoal ? (
                    <input
                      type="text"
                      defaultValue={goal.title}
                      onBlur={(e) => {
                        if (e.target.value.trim() && e.target.value !== goal.title) {
                          updateGoalText(goal._id, e.target.value.trim());
                        }
                      }}
                      className="goal-edit-input"
                      autoFocus
                    />
                  ) : (
                    goal.title
                  )}
                </span>
              </label>
              {editingGoal && (
                <button
                  className="goal-delete-btn"
                  onClick={() => handleDeleteGoal(goal._id)}
                  aria-label="Delete goal"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
