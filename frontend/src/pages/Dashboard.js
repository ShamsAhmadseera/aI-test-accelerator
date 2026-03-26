import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { testService } from '../services/api';

const StatCard = ({ label, value, unit = '', color = 'var(--accent-green)', icon }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px',
    borderTop: `2px solid ${color}`, animation: 'fadeIn 0.4s ease',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color }}>{value}<span style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '4px' }}>{unit}</span></div>
      </div>
      <div style={{ fontSize: '28px', opacity: 0.6 }}>{icon}</div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '13px', color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, passed: 0, failed: 0, running: 0, passRate: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([testService.getStats(), testService.getRecent()]);
        setStats(statsRes.data);
        setRecent(recentRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  // Build chart data from recent runs
  const chartData = recent.slice().reverse().map((run, i) => ({
    name: `#${i + 1}`,
    responseTime: run.result?.responseTimeMs || 0,
    status: run.result?.statusCode || 0,
    throughput: parseFloat((run.result?.throughput || 0).toFixed(2)),
    errorRate: parseFloat((run.result?.errorRate || 0).toFixed(2)),
  }));

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, letterSpacing: '2px' }}>DASHBOARD</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Real-time performance & test intelligence</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LIVE — refreshes every 10s</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="TOTAL RUNS" value={stats.total} icon="◈" color="var(--accent-blue)" />
        <StatCard label="PASSED" value={stats.passed} icon="✓" color="var(--accent-green)" />
        <StatCard label="FAILED" value={stats.failed} icon="✗" color="var(--accent-red)" />
        <StatCard label="RUNNING" value={stats.running} icon="⟳" color="var(--accent-yellow)" />
        <StatCard label="PASS RATE" value={stats.passRate?.toFixed(1)} unit="%" icon="%" color="var(--accent-purple)" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {/* Response Time */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>RESPONSE TIME (ms)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="responseTime" stroke="var(--accent-green)" fill="url(#rtGrad)" strokeWidth={2} name="Response Time" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Throughput */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>THROUGHPUT (req/s)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="throughput" stroke="var(--accent-blue)" fill="url(#tpGrad)" strokeWidth={2} name="Throughput" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Error Rate */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>ERROR RATE (%)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="errorRate" fill="var(--accent-red)" opacity={0.8} name="Error Rate" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Codes */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px' }}>STATUS CODES</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="status" fill="var(--accent-purple)" opacity={0.8} name="Status Code" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Runs Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px' }}>RECENT RUNS</div>
          <button onClick={() => navigate('/run')} style={{
            padding: '8px 16px', background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)',
            borderRadius: 'var(--radius)', color: 'var(--accent-green)', fontSize: '11px', letterSpacing: '1px',
          }}>+ NEW RUN</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['ENDPOINT', 'METHOD', 'STATUS', 'RESPONSE TIME', 'RESULT', 'CREATED BY'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>LOADING...</td></tr>
            ) : recent.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>NO TEST RUNS YET — <span onClick={() => navigate('/run')} style={{ color: 'var(--accent-green)', cursor: 'pointer' }}>RUN YOUR FIRST TEST</span></td></tr>
            ) : recent.map(run => (
              <tr key={run.id} onClick={() => navigate(`/test/${run.id}`)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', color: 'var(--accent-blue)', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.endpoint}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, letterSpacing: '1px', background: run.method === 'GET' ? 'rgba(0,255,136,0.1)' : run.method === 'POST' ? 'rgba(77,159,255,0.1)' : 'rgba(255,216,77,0.1)', color: run.method === 'GET' ? 'var(--accent-green)' : run.method === 'POST' ? 'var(--accent-blue)' : 'var(--accent-yellow)' }}>{run.method}</span>
                </td>
                <td style={{ padding: '12px 16px', color: run.result?.statusCode >= 400 ? 'var(--accent-red)' : 'var(--accent-green)', fontSize: '13px' }}>{run.result?.statusCode || '-'}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>{run.result?.responseTimeMs ? `${run.result.responseTimeMs}ms` : '-'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', letterSpacing: '1px', background: run.status === 'COMPLETED' ? (run.result?.passed ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)') : 'var(--accent-yellow-dim)', color: run.status === 'COMPLETED' ? (run.result?.passed ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--accent-yellow)' }}>{run.status === 'COMPLETED' ? (run.result?.passed ? '✓ PASS' : '✗ FAIL') : run.status}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>{run.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}