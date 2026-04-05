import React from 'react';
import { FiMoreVertical, FiRefreshCw, FiDownload, FiBarChart2 } from 'react-icons/fi';

export default function MonthlyProgressWidget({
  monthlyProgress,
  widgetMenuOpen,
  setWidgetMenuOpen,
  handleRefresh,
  handleDownloadMonthlyReport
}) {
  return (
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
  );
}
