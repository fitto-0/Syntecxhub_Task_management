import React from 'react';
import { FiMoreVertical, FiRefreshCw, FiDownload, FiZap, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

export default function ProjectsAnalyticsWidget({
  stats,
  widgetMenuOpen,
  setWidgetMenuOpen,
  handleRefresh
}) {
  return (
    <div className="widget projects-analytics-widget advanced-analytics">
      <div className="widget-header">
        <div className="header-title-group">
          <h2>Projects Analytics</h2>
          <div className="health-badge">
            <span className="dot" />
            Health: {stats.healthScore}%
          </div>
        </div>
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
        {/* Main 4-Grid Stats */}
        <div className="projects-grid-stats">
          <div className="mini-stat-card active">
            <div className="mini-icon"><FiZap /></div>
            <div className="mini-info">
              <span className="val">{stats.activeProjects}</span>
              <span className="lbl">Active</span>
            </div>
          </div>
          <div className="mini-stat-card completed">
            <div className="mini-icon"><FiCheckCircle /></div>
            <div className="mini-info">
              <span className="val">{stats.completedProjects}</span>
              <span className="lbl">Done</span>
            </div>
          </div>
          <div className="mini-stat-card high-prio">
            <div className="mini-icon"><FiAlertCircle /></div>
            <div className="mini-info">
              <span className="val">{stats.highPriorityProjects}</span>
              <span className="lbl">High Prio</span>
            </div>
          </div>
          <div className="mini-stat-card stopped">
            <div className="mini-icon"><FiX /></div>
            <div className="mini-info">
              <span className="val">{stats.projectsStopped}</span>
              <span className="lbl">Stopped</span>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Bar */}
        <div className="priority-distribution">
          <div className="dist-label">Priority Distribution (Active)</div>
          <div className="dist-bar">
            <div className="segment high" style={{ width: `${(stats.highPriorityProjects / (stats.activeProjects || 1)) * 100}%` }} title="High" />
            <div className="segment med" style={{ width: `${(stats.medPriorityProjects / (stats.activeProjects || 1)) * 100}%` }} title="Medium" />
            <div className="segment low" style={{ width: `${(stats.lowPriorityProjects / (stats.activeProjects || 1)) * 100}%` }} title="Low" />
          </div>
          <div className="dist-legend">
            <span><i className="dot high" /> High</span>
            <span><i className="dot med" /> Med</span>
            <span><i className="dot low" /> Low</span>
          </div>
        </div>

        {/* Recent Projects Mini-List */}
        <div className="recent-projects-section">
          <div className="section-title">Recent Activity</div>
          <div className="mini-project-list">
            {stats.recentProjects && stats.recentProjects.length > 0 ? (
              stats.recentProjects.map(proj => (
                <div key={proj._id} className="mini-project-item">
                  <div className={`p-dot ${proj.status}`} />
                  <span className="p-name">{proj.title}</span>
                  <span className="p-time">
                    {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="no-projects">No recent activity</div>
            )}
          </div>
        </div>

        {/* Overall Completion Gauge */}
        <div className="overall-completion-section">
          <div className="gauge-header">
            <span>Overall Completion</span>
            <span className="percent">{stats.projectCompletionRate}%</span>
          </div>
          <div className="gauge-container">
            <div 
              className="gauge-fill" 
              style={{ width: `${stats.projectCompletionRate}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
