import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ShieldCheck, AlertTriangle, Hammer, ShieldAlert } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Analytics({ analytics }) {
  if (!analytics) return <div style={{ padding: '20px' }}>Loading system metrics...</div>;

  const { summary, zoningBreakdown, statusBreakdown, violationBreakdown } = analytics;

  // ChartJS global font styling
  ChartJS.defaults.color = '#cbd5e1';
  ChartJS.defaults.font.family = 'Inter';

  // 1. Zoning breakdown Bar Chart data
  const zoningChartData = {
    labels: zoningBreakdown.map(z => z.name),
    datasets: [
      {
        label: 'Monitored Sites',
        data: zoningBreakdown.map(z => z.value),
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderColor: 'var(--accent-primary)',
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  };

  const zoningChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { stepSize: 1 }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // 2. Status Doughnut Chart data
  const statusColorsMap = {
    'Authorized': 'rgba(16, 185, 129, 0.65)',
    'Under Review': 'rgba(245, 158, 11, 0.65)',
    'Violation Confirmed': 'rgba(239, 68, 68, 0.65)',
    'Stop Work Order': 'rgba(249, 115, 22, 0.65)',
    'Demolition Scheduled': 'rgba(139, 92, 246, 0.65)',
    'Resolved': 'rgba(59, 130, 246, 0.65)'
  };

  const statusBorderColorsMap = {
    'Authorized': '#10b981',
    'Under Review': '#f59e0b',
    'Violation Confirmed': '#ef4444',
    'Stop Work Order': '#f97316',
    'Demolition Scheduled': '#8b5cf6',
    'Resolved': '#3b82f6'
  };

  const doughnutChartData = {
    labels: statusBreakdown.map(s => s.name),
    datasets: [
      {
        data: statusBreakdown.map(s => s.value),
        backgroundColor: statusBreakdown.map(s => statusColorsMap[s.name] || 'rgba(107, 114, 128, 0.65)'),
        borderColor: statusBreakdown.map(s => statusBorderColorsMap[s.name] || '#6b7280'),
        borderWidth: 1.5,
        hoverOffset: 4
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 14,
          font: { size: 11 }
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }} className="animate-slide-in">
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
            <Hammer size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Monitored</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', marginTop: '4px' }}>{summary.total}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--status-review)' }}>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-review)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Under Review</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', marginTop: '4px' }}>{summary.underReview}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--status-violation)' }}>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-violation)' }} className="pulse-glow-border">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Violations</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', marginTop: '4px', color: 'var(--status-violation)' }}>
              {summary.activeViolations}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--status-authorized)' }}>
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-authorized)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Authorized Cases</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', marginTop: '4px', color: 'var(--status-authorized)' }}>
              {summary.authorized + summary.resolved}
            </div>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Monitored Sites by Zoning Zone</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distribution of monitored buildings across municipal sectors</p>
          </div>
          <div style={{ height: '240px', position: 'relative' }}>
            <Bar data={zoningChartData} options={zoningChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Structure Classification Status</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current enforcement and municipal approval states</p>
          </div>
          <div style={{ height: '240px', position: 'relative' }}>
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>

      </div>

      {/* Violation Types Grid */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Active Violation Typologies</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {violationBreakdown.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>No active zoning violations recorded.</div>
          ) : (
            violationBreakdown.map(v => (
              <div 
                key={v.name} 
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{v.name}</span>
                <span className="badge badge-violation" style={{ padding: '2px 8px', borderRadius: '4px' }}>{v.value}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
