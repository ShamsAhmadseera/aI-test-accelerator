import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { authService } = require('../services/api');

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
        navigate('/');
      } else {
        const { authService } = await import('../services/api');
        await authService.register(form.username, form.password, form.email);
        setMode('login');
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--accent-green) 1px, transparent 1px), linear-gradient(90deg, var(--accent-green) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />

      <div style={{ position: 'relative', width: '400px', animation: 'fadeIn 0.5s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '4px' }}>QA COMMAND</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '6px', marginTop: '4px' }}>CENTER</div>
          <div style={{ width: '60px', height: '2px', background: 'var(--accent-green)', margin: '16px auto 0', boxShadow: 'var(--shadow-glow-green)' }} />
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '32px',
          boxShadow: 'var(--shadow), var(--shadow-glow-green)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '28px', borderBottom: '1px solid var(--border)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '10px', background: 'none', border: 'none',
                color: mode === m ? 'var(--accent-green)' : 'var(--text-muted)',
                borderBottom: mode === m ? '2px solid var(--accent-green)' : '2px solid transparent',
                fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                transition: 'all var(--transition)', marginBottom: '-1px',
              }}>{m}</button>
            ))}
          </div>

          <form onSubmit={handle}>
            {['username', ...(mode === 'register' ? ['email'] : []), 'password'].map(field => (
              <div key={field} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase' }}>{field}</label>
                <input
                  type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  value={form[field]}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  required
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', color: 'var(--text-primary)',
                    fontSize: '13px', outline: 'none', transition: 'border-color var(--transition)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}

            {error && (
              <div style={{ padding: '10px', background: 'var(--accent-red-dim)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius)', color: 'var(--accent-red)', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? 'var(--bg-hover)' : 'var(--accent-green-dim)',
              border: '1px solid var(--accent-green)',
              borderRadius: 'var(--radius)', color: 'var(--accent-green)',
              fontSize: '12px', letterSpacing: '2px', fontWeight: 600,
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(0,255,136,0.25)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--accent-green-dim)')}
            >
              {loading ? '⟳ PROCESSING...' : mode === 'login' ? '▶ AUTHENTICATE' : '+ CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
          QA COMMAND CENTER v1.0.0
        </div>
      </div>
    </div>
  );
}