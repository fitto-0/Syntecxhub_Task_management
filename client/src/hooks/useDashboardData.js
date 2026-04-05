import { useState, useEffect } from 'react';
import api from '../api.js';

export function useDashboardData() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [monthGoals, setMonthGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Specific error states as requested
  const [taskError, setTaskError] = useState("");
  const [projectError, setProjectError] = useState("");
  const [goalError, setGoalError] = useState("");

  const loadData = () => {
    let mounted = true;
    setLoading(true);
    setTaskError("");
    setProjectError("");
    setGoalError("");

    Promise.allSettled([
      api.get("/tasks"),
      api.get("/projects"),
      api.get("/month-goals")
    ]).then(([tasksRes, projectsRes, goalsRes]) => {
      if (!mounted) return;
      
      if (tasksRes.status === "fulfilled") {
        setTasks(tasksRes.value.data);
      } else {
        setTaskError("Unable to load tasks");
      }

      if (projectsRes.status === "fulfilled") {
        setProjects(projectsRes.value.data || []);
      } else {
        console.error("Failed to load projects:", projectsRes.reason);
        setProjectError("Unable to load projects");
      }

      if (goalsRes.status === "fulfilled") {
        setMonthGoals(goalsRes.value.data || []);
      } else {
        console.error("Failed to load month goals:", goalsRes.reason);
        setGoalError("Unable to load month goals");
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  return {
    tasks, setTasks,
    projects, setProjects,
    monthGoals, setMonthGoals,
    loading,
    taskError, setTaskError,
    projectError, setProjectError,
    goalError, setGoalError,
    handleRefresh
  };
}
