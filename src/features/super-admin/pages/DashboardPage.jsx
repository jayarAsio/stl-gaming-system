// ============================================
// File: src/features/super-admin/pages/DashboardPage.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import '../styles/dashboard-page.css';

const DashboardPage = () => {
  const [ticketsPerMin, setTicketsPerMin] = useState(247);
  const [countdown, setCountdown] = useState({ hours: 3, minutes: 45, seconds: 22 });

  // Update tickets per min
  useEffect(() => {
    const timer = setInterval(() => {
      setTicketsPerMin(240 + Math.floor(Math.random() * 20));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours = hours > 0 ? hours - 1 : 3;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num) => String(num).padStart(2, '0');

  const hotNumbers = [
    { num: 7, count: 23 },
    { num: 14, count: 18 },
    { num: 23, count: 15 },
    { num: 9, count: 12 },
    { num: 31, count: 11 }
  ];

  const systemStatus = [
    { name: 'API Gateway', status: 'Operational', color: 'green' },
    { name: 'Database Cluster', status: 'Healthy', color: 'green' },
    { name: 'SMS Gateway', status: 'Degraded (87%)', color: 'orange' },
    { name: 'Payment Processor', status: 'Online', color: 'green' }
  ];

  return (
    <>
      {/* Quick Actions */}
      <div className="sa-dash-actions">
        <button className="sa-dash-action sa-dash-action-blue">
          ➕ New Draw
        </button>
        <button className="sa-dash-action sa-dash-action-green">
          ✓ Publish Result
        </button>
        <button className="sa-dash-action sa-dash-action-purple">
          💰 Process Payouts
        </button>
        <button className="sa-dash-action sa-dash-action-orange">
          📥 Generate Reports
        </button>
      </div>

      {/* KPI Cards */}
      <div className="sa-dash-kpi-grid">
        {/* Today's Revenue */}
        <div className="sa-card sa-dash-kpi">
          <div className="sa-dash-kpi-glow sa-dash-kpi-glow-green"></div>
          <div className="sa-dash-kpi-content">
            <div className="sa-dash-kpi-header">
              <div className="sa-dash-kpi-icon sa-dash-kpi-icon-green">💰</div>
              <span className="sa-dash-kpi-trend sa-dash-kpi-trend-up">↗ +12.5%</span>
            </div>
            <h3 className="sa-dash-kpi-value">₱2.45M</h3>
            <p className="sa-dash-kpi-label">Today's Revenue</p>
            <div className="sa-dash-progress">
              <div className="sa-dash-progress-bar sa-dash-progress-bar-green" style={{ width: '68%' }}></div>
            </div>
            <p className="sa-dash-progress-label">68% of daily target</p>
          </div>
        </div>

        {/* Active Players */}
        <div className="sa-card sa-dash-kpi">
          <div className="sa-dash-kpi-glow sa-dash-kpi-glow-blue"></div>
          <div className="sa-dash-kpi-content">
            <div className="sa-dash-kpi-header">
              <div className="sa-dash-kpi-icon sa-dash-kpi-icon-blue">👥</div>
              <span className="sa-dash-kpi-trend sa-dash-kpi-trend-up">↗ +8.3%</span>
            </div>
            <h3 className="sa-dash-kpi-value">12,847</h3>
            <p className="sa-dash-kpi-label">Active Players</p>
            <div className="sa-dash-chart-bars">
              <div className="sa-dash-chart-bar" style={{ height: '40%' }}></div>
              <div className="sa-dash-chart-bar" style={{ height: '65%' }}></div>
              <div className="sa-dash-chart-bar" style={{ height: '35%' }}></div>
              <div className="sa-dash-chart-bar" style={{ height: '80%' }}></div>
              <div className="sa-dash-chart-bar" style={{ height: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Today's Draws */}
        <div className="sa-card sa-dash-kpi">
          <div className="sa-dash-kpi-glow sa-dash-kpi-glow-purple"></div>
          <div className="sa-dash-kpi-content">
            <div className="sa-dash-kpi-header">
              <div className="sa-dash-kpi-icon sa-dash-kpi-icon-purple">🎲</div>
              <div className="sa-dash-status-dots">
                <span className="sa-dash-status-dot sa-dash-status-dot-green"></span>
                <span className="sa-dash-status-dot sa-dash-status-dot-orange"></span>
                <span className="sa-dash-status-dot sa-dash-status-dot-gray"></span>
              </div>
            </div>
            <h3 className="sa-dash-kpi-value">9/12</h3>
            <p className="sa-dash-kpi-label">Draws Completed</p>
            <div className="sa-dash-draw-list">
              <div className="sa-dash-draw-item">
                <span className="sa-dash-draw-time">Morning: 10:30</span>
                <span className="sa-dash-draw-status sa-dash-draw-status-complete">✓ Complete</span>
              </div>
              <div className="sa-dash-draw-item">
                <span className="sa-dash-draw-time">Afternoon: 16:00</span>
                <span className="sa-dash-draw-status sa-dash-draw-status-progress">⏳ In Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="sa-card sa-dash-kpi">
          <div className="sa-dash-kpi-glow sa-dash-kpi-glow-orange"></div>
          <div className="sa-dash-kpi-content">
            <div className="sa-dash-kpi-header">
              <div className="sa-dash-kpi-icon sa-dash-kpi-icon-orange">⚠️</div>
              <span className="sa-dash-risk-badge">MEDIUM</span>
            </div>
            <h3 className="sa-dash-kpi-value">3</h3>
            <p className="sa-dash-kpi-label">High Risk Combos</p>
            <div className="sa-dash-risk-item">
              <div className="sa-dash-risk-header">
                <span className="sa-dash-risk-combo">12-34 (Pares)</span>
                <span className="sa-dash-risk-amount">₱48K/₱50K</span>
              </div>
              <div className="sa-dash-progress">
                <div className="sa-dash-progress-bar sa-dash-progress-bar-risk" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Live Metrics */}
      <div className="sa-dash-charts-grid">
        {/* Sales Performance Chart */}
        <div className="sa-card sa-dash-chart-wide">
          <div className="sa-dash-section-header">
            <h3 className="sa-dash-section-title">Sales Performance</h3>
            <select className="sa-dash-select">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
            </select>
          </div>
          <div className="sa-dash-chart-placeholder">
            <p>📊 Chart.js integration needed</p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="sa-card">
          <h3 className="sa-dash-section-title">Live Metrics</h3>
          <div className="sa-dash-metrics">
            <div className="sa-dash-metric-card">
              <div className="sa-dash-metric-header">
                <span className="sa-dash-metric-label">Ticket Sales/min</span>
                <span className="sa-dash-metric-value sa-dash-metric-value-green">{ticketsPerMin}</span>
              </div>
              <div className="sa-dash-progress">
                <div className="sa-dash-progress-bar sa-dash-progress-bar-green" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="sa-dash-metric-card">
              <div className="sa-dash-metric-header">
                <span className="sa-dash-metric-label">System Load</span>
                <span className="sa-dash-metric-value sa-dash-metric-value-blue">42%</span>
              </div>
              <div className="sa-dash-progress">
                <div className="sa-dash-progress-bar sa-dash-progress-bar-blue" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div className="sa-dash-countdown">
              <p className="sa-dash-countdown-label">Next Draw</p>
              <p className="sa-dash-countdown-time">
                {formatTime(countdown.hours)}:{formatTime(countdown.minutes)}:{formatTime(countdown.seconds)}
              </p>
              <p className="sa-dash-countdown-info">Evening Draw • 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Draw Results */}
      <div className="sa-card sa-dash-results">
        <div className="sa-dash-section-header">
          <h3 className="sa-dash-section-title">Recent Draw Results</h3>
          <button className="sa-dash-view-all">View All →</button>
        </div>
        <div className="sa-dash-results-list">
          <div className="sa-dash-result-item">
            <div className="sa-dash-result-left">
              <div className="sa-dash-result-icon sa-dash-result-icon-complete">✓</div>
              <div>
                <p className="sa-dash-result-title">Swertres - Morning Draw</p>
                <p className="sa-dash-result-time">10:30 AM • January 15, 2025</p>
              </div>
            </div>
            <div className="sa-dash-result-right">
              <p className="sa-dash-result-number">4-2-7</p>
              <p className="sa-dash-result-info">23 winners • ₱230K payout</p>
            </div>
          </div>

          <div className="sa-dash-result-item">
            <div className="sa-dash-result-left">
              <div className="sa-dash-result-icon sa-dash-result-icon-progress">⏳</div>
              <div>
                <p className="sa-dash-result-title">Last 2 - Afternoon Draw</p>
                <p className="sa-dash-result-time">4:00 PM • In Progress</p>
              </div>
            </div>
            <div className="sa-dash-result-right">
              <p className="sa-dash-result-number sa-dash-result-number-pending">●●●</p>
              <p className="sa-dash-result-info">Drawing in 15 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="sa-dash-bottom-grid">
        {/* Hot Numbers */}
        <div className="sa-card">
          <h3 className="sa-dash-section-title">Hot Numbers Today</h3>
          <div className="sa-dash-hot-numbers">
            {hotNumbers.map((item, i) => (
              <div key={i} className={`sa-dash-hot-number ${i < 2 ? 'sa-dash-hot-number-hot' : ''}`}>
                <p className="sa-dash-hot-number-value">{item.num}</p>
                <p className="sa-dash-hot-number-count">x{item.count}</p>
              </div>
            ))}
          </div>
          <div className="sa-dash-alert">
            <p>ℹ️ Combination 7-14-23 approaching exposure limit</p>
          </div>
        </div>

        {/* System Status */}
        <div className="sa-card">
          <h3 className="sa-dash-section-title">System Status</h3>
          <div className="sa-dash-status-list">
            {systemStatus.map((item, i) => (
              <div key={i} className="sa-dash-status-item">
                <div className="sa-dash-status-left">
                  <span className={`sa-dash-status-indicator sa-dash-status-indicator-${item.color}`}></span>
                  <span className="sa-dash-status-name">{item.name}</span>
                </div>
                <span className={`sa-dash-status-text sa-dash-status-text-${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;