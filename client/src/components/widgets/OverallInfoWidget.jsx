import React from 'react';
import { FiMoreVertical, FiRefreshCw, FiDownload, FiBarChart2 } from 'react-icons/fi';

export default function OverallInfoWidget({ 
  stats, 
  widgetMenuOpen, 
  setWidgetMenuOpen, 
  handleRefresh, 
  handleDownloadReport 
}) {
  return (
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
  );
}
