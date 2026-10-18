
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock3,
  Edit3,
  ListTodo,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createTask,
  deleteTask,
  getErrorMessage,
  getTasks,
  updateTask,
} from "./api";

const emptyForm = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  dueDate: "",
};

const statuses = ["Pending", "In Progress", "Completed"];
const priorities = ["Low", "Medium", "High"];

function formatDate(date) {
  if (!date) return "No due date";

  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(
    undefined,
    { day: "numeric", month: "short", year: "numeric" }
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const counts = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "Pending").length,
      progress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
    }),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !term ||
        task.title.toLowerCase().includes(term) ||
        (task.description || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  function openCreate() {
    setEditingTask(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "Pending",
      priority: task.priority || "Medium",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingTask(null);
    setForm(emptyForm);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const title = form.title.trim();

    if (!title) {
      setError("Please enter a task title.");
      return;
    }

    const payload = {
      ...form,
      title,
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    };

    setSaving(true);

    try {
      if (editingTask) {
        const updated = await updateTask(editingTask._id, payload);
        setTasks((current) =>
          current.map((task) =>
            task._id === updated._id ? updated : task
          )
        );
        setNotice("Task updated successfully.");
      } else {
        const created = await createTask(payload);
        setTasks((current) => [created, ...current]);
        setNotice("Task created successfully.");
      }

      setModalOpen(false);
      setEditingTask(null);
      setForm(emptyForm);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(task, status) {
    setError("");
    setNotice("");

    try {
      const updated = await updateTask(task._id, { status });
      setTasks((current) =>
        current.map((item) =>
          item._id === updated._id ? updated : item
        )
      );
      setNotice("Task status updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await deleteTask(task._id);
      setTasks((current) =>
        current.filter((item) => item._id !== task._id)
      );
      setNotice("Task deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">
            <ClipboardList size={23} />
          </span>
          <span>
            <strong>TaskFlow</strong>
            <small>Task Manager</small>
          </span>
        </a>

        <button className="primary-button" onClick={openCreate}>
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">WORKSPACE OVERVIEW</p>
          <h1>Manage your tasks</h1>
          <p className="subheading">
            Organize your work and keep your day on track.
          </p>
        </div>
        <div className="today-label">
          <span>Today</span>
          <span className="today-date">
            {new Date().toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </section>

      <section className="stats-grid" aria-label="Task summary">
        <StatCard
          label="Total Tasks"
          value={counts.total}
          icon={<ListTodo size={21} />}
          tone="purple"
        />
        <StatCard
          label="Pending"
          value={counts.pending}
          icon={<Circle size={21} />}
          tone="orange"
        />
        <StatCard
          label="In Progress"
          value={counts.progress}
          icon={<Clock3 size={21} />}
          tone="blue"
        />
        <StatCard
          label="Completed"
          value={counts.completed}
          icon={<CheckCircle2 size={21} />}
          tone="green"
        />
      </section>

      <section className="tasks-panel">
        <div className="panel-heading">
          <div>
            <h2>Your tasks</h2>
            <p>View, edit, and track your tasks.</p>
          </div>
          <span className="task-count">
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        <div className="filters">
          <label className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              aria-label="Search tasks"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filter by priority"
          >
            <option value="All">All priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>{priority} priority</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="alert error-alert" role="alert">
            {error}
            <button
              className="alert-close"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="alert success-alert" role="status">
            {notice}
            <button
              className="alert-close"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <LoaderCircle className="spin" size={30} />
            <p>Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><ClipboardList size={28} /></span>
            <h3>{tasks.length ? "No matching tasks" : "No tasks yet"}</h3>
            <p>
              {tasks.length
                ? "Try another search or change your filters."
                : "Create your first task to get started."}
            </p>
            {!tasks.length && (
              <button className="primary-button" onClick={openCreate}>
                <Plus size={18} /> Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <article className="task-card" key={task._id}>
                <div className="task-main">
                  <button
                    className={`complete-toggle ${task.status === "Completed" ? "is-complete" : ""}`}
                    title={
                      task.status === "Completed"
                        ? "Mark as pending"
                        : "Mark as completed"
                    }
                    aria-label={`Toggle completion for ${task.title}`}
                    onClick={() =>
                      handleStatusChange(
                        task,
                        task.status === "Completed" ? "Pending" : "Completed"
                      )
                    }
                  >
                    {task.status === "Completed"
                      ? <CheckCircle2 size={22} />
                      : <Circle size={22} />}
                  </button>

                  <div className="task-copy">
                    <h3 className={task.status === "Completed" ? "completed-title" : ""}>
                      {task.title}
                    </h3>
                    {task.description && <p>{task.description}</p>}
                    <div className="task-meta">
                      <span className={`badge status-${task.status.toLowerCase().replace(" ", "-")}`}>
                        {task.status}
                      </span>
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority} priority
                      </span>
                      <span className="due-date">{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="task-actions">
                  <label className="sr-only" htmlFor={`status-${task._id}`}>
                    Status for {task.title}
                  </label>
                  <select
                    id={`status-${task._id}`}
                    value={task.status}
                    onChange={(event) =>
                      handleStatusChange(task, event.target.value)
                    }
                    aria-label={`Change status for ${task.title}`}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    className="icon-button"
                    onClick={() => openEdit(task)}
                    aria-label={`Edit ${task.title}`}
                    title="Edit task"
                  >
                    <Edit3 size={17} />
                  </button>
                  <button
                    className="icon-button delete-button"
                    onClick={() => handleDelete(task)}
                    aria-label={`Delete ${task.title}`}
                    title="Delete task"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <span>TaskFlow</span>
        <span>Small steps. Meaningful progress.</span>
      </footer>

      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{editingTask ? "UPDATE DETAILS" : "GET STARTED"}</p>
                <h2 id="modal-title">
                  {editingTask ? "Edit task" : "Create a task"}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="field">
                <span>Task title <b>*</b></span>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  placeholder="e.g. Prepare project proposal"
                  maxLength={120}
                  required
                  autoFocus
                />
              </label>

              <label className="field">
                <span>Description</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="Add a few details about this task..."
                  rows={4}
                  maxLength={1000}
                />
              </label>

              <div className="form-row">
                <label className="field">
                  <span>Status</span>
                  <select name="status" value={form.status} onChange={updateField}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Priority</span>
                  <select name="priority" value={form.priority} onChange={updateField}>
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Due date</span>
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={updateField}
                />
              </label>

              {error && <div className="alert error-alert">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? (
                    <><LoaderCircle className="spin" size={17} /> Saving...</>
                  ) : (
                    <><CheckCircle2 size={17} /> {editingTask ? "Save changes" : "Create task"}</>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, icon, tone }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export default App;
