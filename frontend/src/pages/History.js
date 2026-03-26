import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../services/api';

const METHOD_COLORS = { GET: 'var(--accent-green)', POST: 'var(--accent-blue)', PUT: 'var(--accent-yellow)', PATCH: 'var(--accent-purple)', DELETE: 'var(--accent-red)' };

export default function History() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    testService.getHistory()
      .then(res => setRuns(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = runs.filter(r => {
    if (filter === 'PASS') return r.result?.passed === true;
    if (filter === 'FAIL') return r.result?.passed === false;
    if (filter === 'RUNNING') return r.status === 'RUNNING';
    return true;
  });

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, letterSpacing: '2px' }}>TEST HISTORY</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{runs.length} total runs</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'PASS', 'FAIL', 'RUNNING'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: '11px', letterSpacing: '1px',
              background: filter === f ? 'var(--accent-green-dim)' : 'var(--bg-card)',
              border: filter === f ? '1px solid var(--accent-green)' : '1px solid var(--border)',
              color: filter === f ? 'var(--accent-green)' : 'var(--text-muted)',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
              {['ENDPOINT', 'METHOD', 'STATUS CODE', 'RESPONSE TIME', 'THROUGHPUT', 'RESULT', 'CREATED AT'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: '20px' }}>⟳</div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '2px' }}>NO RUNS FOUND</td></tr>
            ) : filtered.map(run => (
              <tr key={run.id} onClick={() => navigate(`/test/${run.id}`)}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 16px', maxWidth: '250px' }}>
                  <div style={{ color: 'var(--accent-blue)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.endpoint}</div>
                  {run.description && <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{run.description}</div>}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: `${METHOD_COLORS[run.method]}22`, color: METHOD_COLORS[run.method] || 'var(--text-muted)' }}>{run.method}</span>
                </td>
                <td style={{ padding: '14px 16px', color: run.result?.statusCode >= 400 ? 'var(--accent-red)' : 'var(--accent-green)', fontSize: '13px', fontWeight: 600 }}>{run.result?.statusCode || '—'}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>{run.result?.responseTimeMs ? `${run.result.responseTimeMs}ms` : '—'}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>{run.result?.throughput ? `${run.result.throughput.toFixed(2)}/s` : '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '4px', fontSize: '10px', letterSpacing: '1px',
                    background: run.status === 'RUNNING' ? 'var(--accent-yellow-dim)' : run.result?.passed ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                    color: run.status === 'RUNNING' ? 'var(--accent-yellow)' : run.result?.passed ? 'var(--accent-green)' : 'var(--accent-red)',
                  }}>
                    {run.status === 'RUNNING' ? '⟳ RUNNING' : run.result?.passed ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '11px' }}>
                  {new Date(run.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}