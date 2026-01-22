import { useEffect, useMemo, useState } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    dueDate: ""
  });

  useEffect(() => {
    let mounted = true;
    api
      .get("/tasks")
      .then((res) => mounted && setTasks(res.data))
      .catch(() => mounted && setError("Unable to load tasks"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/tasks", form);
      setTasks([res.data, ...tasks]);
      setForm({ title: "", description: "", status: "pending", dueDate: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await api.put(`/tasks/${id}`, updates);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="eyebrow">Signed in</div>
          <div className="title">
            {user?.name} <span className="muted">({user?.email})</span>
          </div>
        </div>
        <button className="ghost" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Add Task</h2>
          <form className="form-grid" onSubmit={handleAdd}>
            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="What needs to be done?"
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Optional details"
              />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Due date
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />
            </label>
            <button type="submit">Create task</button>
          </form>
          {error && <div className="error">{error}</div>}
        </section>

        <section className="card">
          <div className="list-header">
            <h2>Tasks</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div>Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="muted">No tasks yet.</div>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <li key={task._id} className="task">
                  <div>
                    <div className="task-title">{task.title}</div>
                    {task.description && <div className="muted">{task.description}</div>}
                    <div className="meta">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdate(task._id, { status: e.target.value })}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {task.dueDate && (
                        <span className="chip">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="ghost" onClick={() => handleDelete(task._id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
