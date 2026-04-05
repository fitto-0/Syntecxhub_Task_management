import React from 'react';
import { FiX, FiPlus, FiSave } from 'react-icons/fi';

export default function CreateTaskModal({
  showCreateForm,
  setShowCreateForm,
  form,
  setForm,
  handleAdd,
  error
}) {
  if (!showCreateForm) return null;
  
  const isEdit = !!form._id;

  return (
    <div className="modal-overlay fade-in" onClick={() => setShowCreateForm(false)}>
      <div className="modal-content lift-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Update' : 'Create New'} {form.isProject ? 'Project' : 'Task'}</h3>
          <button
            className="close-btn"
            onClick={() => setShowCreateForm(false)}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        <form onSubmit={handleAdd} className="modal-body">
          <div className="form-group">
            <label>{form.isProject ? 'Project' : 'Task'} Title</label>
            <input
              type="text"
              className="modal-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={`Enter name or title...`}
              required
            />
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              className="modal-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={`Quick summary or details...`}
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Current Status</label>
              <select
                className="modal-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                {form.isProject && <option value="stopped">Stopped</option>}
              </select>
            </div>
            <div className="form-group">
              <label>Priority Level</label>
              <select
                className="modal-select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Target Deadline</label>
            <input
              type="date"
              className="modal-input"
              value={form.dueDate ? form.dueDate.split('T')[0] : ''}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          
          {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}
          
          <div className="modal-footer" style={{ padding: '0', display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-save">
              {isEdit ? <FiSave /> : <FiPlus />}
              {isEdit ? 'Save Changes' : `Create ${form.isProject ? 'Project' : 'Task'}`}
            </button>
            <button
              type="button"
              className="btn-save"
              style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', boxShadow: 'none' }}
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
