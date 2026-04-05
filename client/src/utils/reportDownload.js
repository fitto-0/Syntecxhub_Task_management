export const handleDownloadWeeklyReport = (weeklyProgress, user) => {
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

export const handleDownloadMonthlyReport = (monthlyProgress, user) => {
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

export const handleDownloadReport = (stats, tasks, weeklyProgress, user) => {
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
