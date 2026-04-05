import { useMemo } from 'react';

export function useTaskAnalytics(tasks, projects) {
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
    
    // Project priority breakdown
    const highPriorityProjects = projects.filter((p) => p.status === "in-progress" && p.priority === "high").length;
    const medPriorityProjects = projects.filter((p) => p.status === "in-progress" && p.priority === "medium").length;
    const lowPriorityProjects = projects.filter((p) => p.status === "in-progress" && p.priority === "low").length;
    
    const projectCompletionRate = totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    // Recent items: sorted by updatedAt
    const recentProjects = [...projects].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    ).slice(0, 3);
    
    // Calculated Health Score: (Total - Stopped) / Total * 100 (if no projects, 100)
    const healthScore = totalProjects ? Math.round(((totalProjects - stoppedProjects) / totalProjects) * 100) : 100;
    
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
      projectCompletionRate,
      highPriorityProjects,
      medPriorityProjects,
      lowPriorityProjects,
      recentProjects,
      healthScore
    };
  }, [tasks, projects]);

  return { weeklyProgress, monthlyProgress, stats };
}
