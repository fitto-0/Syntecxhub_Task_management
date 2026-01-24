import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "../components/Sidebar.jsx";
import {
  FiSearch,
  FiBell,
  FiPlus,
  FiMoreVertical,
  FiRefreshCw,
  FiBarChart2,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiZap,
  FiCheckCircle,
  FiCheckSquare,
  FiFileText,
  FiAlertCircle,
  FiGift,
  FiActivity,
  FiChevronRight,
  FiX
} from "react-icons/fi";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" }
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [taskMenuOpen, setTaskMenuOpen] = useState(null);
  const [widgetMenuOpen, setWidgetMenuOpen] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [monthGoals, setMonthGoals] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "in-progress",
    dueDate: "",
    priority: "medium"
  });

  useEffect(() => {
    let mounted = true;
    // Load tasks
    api
      .get("/tasks")
      .then((res) => mounted && setTasks(res.data))
      .catch(() => mounted && setError("Unable to load tasks"));
    
    // Load projects from backend
    api
      .get("/projects")
      .then((res) => mounted && setProjects(res.data || []))
      .catch((err) => {
        console.error("Failed to load projects:", err);
        if (mounted) setError("Unable to load projects");
      });
    
    // Load month goals from backend
    api
      .get("/month-goals")
      .then((res) => mounted && setMonthGoals(res.data || []))
      .catch((err) => {
        console.error("Failed to load month goals:", err);
        if (mounted) setError("Unable to load month goals");
      })
      .finally(() => mounted && setLoading(false));
    
    return () => {
      mounted = false;
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (taskMenuOpen && !e.target.closest('.task-card-menu-wrapper')) {
        setTaskMenuOpen(null);
      }
      if (widgetMenuOpen && !e.target.closest('.widget-menu-wrapper')) {
        setWidgetMenuOpen(null);
      }
      if (showNotifications && !e.target.closest('.notifications-panel') && !e.target.closest('.icon-btn-top')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [taskMenuOpen, widgetMenuOpen, showNotifications]);

  // Calculate real weekly progress analytics
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekData = [];
    
    // Get data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      // Calculate tasks completed on this day
      const completedTasks = tasks.filter(task => {
        if (task.status !== 'done') return false;
        if (!task.updatedAt) return false;
        const taskDate = new Date(task.updatedAt);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });
      
      // Calculate tasks created on this day
      const createdTasks = tasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });
      
      // Calculate high priority tasks completed
      const highPriorityCompleted = completedTasks.filter(task => task.priority === 'high').length;
      
      weekData.push({
        day: weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1], // Adjust for Monday start
        date: date.toLocaleDateString(),
        completed: completedTasks.length,
        created: createdTasks.length,
        highPriority: highPriorityCompleted,
        totalActive: tasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate <= dayEnd && task.status !== 'done';
        }).length
      });
    }
    
    // Calculate trends
    const totalCompleted = weekData.reduce((sum, day) => sum + day.completed, 0);
    const totalCreated = weekData.reduce((sum, day) => sum + day.created, 0);
    const totalHighPriority = weekData.reduce((sum, day) => sum + day.highPriority, 0);
    
    // Calculate completion rate trend
    const completionTrend = weekData.map((day, index) => {
      if (index === 0) return 0;
      const prevCompleted = weekData.slice(0, index).reduce((sum, d) => sum + d.completed, 0);
      const currentCompleted = weekData.slice(0, index + 1).reduce((sum, d) => sum + d.completed, 0);
      return prevCompleted > 0 ? ((currentCompleted - prevCompleted) / prevCompleted) * 100 : 0;
    });
    
    // Find the day with most completions
    const bestDay = weekData.reduce((best, day) => 
      day.completed > best.completed ? day : best, weekData[0]);
    
    return {
      weekData,
      totalCompleted,
      totalCreated,
      totalHighPriority,
      completionTrend,
      bestDay,
      averagePerDay: (totalCompleted / 7).toFixed(1),
      productivityScore: Math.min(100, Math.round((totalCompleted / Math.max(1, totalCreated)) * 100))
    };
  }, [tasks]);

  // Calculate real monthly progress analytics
  const monthlyProgress = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthData = [];
    
    // Get data for each day of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      // Calculate tasks completed on this day
      const completedTasks = tasks.filter(task => {
        if (task.status !== 'done') return false;
        if (!task.updatedAt) return false;
        const taskDate = new Date(task.updatedAt);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });
      
      // Calculate tasks created on this day
      const createdTasks = tasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });
      
      // Calculate high priority tasks completed
      const highPriorityCompleted = completedTasks.filter(task => task.priority === 'high').length;
      
      // Calculate in-progress tasks for this day
      const inProgressTasks = tasks.filter(task => {
        if (task.status !== 'in-progress') return false;
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate <= dayEnd;
      });
      
      monthData.push({
        day: day,
        date: date.toLocaleDateString(),
        completed: completedTasks.length,
        created: createdTasks.length,
        highPriority: highPriorityCompleted,
        inProgress: inProgressTasks.length,
        totalActive: tasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate <= dayEnd && task.status !== 'done';
        }).length
      });
    }
    
    // Calculate monthly totals and trends
    const totalCompleted = monthData.reduce((sum, day) => sum + day.completed, 0);
    const totalCreated = monthData.reduce((sum, day) => sum + day.created, 0);
    const totalHighPriority = monthData.reduce((sum, day) => sum + day.highPriority, 0);
    const totalInProgress = monthData.reduce((sum, day) => sum + day.inProgress, 0);
    
    // Calculate weekly averages
    const weeks = Math.ceil(daysInMonth / 7);
    const weeklyAverages = [];
    for (let week = 0; week < weeks; week++) {
      const startDay = week * 7;
      const endDay = Math.min((week + 1) * 7, daysInMonth);
      const weekData = monthData.slice(startDay, endDay);
      const weekCompleted = weekData.reduce((sum, day) => sum + day.completed, 0);
      const weekCreated = weekData.reduce((sum, day) => sum + day.created, 0);
      weeklyAverages.push({
        week: week + 1,
        completed: weekCompleted,
        created: weekCreated
      });
    }
    
    // Find the best and worst days
    const bestDay = monthData.reduce((best, day) => 
      day.completed > best.completed ? day : best, { completed: 0, day: 1 });
    const worstDay = monthData.reduce((worst, day) => 
      (day.completed < worst.completed || worst.completed === 0) ? day : worst, { completed: 0, day: 1 });
    
    // Calculate productivity trends
    const firstHalfCompleted = monthData.slice(0, Math.floor(daysInMonth / 2)).reduce((sum, day) => sum + day.completed, 0);
    const secondHalfCompleted = monthData.slice(Math.floor(daysInMonth / 2)).reduce((sum, day) => sum + day.completed, 0);
    const monthlyTrend = firstHalfCompleted > 0 ? ((secondHalfCompleted - firstHalfCompleted) / firstHalfCompleted) * 100 : 0;
    
    return {
      monthName: monthNames[currentMonth],
      year: currentYear,
      monthData,
      totalCompleted,
      totalCreated,
      totalHighPriority,
      totalInProgress,
      weeklyAverages,
      bestDay,
      worstDay,
      averagePerDay: (totalCompleted / daysInMonth).toFixed(1),
      productivityScore: Math.min(100, Math.round((totalCompleted / Math.max(1, totalCreated)) * 100)),
      monthlyTrend: monthlyTrend.toFixed(1),
      completionRate: totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0
    };
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const completion = total ? Math.round((done / total) * 100) : 0;
    
    // Project statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "in-progress").length;
    const completedProjects = projects.filter((p) => p.status === "done").length;
    const stoppedProjects = projects.filter((p) => p.status === "stopped").length;
    const pendingProjects = projects.filter((p) => p.status === "pending").length;
    const projectCompletionRate = totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    return { 
      total, 
      done, 
      inProgress, 
      pending, 
      completion, 
      projectsStopped: stoppedProjects,
      // Project analytics
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      projectCompletionRate
    };
  }, [tasks, projects]);

  const inProgressTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "in-progress").slice(0, 3);
  }, [tasks]);

  const allProjects = useMemo(() => {
    return projects.slice(0, 6); // Show up to 6 projects
  }, [projects]);


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (form.isProject) {
        // Create project
        const projectData = {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: form.priority,
          dueDate: form.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const res = await api.post("/projects", projectData);
        setProjects((prev) => [res.data, ...prev]);
      } else {
        // Create task
        const res = await api.post("/tasks", form);
        setTasks((prev) => [res.data, ...prev]);
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
      setError(err.response?.data?.message || `Failed to create ${form.isProject ? 'project' : 'task'}`);
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
        setError(err.response?.data?.message || "Delete failed");
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
      setError(err.response?.data?.message || "Failed to stop project");
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([
      api.get("/tasks"),
      api.get("/projects"),
      api.get("/month-goals")
    ])
      .then(([tasksRes, projectsRes, goalsRes]) => {
        setTasks(tasksRes.data);
        setProjects(projectsRes.data || []);
        setMonthGoals(goalsRes.data || []);
      })
      .catch(() => setError("Unable to load data"))
      .finally(() => setLoading(false));
  };

  const handleDownloadWeeklyReport = () => {
    const reportContent = `
WEEKLY PROGRESS REPORT
Generated: ${new Date().toLocaleDateString()}
User: ${user?.name || 'Unknown'}

SUMMARY:
- Total Tasks Completed: ${weeklyProgress.totalCompleted}
- Total Tasks Created: ${weeklyProgress.totalCreated}
- Average Tasks per Day: ${weeklyProgress.averagePerDay}
- Productivity Score: ${weeklyProgress.productivityScore}%
- Best Day: ${weeklyProgress.bestDay.day} (${weeklyProgress.bestDay.completed} tasks)

DAILY BREAKDOWN:
==========================================
${weeklyProgress.weekData.map(day => `
${day.day} (${day.date}):
  Created: ${day.created} tasks
  Completed: ${day.completed} tasks
  High Priority Completed: ${day.highPriority} tasks
  Active Tasks: ${day.totalActive}
`).join('\n')}

TREND ANALYSIS:
${weeklyProgress.completionTrend.length > 0 ? 
  `Completion trend is ${weeklyProgress.completionTrend[weeklyProgress.completionTrend.length - 1] > 0 ? 'improving' : 'declining'}` : 
  'Insufficient data for trend analysis'
}
`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-progress-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMonthlyReport = () => {
    const reportContent = `
MONTHLY PROGRESS REPORT - ${monthlyProgress.monthName} ${monthlyProgress.year}
Generated: ${new Date().toLocaleDateString()}
User: ${user?.name || 'Unknown'}

SUMMARY:
- Total Tasks Completed: ${monthlyProgress.totalCompleted}
- Total Tasks Created: ${monthlyProgress.totalCreated}
- Total High Priority Completed: ${monthlyProgress.totalHighPriority}
- Total In Progress: ${monthlyProgress.totalInProgress}
- Average Tasks per Day: ${monthlyProgress.averagePerDay}
- Productivity Score: ${monthlyProgress.productivityScore}%
- Completion Rate: ${monthlyProgress.completionRate}%
- Monthly Trend: ${monthlyProgress.monthlyTrend > 0 ? '+' : ''}${monthlyProgress.monthlyTrend}%

PERFORMANCE HIGHLIGHTS:
- Best Day: ${monthlyProgress.bestDay.day} (${monthlyProgress.bestDay.completed} tasks completed)
- Worst Day: ${monthlyProgress.worstDay.day} (${monthlyProgress.worstDay.completed} tasks completed)

WEEKLY BREAKDOWN:
${monthlyProgress.weeklyAverages.map(week => 
  `Week ${week.week}: ${week.completed} completed, ${week.created} created`
).join('\n')}

MONTHLY TREND:
${monthlyProgress.monthlyTrend > 0 ? 
  `Productivity improved by ${monthlyProgress.monthlyTrend}% in the second half of the month` : 
  monthlyProgress.monthlyTrend < 0 ?
  `Productivity declined by ${Math.abs(monthlyProgress.monthlyTrend)}% in the second half of the month` :
  'Productivity remained stable throughout the month'
}

RECOMMENDATIONS:
${monthlyProgress.productivityScore > 80 ? 
  'Excellent productivity! Keep up the great work!' :
  monthlyProgress.productivityScore > 60 ?
  'Good productivity with room for improvement.' :
  'Consider reviewing task management strategies to improve productivity.'
}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-progress-${monthlyProgress.monthName}-${monthlyProgress.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = () => {
    const reportContent = `
TASK MANAGEMENT REPORT
Generated: ${new Date().toLocaleDateString()}
User: ${user?.name || 'Unknown'}

TASK SUMMARY
==========================================
Total Tasks: ${stats.total}
Completed Tasks: ${stats.done}
In Progress: ${stats.inProgress}
Pending Tasks: ${stats.pending}
Completion Rate: ${stats.completion}%

TASK BREAKDOWN BY STATUS
==========================================
Completed: ${stats.done} (${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%)
In Progress: ${stats.inProgress} (${stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0}%)
Pending: ${stats.pending} (${stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%)

TASK BREAKDOWN BY PRIORITY
==========================================
High Priority: ${tasks.filter(t => t.priority === 'high').length}
Medium Priority: ${tasks.filter(t => t.priority === 'medium').length}
Low Priority: ${tasks.filter(t => t.priority === 'low').length}

WEEKLY PERFORMANCE
==========================================
Weekly Completed: ${weeklyProgress.totalCompleted}
Weekly Created: ${weeklyProgress.totalCreated}
Productivity Score: ${weeklyProgress.productivityScore}%

RECOMMENDATIONS
==========================================
${stats.completion >= 70 ? '• Great job maintaining high completion rate!' : '• Focus on completing pending tasks to improve completion rate'}
${weeklyProgress.productivityScore >= 80 ? '• Excellent weekly productivity!' : '• Consider optimizing your workflow for better productivity'}
${tasks.filter(t => t.priority === 'high' && t.status !== 'done').length > 0 ? `• ${tasks.filter(t => t.priority === 'high' && t.status !== 'done').length} high-priority tasks need attention` : '• All high-priority tasks are completed!'}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewFullChart = () => {
    // Navigate to statistics page for full analytics
    window.location.href = '/statistics';
  };

  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);

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

  const handleAddGoal = () => {
    setShowGoalModal(true);
  };

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
        setError(err.response?.data?.message || "Failed to add goal");
      }
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.delete(`/month-goals/${id}`);
      setMonthGoals(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete goal");
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
      setError(err.response?.data?.message || "Failed to update goal");
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
      setError(err.response?.data?.message || "Failed to update goal");
    }
  };

  const getTaskIcon = (task) => {
    if (task.priority === "high") return <FiAlertCircle className="task-icon" />;
    if (task.status === "done") return <FiCheckCircle className="task-icon" />;
    if (task.status === "in-progress") return <FiZap className="task-icon" />;
    return <FiGift className="task-icon" />;
  };

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

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">Hi, {user?.name?.split(" ")[0] || "User"}!</h1>
          </div>
          <div className="top-bar-right">
            <button
              type="button"
              className="btn-create"
              onClick={handleAddTaskClick}
            >
              <FiPlus />
              Create
            </button>
            <button 
              type="button" 
              className="icon-btn-top export-btn" 
              aria-label="View Full Chart"
              onClick={handleViewFullChart}
              title="View Full Analytics Chart"
            >
              <FiBarChart2 />
            </button>
            <button 
              type="button" 
              className="icon-btn-top export-btn" 
              aria-label="Export Data"
              onClick={handleDownloadReport}
              title="Export Task Report"
            >
              <FiDownload />
            </button>
            <button 
              type="button" 
              className="icon-btn-top" 
              aria-label="Search"
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) {
                  setTimeout(() => {
                    const searchInput = document.querySelector(".search-input");
                    if (searchInput) searchInput.focus();
                  }, 100);
                }
              }}
            >
              <FiSearch />
            </button>
            <button 
              type="button" 
              className="icon-btn-top" 
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FiBell />
              {showNotifications && <span className="notification-badge"></span>}
            </button>
            <Link to="/profile" className="profile-btn-top">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="top-avatar" />
              ) : (
                <div className="top-avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Search Bar */}
        {showSearch && (
          <div className="search-bar-overlay">
            <div className="search-bar">
              <FiSearch className="search-bar-icon" />
              <input
                type="text"
                className="search-input-full"
                placeholder="Search tasks, projects..."
                autoFocus
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              />
              <button
                type="button"
                className="search-close"
                onClick={() => setShowSearch(false)}
              >
                <FiX />
              </button>
            </div>
          </div>
        )}

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="notifications-panel">
            <div className="notifications-header">
              <h3>Notifications</h3>
              <button onClick={() => setShowNotifications(false)}>
                <FiX />
              </button>
            </div>
            <div className="notifications-content">
              <p className="no-notifications">No new notifications</p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="dashboard-content-glass">
          <div className="dashboard-grid">
            {/* Overall Information */}
            <div className="widget overall-info-widget">
              <div className="widget-header">
                <h2>Overall Information</h2>
                <div className="widget-menu-wrapper">
                  <button 
                    className="icon-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWidgetMenuOpen(widgetMenuOpen === 'overall' ? null : 'overall');
                    }}
                    aria-label="More options"
                  >
                    <FiMoreVertical />
                  </button>
                  {widgetMenuOpen === 'overall' && (
                    <div className="widget-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleRefresh();
                        }}
                      >
                        <FiRefreshCw /> Refresh
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleDownloadReport();
                        }}
                      >
                        <FiDownload /> Export Data
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          console.log("View details");
                        }}
                      >
                        <FiBarChart2 /> View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-body">
                <div className="overall-stats">
                  <div className="overall-stat-large">
                    <span className="stat-big-number">{stats.done}</span>
                    <span className="stat-big-label">Tasks done for all time</span>
                  </div>
                  <div className="overall-stat-large">
                    <span className="stat-big-number">{stats.totalProjects}</span>
                    <span className="stat-big-label">Total Projects</span>
                  </div>
                  <div className="overall-stat-large">
                    <span className="stat-big-number">{stats.projectsStopped}</span>
                    <span className="stat-big-label">Projects Stopped</span>
                  </div>
                </div>
                <div className="overall-circles">
                  <div className="overall-circle">
                    <span className="circle-number">{stats.totalProjects}</span>
                    <span className="circle-label">Projects</span>
                  </div>
                  <div className="overall-circle">
                    <span className="circle-number">{stats.activeProjects}</span>
                    <span className="circle-label">Active</span>
                  </div>
                  <div className="overall-circle">
                    <span className="circle-number">{stats.completedProjects}</span>
                    <span className="circle-label">Completed</span>
                  </div>
                  <div className="overall-circle">
                    <span className="circle-number">{stats.projectCompletionRate}%</span>
                    <span className="circle-label">Success Rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="widget weekly-progress-widget">
              <div className="widget-header">
                <h2>Weekly Progress</h2>
                <div className="widget-menu-wrapper">
                  <button 
                    className="icon-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWidgetMenuOpen(widgetMenuOpen === 'weekly' ? null : 'weekly');
                    }}
                    aria-label="More options"
                  >
                    <FiMoreVertical />
                  </button>
                  {widgetMenuOpen === 'weekly' && (
                    <div className="widget-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleRefresh();
                        }}
                      >
                        <FiRefreshCw /> Refresh
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          console.log("View full analytics chart");
                        }}
                      >
                        <FiBarChart2 /> View Full Chart
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleDownloadWeeklyReport();
                        }}
                      >
                        <FiDownload /> Export Week
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-body">
                <div className="weekly-summary">
                  <div className="summary-item">
                    <span className="summary-label">Completed</span>
                    <span className="summary-value">{weeklyProgress.totalCompleted}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Created</span>
                    <span className="summary-value">{weeklyProgress.totalCreated}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Avg/Day</span>
                    <span className="summary-value">{weeklyProgress.averagePerDay}</span>
                  </div>
                </div>
                
                <div className="progress-legend">
                  <div className="legend-item">
                    <span className="legend-dot completed-dot"></span>
                    <span>Completed</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot created-dot"></span>
                    <span>Created</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot high-priority-dot"></span>
                    <span>High Priority</span>
                  </div>
                </div>
                
                <div className="progress-chart">
                  {/* Completed tasks line */}
                  <div className="chart-line completed-line">
                    {weeklyProgress.weekData.map((day, index) => {
                      const maxValue = Math.max(...weeklyProgress.weekData.map(d => Math.max(d.completed, d.created)));
                      const topPosition = maxValue > 0 ? (100 - (day.completed / maxValue) * 80) : 90;
                      const isToday = index === weeklyProgress.weekData.length - 1;
                      const isBestDay = day.day === weeklyProgress.bestDay.day;
                      
                      return (
                        <div 
                          key={`completed-${index}`}
                          className={`chart-point ${isToday ? 'highlight' : ''} ${isBestDay ? 'best-day' : ''}`} 
                          style={{ 
                            left: `${14 + (index * 14)}%`, 
                            top: `${topPosition}%` 
                          }}
                          title={`${day.day}: ${day.completed} completed`}
                        >
                          {isToday && day.completed > 0 && (
                            <span className="chart-badge">+{day.completed}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Created tasks line */}
                  <div className="chart-line created-line">
                    {weeklyProgress.weekData.map((day, index) => {
                      const maxValue = Math.max(...weeklyProgress.weekData.map(d => Math.max(d.completed, d.created)));
                      const topPosition = maxValue > 0 ? (100 - (day.created / maxValue) * 80) : 90;
                      
                      return (
                        <div 
                          key={`created-${index}`}
                          className="chart-point" 
                          style={{ 
                            left: `${14 + (index * 14)}%`, 
                            top: `${topPosition}%` 
                          }}
                          title={`${day.day}: ${day.created} created`}
                        />
                      );
                    })}
                  </div>
                  
                  {/* High priority tasks line */}
                  <div className="chart-line high-priority-line">
                    {weeklyProgress.weekData.map((day, index) => {
                      const maxValue = Math.max(...weeklyProgress.weekData.map(d => Math.max(d.completed, d.created)));
                      const topPosition = maxValue > 0 ? (100 - (day.highPriority / maxValue) * 80) : 90;

                      return (
                        <div 
                          key={`priority-${index}`}
                          className="chart-point priority-point" 
                          style={{ 
                            left: `${14 + (index * 14)}%`, 
                            top: `${topPosition}%` 
                          }}
                          title={`${day.day}: ${day.highPriority} high priority completed`}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="chart-labels">
                    {weeklyProgress.weekData.map((day, index) => (
                      <span key={index}>{day.day.charAt(0)}</span>
                    ))}
                  </div>
                </div>
                
                <div className="weekly-insights">
                  <div className="insight-item">
                    <FiActivity className="insight-icon" />
                    <div>
                      <span className="insight-label">Best Day</span>
                      <span className="insight-value">{weeklyProgress.bestDay.day} ({weeklyProgress.bestDay.completed} tasks)</span>
                    </div>
                  </div>
                  <div className="insight-item">
                    <FiCheckCircle className="insight-icon" />
                    <div>
                      <span className="insight-label">Productivity Score</span>
                      <span className="insight-value">{weeklyProgress.productivityScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Month Progress */}
            <div className="widget month-progress-widget">
              <div className="widget-header">
                <h2>Monthly Progress - {monthlyProgress.monthName} {monthlyProgress.year}</h2>
                <div className="widget-menu-wrapper">
                  <button 
                    className="icon-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWidgetMenuOpen(widgetMenuOpen === 'month' ? null : 'month');
                    }}
                    aria-label="More options"
                  >
                    <FiMoreVertical />
                  </button>
                  {widgetMenuOpen === 'month' && (
                    <div className="widget-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleDownloadMonthlyReport();
                        }}
                      >
                        <FiDownload /> Export Month
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          console.log("View full monthly analytics chart");
                        }}
                      >
                        <FiBarChart2 /> View Full Chart
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleRefresh();
                        }}
                      >
                        <FiRefreshCw /> Refresh
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-body">
                <div className="month-progress-subtitle">
                  {monthlyProgress.monthlyTrend > 0 ? '+' : ''}{monthlyProgress.monthlyTrend}% compared to first half of month
                </div>
                <div className="month-progress-circle-large">
                  <div className="progress-ring">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="8"
                        strokeDasharray={`${120 * Math.PI * (monthlyProgress.productivityScore / 100)} ${120 * Math.PI}`}
                        strokeDashoffset="0"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                  </div>
                  <div className="progress-center">
                    <span className="progress-percent">{monthlyProgress.productivityScore}%</span>
                  </div>
                </div>
                <div className="monthly-summary-mini">
                  <div className="mini-summary-item">
                    <span className="mini-label">Completed</span>
                    <span className="mini-value">{monthlyProgress.totalCompleted}</span>
                  </div>
                  <div className="mini-summary-item">
                    <span className="mini-label">Created</span>
                    <span className="mini-value">{monthlyProgress.totalCreated}</span>
                  </div>
                  <div className="mini-summary-item">
                    <span className="mini-label">Avg/Day</span>
                    <span className="mini-value">{monthlyProgress.averagePerDay}</span>
                  </div>
                </div>
                <div className="month-progress-legend">
                  <div className="legend-item">
                    <span className="legend-dot completed-dot"></span>
                    <span>Completed ({monthlyProgress.totalCompleted})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot created-dot"></span>
                    <span>Created ({monthlyProgress.totalCreated})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot high-priority-dot"></span>
                    <span>High Priority ({monthlyProgress.totalHighPriority})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Analytics */}
            <div className="widget projects-analytics-widget">
              <div className="widget-header">
                <h2>Projects Analytics</h2>
                <div className="widget-menu-wrapper">
                  <button 
                    className="icon-btn-small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWidgetMenuOpen(widgetMenuOpen === 'projects' ? null : 'projects');
                    }}
                    aria-label="More options"
                  >
                    <FiMoreVertical />
                  </button>
                  {widgetMenuOpen === 'projects' && (
                    <div className="widget-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          handleRefresh();
                        }}
                      >
                        <FiRefreshCw /> Refresh
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWidgetMenuOpen(null);
                          console.log("Export projects data");
                        }}
                      >
                        <FiDownload /> Export Projects
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="widget-body">
                <div className="projects-summary">
                  <div className="project-stat-item">
                    <div className="project-stat-icon active">
                      <FiZap />
                    </div>
                    <div className="project-stat-content">
                      <span className="project-stat-number">{stats.activeProjects}</span>
                      <span className="project-stat-label">Active Projects</span>
                    </div>
                  </div>
                  <div className="project-stat-item">
                    <div className="project-stat-icon completed">
                      <FiCheckCircle />
                    </div>
                    <div className="project-stat-content">
                      <span className="project-stat-number">{stats.completedProjects}</span>
                      <span className="project-stat-label">Completed</span>
                    </div>
                  </div>
                  <div className="project-stat-item">
                    <div className="project-stat-icon stopped">
                      <FiAlertCircle />
                    </div>
                    <div className="project-stat-content">
                      <span className="project-stat-number">{stats.projectsStopped}</span>
                      <span className="project-stat-label">Stopped</span>
                    </div>
                  </div>
                  <div className="project-stat-item">
                    <div className="project-stat-icon pending">
                      <FiGift />
                    </div>
                    <div className="project-stat-content">
                      <span className="project-stat-number">{stats.pendingProjects}</span>
                      <span className="project-stat-label">Pending</span>
                    </div>
                  </div>
                </div>
                <div className="project-progress-bar">
                  <div className="progress-label">
                    <span>Project Completion Rate</span>
                    <span className="progress-percentage">{stats.projectCompletionRate}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${stats.projectCompletionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Month Goals */}
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

            {/* Tasks In Process */}
            <div className="widget tasks-process-widget">
              <div className="widget-header">
                <h2>Task In process ({inProgressTasks.length})</h2>
                <button
                  type="button"
                  className="small"
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
                    <div key={task._id} className="task-card-process">
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
                              // Pin functionality
                              console.log("Pin task:", task.title);
                            }}>
                              Pin Note
                            </button>
                            <button onClick={() => {
                              setTaskMenuOpen(null);
                              // Edit functionality - you can add edit modal here
                              console.log("Edit task:", task.title);
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

            {/* Projects */}
            <div className="widget projects-widget">
              <div className="widget-header">
                <h2>My Projects ({allProjects.length})</h2>
                <button
                  type="button"
                  className="small"
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
                    <div key={project._id} className="project-card">
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
                                console.log("Pin project:", project.title);
                              }}>
                                Pin Project
                              </button>
                              <button onClick={() => {
                                setTaskMenuOpen(null);
                                console.log("Edit project:", project.title);
                                // You can add edit modal here
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

          </div>
        </div>

        {/* Task Type Selection Modal */}
        {showTaskTypeModal && (
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
        )}

        {/* Create Task Modal */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New {form.isProject ? 'Project' : 'Task'}</h2>
                <button
                  className="icon-btn-small"
                  onClick={() => setShowCreateForm(false)}
                  aria-label="Close"
                >
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleAdd} className="modal-form">
                <div className="form-group">
                  <label>
                    {form.isProject ? 'Project' : 'Task'} Title
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder={`Enter ${form.isProject ? 'project' : 'task'} title`}
                      required
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    Description
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder={`Describe your ${form.isProject ? 'project' : 'task'}...`}
                      rows={4}
                    />
                  </label>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Status
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                        {form.isProject && <option value="stopped">Stopped</option>}
                      </select>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      Priority
                      <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    Due Date
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </label>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="modal-actions">
                  <button type="submit" className="btn primary">
                    <FiPlus />
                    Create {form.isProject ? 'Project' : 'Task'}
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Goal Modal */}
        {showGoalModal && (
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
        )}
      </div>
    </div>
  );
}
