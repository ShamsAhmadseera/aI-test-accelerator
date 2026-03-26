import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/', label: 'DASHBOARD', icon: '◈' },
  { path: '/run', label: 'TEST RUNNER', icon: '▶' },
  { path: '/history', label: 'HISTORY', icon: '◷' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '60px' : '220px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 0' : '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '2px' }}>QA COMMAND</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '3px' }}>CENTER</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: '18px', padding: '4px', borderRadius: '4px',
            transition: 'color var(--transition)',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--accent-green)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >{collapsed ? '▷' : '◁'}</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {NAV.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: collapsed ? '14px 0' : '14px 20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-green-dim)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent-green)' : '2px solid transparent',
              fontSize: '11px', letterSpacing: '1.5px', fontWeight: 500,
              transition: 'all var(--transition)',
            })}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: '1px solid var(--border)', padding: collapsed ? '16px 0' : '16px 20px' }}>
          {!collapsed && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>LOGGED IN AS</div>
              <div style={{ color: 'var(--accent-green)', fontSize: '12px', fontWeight: 500 }}>{user?.username}</div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: collapsed ? '36px' : '100%', height: '36px',
            background: 'var(--accent-red-dim)', border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)', borderRadius: 'var(--radius)',
            fontSize: '11px', letterSpacing: '1px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,106,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-red-dim)'}
          >
            <span>⏻</span>{!collapsed && 'LOGOUT'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
        <Outlet />
      </main>
    </div>
  );
}