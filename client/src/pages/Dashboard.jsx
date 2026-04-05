import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";

// Hooks
import { useDashboardData } from "../hooks/useDashboardData.js";
import { useTaskAnalytics } from "../hooks/useTaskAnalytics.js";

// Widgets
import OverallInfoWidget from "../components/widgets/OverallInfoWidget.jsx";
import WeeklyProgressWidget from "../components/widgets/WeeklyProgressWidget.jsx";
import MonthlyProgressWidget from "../components/widgets/MonthlyProgressWidget.jsx";
import ProjectsAnalyticsWidget from "../components/widgets/ProjectsAnalyticsWidget.jsx";
import MonthGoalsWidget from "../components/widgets/MonthGoalsWidget.jsx";
import TasksInProgressWidget from "../components/widgets/TasksInProgressWidget.jsx";
import ProjectsWidget from "../components/widgets/ProjectsWidget.jsx";

// Modals
import CreateTaskModal from "../components/modals/CreateTaskModal.jsx";
import TaskTypeModal from "../components/modals/TaskTypeModal.jsx";
import AddGoalModal from "../components/modals/AddGoalModal.jsx";

// Utils
import {
  handleDownloadWeeklyReport,
  handleDownloadMonthlyReport,
  handleDownloadReport
} from "../utils/reportDownload.js";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load data & states from Custom Hook
  const {
    tasks, setTasks,
    projects, setProjects,
    monthGoals, setMonthGoals,
    loading,
    taskError, setTaskError,
    projectError, setProjectError,
    goalError, setGoalError,
    handleRefresh
  } = useDashboardData();

  // Load Analytics
  const {
    weeklyProgress,
    monthlyProgress,
    stats
  } = useTaskAnalytics(tasks, projects);

  // Local UI States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [taskMenuOpen, setTaskMenuOpen] = useState(null);
  const [widgetMenuOpen, setWidgetMenuOpen] = useState(null);
  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "in-progress",
    dueDate: "",
    priority: "medium",
    isProject: false
  });

  // UI calculations
  const inProgressTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "in-progress").slice(0, 3);
  }, [tasks]);

  const allProjects = useMemo(() => {
    return projects.slice(0, 6);
  }, [projects]);

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (taskMenuOpen && !e.target.closest('.task-card-menu-wrapper') && !e.target.closest('.project-card-menu-wrapper')) {
        setTaskMenuOpen(null);
      }
      if (widgetMenuOpen && !e.target.closest('.widget-menu-wrapper')) {
        setWidgetMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [taskMenuOpen, widgetMenuOpen]);


  // Event Handlers
  const handleAddTaskClick = () => {
    setShowTaskTypeModal(true);
  };

  const handleTaskTypeSelect = (type) => {
    setShowTaskTypeModal(false);
    if (type === 'task') {
      setForm({
        title: '',
        description: '',
        status: 'in-progress',
        dueDate: '',
        priority: 'medium',
        isProject: false
      });
      setShowCreateForm(true);
    } else if (type === 'project') {
      setForm({
        title: '',
        description: '',
        status: 'in-progress',
        dueDate: '',
        priority: 'high',
        isProject: true
      });
      setShowCreateForm(true);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (form.isProject) setProjectError("");
    else setTaskError("");
    try {
      if (form.isProject) {
        const projectData = {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        if (form._id) {
          // Edit project
          const res = await api.put(`/projects/${form._id}`, projectData);
          setProjects((prev) => prev.map(p => p._id === form._id ? res.data : p));
        } else {
          // Create project
          const res = await api.post("/projects", projectData);
          setProjects((prev) => [res.data, ...prev]);
        }
      } else {
        if (form._id) {
          // Edit task
          const res = await api.put(`/tasks/${form._id}`, form);
          setTasks((prev) => prev.map(t => t._id === form._id ? res.data : t));
        } else {
          // Create task
          const res = await api.post("/tasks", form);
          setTasks((prev) => [res.data, ...prev]);
        }
      }
      setForm({
        title: "",
        description: "",
        status: "in-progress",
        dueDate: "",
        priority: "medium",
        isProject: false
      });
      setShowCreateForm(false);
    } catch (err) {
      if (form.isProject) {
        setProjectError(err.response?.data?.message || `Failed to ${form._id ? 'update' : 'create'} project`);
      } else {
        setTaskError(err.response?.data?.message || `Failed to ${form._id ? 'update' : 'create'} task`);
      }
    }
  };

  const handleDelete = async (id, isProject = false) => {
    if (window.confirm(`Are you sure you want to delete this ${isProject ? 'project' : 'task'}?`)) {
      try {
        if (isProject) {
          await api.delete(`/projects/${id}`);
          setProjects((prev) => prev.filter((p) => p._id !== id));
        } else {
          await api.delete(`/tasks/${id}`);
          setTasks((prev) => prev.filter((t) => t._id !== id));
        }
      } catch (err) {
        if (isProject) setProjectError(err.response?.data?.message || "Delete failed");
        else setTaskError(err.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleStopProject = async (projectId) => {
    try {
      await api.put(`/projects/${projectId}`, { status: 'stopped' });
      setProjects(prev => prev.map(p => 
        p._id === projectId ? { ...p, status: 'stopped', updatedAt: new Date().toISOString() } : p
      ));
    } catch (err) {
      setProjectError(err.response?.data?.message || "Failed to stop project");
    }
  };

  const handlePinTask = (item) => {
    alert(`Pinned: ${item.title}`);
  };

  const handleEditTask = (item, isProject = false) => {
    setForm({
      _id: item._id, // Set ID to indicate edit mode
      title: item.title,
      description: item.description || '',
      status: item.status,
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '', 
      priority: item.priority || 'medium',
      isProject: isProject
    });
    setShowCreateForm(true);
  };

  // Goals Form Handlers
  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      try {
        const res = await api.post("/month-goals", {
          title: newGoalText.trim()
        });
        setMonthGoals(prev => [...prev, res.data]);
        setNewGoalText("");
        setShowGoalModal(false);
      } catch (err) {
        setGoalError(err.response?.data?.message || "Failed to add goal");
      }
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.delete(`/month-goals/${id}`);
      setMonthGoals(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      setGoalError(err.response?.data?.message || "Failed to delete goal");
    }
  };

  const toggleGoal = async (id) => {
    try {
      const goal = monthGoals.find(g => g._id === id);
      if (goal) {
        const res = await api.put(`/month-goals/${id}`, {
          completed: !goal.completed
        });
        setMonthGoals(prev => prev.map(g => 
          g._id === id ? { ...g, completed: !g.completed } : g
        ));
      }
    } catch (err) {
      setGoalError(err.response?.data?.message || "Failed to update goal");
    }
  };

  const updateGoalText = async (id, newText) => {
    try {
      const res = await api.put(`/month-goals/${id}`, {
        title: newText
      });
      setMonthGoals(prev => prev.map(g => 
        g._id === id ? { ...g, title: newText } : g
      ));
    } catch (err) {
      setGoalError(err.response?.data?.message || "Failed to update goal");
    }
  };

  const handleViewFullChart = () => {
    navigate('/statistics');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar 
          user={user} 
          handleAddTaskClick={handleAddTaskClick} 
          handleViewFullChart={handleViewFullChart} 
          handleDownloadReport={() => handleDownloadReport(stats, tasks, weeklyProgress, user)}
        />

        {loading ? (
          <div className="loading-spinner">Loading dashboard...</div>
        ) : (
          <div className="dashboard-content-glass">
            {(taskError || projectError || goalError) && (
              <div className="dashboard-errors">
                {taskError && <p className="error-message">{taskError}</p>}
                {projectError && <p className="error-message">{projectError}</p>}
                {goalError && <p className="error-message">{goalError}</p>}
              </div>
            )}
            
            <div className="dashboard-grid">
              <OverallInfoWidget 
                stats={stats}
                widgetMenuOpen={widgetMenuOpen}
                setWidgetMenuOpen={setWidgetMenuOpen}
                handleRefresh={handleRefresh}
                handleDownloadReport={() => handleDownloadReport(stats, tasks, weeklyProgress, user)}
              />

              <WeeklyProgressWidget 
                weeklyProgress={weeklyProgress}
                widgetMenuOpen={widgetMenuOpen}
                setWidgetMenuOpen={setWidgetMenuOpen}
                handleRefresh={handleRefresh}
                handleDownloadWeeklyReport={() => handleDownloadWeeklyReport(weeklyProgress, user)}
              />

              <MonthlyProgressWidget 
                monthlyProgress={monthlyProgress}
                widgetMenuOpen={widgetMenuOpen}
                setWidgetMenuOpen={setWidgetMenuOpen}
                handleRefresh={handleRefresh}
                handleDownloadMonthlyReport={() => handleDownloadMonthlyReport(monthlyProgress, user)}
              />

              <ProjectsAnalyticsWidget 
                stats={stats}
                widgetMenuOpen={widgetMenuOpen}
                setWidgetMenuOpen={setWidgetMenuOpen}
                handleRefresh={handleRefresh}
              />

              <MonthGoalsWidget 
                monthGoals={monthGoals}
                editingGoal={editingGoal}
                setEditingGoal={setEditingGoal}
                handleAddGoal={() => setShowGoalModal(true)}
                toggleGoal={toggleGoal}
                updateGoalText={updateGoalText}
                handleDeleteGoal={handleDeleteGoal}
              />

              <TasksInProgressWidget 
                tasks={tasks}
                inProgressTasks={inProgressTasks}
                taskMenuOpen={taskMenuOpen}
                setTaskMenuOpen={setTaskMenuOpen}
                setShowCreateForm={setShowCreateForm}
                handleDelete={handleDelete}
                handleEditTask={handleEditTask}
                handlePinTask={handlePinTask}
              />

              <ProjectsWidget 
                projects={projects}
                allProjects={allProjects}
                taskMenuOpen={taskMenuOpen}
                setTaskMenuOpen={setTaskMenuOpen}
                handleStopProject={handleStopProject}
                handleDelete={handleDelete}
                handleEditTask={handleEditTask}
                handlePinTask={handlePinTask}
                setForm={setForm}
                setShowCreateForm={setShowCreateForm}
              />
            </div>
          </div>
        )}

        <TaskTypeModal 
          showTaskTypeModal={showTaskTypeModal}
          setShowTaskTypeModal={setShowTaskTypeModal}
          handleTaskTypeSelect={handleTaskTypeSelect}
        />

        <CreateTaskModal 
          showCreateForm={showCreateForm}
          setShowCreateForm={setShowCreateForm}
          form={form}
          setForm={setForm}
          handleAdd={handleAdd}
          error={taskError || projectError}
        />

        <AddGoalModal 
          showGoalModal={showGoalModal}
          setShowGoalModal={setShowGoalModal}
          newGoalText={newGoalText}
          setNewGoalText={setNewGoalText}
          handleSubmitGoal={handleSubmitGoal}
        />

      </div>
    </div>
  );
}
