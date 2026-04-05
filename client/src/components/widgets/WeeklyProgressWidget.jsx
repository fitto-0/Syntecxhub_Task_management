import React from 'react';
import { FiMoreVertical, FiRefreshCw, FiBarChart2, FiDownload, FiActivity, FiCheckCircle } from 'react-icons/fi';

export default function WeeklyProgressWidget({
  weeklyProgress,
  widgetMenuOpen,
  setWidgetMenuOpen,
  handleRefresh,
  handleDownloadWeeklyReport
}) {
  const { weekData, totalCompleted, totalCreated, averagePerDay, bestDay, productivityScore } = weeklyProgress;

  // Chart Constants
  const width = 300;
  const height = 120;
  const paddingX = 20;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate Max Value for Scaling
  const rawMax = Math.max(...weekData.map(d => Math.max(d.completed, d.created)));
  const maxValue = rawMax === 0 ? 5 : Math.ceil(rawMax * 1.2);

  // Coordinate Helpers
  const getX = (index) => paddingX + (index * (chartWidth / (weekData.length - 1)));
  const getY = (value) => paddingY + (chartHeight - (value / maxValue) * chartHeight);

  // Generate Path Data
  const completedPath = weekData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.completed)}`).join(' ');
  const createdPath = weekData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.created)}`).join(' ');
  const areaPath = `${completedPath} L ${getX(weekData.length - 1)} ${paddingY + chartHeight} L ${getX(0)} ${paddingY + chartHeight} Z`;

  return (
    <div className="widget weekly-progress-widget">
      <div className="widget-header">
        <div className="header-title-group">
          <h2>Weekly Progress</h2>
          <div className="weekly-stats-mini">
            <span className="count-pill green">{totalCompleted} Done</span>
            <span className="count-pill blue">{totalCreated} New</span>
          </div>
        </div>
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
              <button onClick={() => { setWidgetMenuOpen(null); handleRefresh(); }}>
                <FiRefreshCw /> Refresh
              </button>
              <button onClick={() => { setWidgetMenuOpen(null); handleDownloadWeeklyReport(); }}>
                <FiDownload /> Export PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="widget-body">
        <div className="chart-container-svg">
          <svg viewBox={`0 0 ${width} ${height}`} className="main-chart-svg">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
              <line 
                key={i} 
                x1={paddingX} 
                y1={paddingY + (p * chartHeight)} 
                x2={width - paddingX} 
                y2={paddingY + (p * chartHeight)} 
                className="chart-grid-line" 
              />
            ))}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#areaGradient)" filter="blur(2px)" />

            {/* Lines */}
            <path d={createdPath} className="path-created" fill="none" />
            <path d={completedPath} className="path-completed" fill="none" />

            {/* Data Points */}
            {weekData.map((d, i) => (
              <g key={i}>
                <circle 
                  cx={getX(i)} 
                  cy={getY(d.completed)} 
                  r="3.5" 
                  className={`dot-completed ${d.day === bestDay.day ? 'best-dot' : ''}`}
                >
                  <title>{`${d.day}: ${d.completed} completed`}</title>
                </circle>
                {d.day === bestDay.day && (
                  <circle 
                    cx={getX(i)} 
                    cy={getY(d.completed)} 
                    r="8" 
                    className="dot-pulse" 
                  />
                )}
              </g>
            ))}
          </svg>

          {/* X-Axis Labels */}
          <div className="chart-x-labels">
            {weekData.map((d, i) => (
              <span key={i} className={d.day === bestDay.day ? 'active-day' : ''}>
                {d.day.charAt(0)}
              </span>
            ))}
          </div>
        </div>

        <div className="weekly-metrics">
          <div className="metric-box">
            <div className="metric-icon best"><FiActivity /></div>
            <div className="metric-info">
              <span className="m-label">PEAK DAY</span>
              <span className="m-val">{bestDay.day}</span>
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-icon score"><FiCheckCircle /></div>
            <div className="metric-info">
              <span className="m-label">EFFICIENCY</span>
              <span className="m-val">{productivityScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
