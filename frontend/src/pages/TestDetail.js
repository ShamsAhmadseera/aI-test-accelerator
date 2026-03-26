import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../services/api';

const Tab = ({ label, active, onClick, color = 'var(--accent-green)' }) => (
  <button onClick={onClick} style={{
    padding: '10px 20px', background: 'none', border: 'none',
    color: active ? color : 'var(--text-muted)',
    borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
    fontSize: '11px', letterSpacing: '1.5px', transition: 'all 0.2s',
    marginBottom: '-1px',
  }}>{label}</button>
);

const CodeBlock = ({ code }) => (
  <div style={{ position: 'relative' }}>
    <button onClick={() => navigator.clipboard.writeText(code)} style={{
      position: 'absolute', top: '12px', right: '12px', zIndex: 1,
      padding: '4px 10px', background: 'var(--bg-primary)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontSize: '10px',
    }}>COPY</button>
    <pre style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      padding: '20px', overflow: 'auto', fontSize: '12px', lineHeight: '1.6',
      color: 'var(--text-primary)', maxHeight: '600px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    }}>{code || '// No code generated'}</pre>
  </div>
);

export default function TestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testService.getById(id)
      .then(res => setRun(res.data))
      .catch(() => navigate('/history'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '2px' }}>LOADING...</div>;
  if (!run) return null;

  const passed = run.result?.passed;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Back */}
      <button onClick={() => navigate('/history')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px', cursor: 'pointer', letterSpacing: '1px' }}>
        ← BACK TO HISTORY
      </button>

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, letterSpacing: '2px', marginBottom: '4px' }}>TEST RUN DETAILS</div>
          <div style={{ color: 'var(--accent-blue)', fontSize: '13px' }}>{run.endpoint}</div>
        </div>
        <span style={{
          padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: '12px', letterSpacing: '1px', fontWeight: 600,
          background: passed ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
          border: `1px solid ${passed ? 'var(--accent-green)' : 'var(--accent-red)'}`,
          color: passed ? 'var(--accent-green)' : 'var(--accent-red)',
        }}>{passed ? '✓ PASSED' : '✗ FAILED'}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <Tab label="OVERVIEW" active={tab === 'overview'} onClick={() => setTab('overview')} />
        <Tab label="RESTASSURED" active={tab === 'restassured'} onClick={() => setTab('restassured')} color="var(--accent-blue)" />
        <Tab label="GATLING" active={tab === 'gatling'} onClick={() => setTab('gatling')} color="var(--accent-purple)" />
        <Tab label="POSTMAN" active={tab === 'postman'} onClick={() => setTab('postman')} color="var(--accent-yellow)" />
      </div>

      {tab === 'overview' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'STATUS CODE', value: run.result?.statusCode, color: run.result?.statusCode >= 400 ? 'var(--accent-red)' : 'var(--accent-green)' },
              { label: 'RESPONSE TIME', value: `${run.result?.responseTimeMs}ms`, color: 'var(--accent-blue)' },
              { label: 'THROUGHPUT', value: `${run.result?.throughput?.toFixed(2)}/s`, color: 'var(--accent-purple)' },
              { label: 'ERROR RATE', value: `${run.result?.errorRate}%`, color: run.result?.errorRate > 0 ? 'var(--accent-red)' : 'var(--accent-green)' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '8px' }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: item.color }}>{item.value || '—'}</div>
              </div>
            ))}
          </div>

          {/* Request Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px' }}>REQUEST INFO</div>
              {[
                { k: 'Method', v: run.method },
                { k: 'Auth Type', v: run.authType },
                { k: 'Created By', v: run.createdBy },
                { k: 'Created At', v: new Date(run.createdAt).toLocaleString() },
                { k: 'Completed At', v: run.completedAt ? new Date(run.completedAt).toLocaleString() : '—' },
              ].map(({ k, v }) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{k}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '12px' }}>{v}</span>
                </div>
              ))}
            </div>

            {run.payload && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '12px' }}>REQUEST PAYLOAD</div>
                <pre style={{ fontSize: '12px', color: 'var(--text-primary)', overflow: 'auto', maxHeight: '200px', whiteSpace: 'pre-wrap' }}>
                  {(() => { try { return JSON.stringify(JSON.parse(run.payload), null, 2); } catch { return run.payload; } })()}
                </pre>
              </div>
            )}
          </div>

          {/* Response Body */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '12px' }}>RESPONSE BODY</div>
            <pre style={{ fontSize: '12px', color: 'var(--text-primary)', overflow: 'auto', maxHeight: '300px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {(() => { try { return JSON.stringify(JSON.parse(run.result?.responseBody), null, 2); } catch { return run.result?.responseBody || 'No response body'; } })()}
            </pre>
          </div>
        </div>
      )}

      {tab === 'restassured' && <CodeBlock code={run.generatedRestAssured} />}
      {tab === 'gatling' && <CodeBlock code={run.generatedGatling} />}
      {tab === 'postman' && <CodeBlock code={run.generatedPostman} />}
    </div>
  );
}