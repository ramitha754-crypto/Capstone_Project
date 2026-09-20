import React from 'react';
import { 
  Layers, 
  Inbox, 
  Cpu, 
  GitPullRequest, 
  BarChart3, 
  Sun,
  Moon,
  LogOut,
  Users,
  History
} from 'lucide-react';
import type { UserPersona } from '../../types/feedback';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserPersona;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
  allowedTabs: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  allowedTabs,
}) => {
  return (
    <aside className="app-sidebar" style={{
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border-medium)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      zIndex: 40,
      transition: 'background-color 0.25s ease, border-color 0.25s ease'
    }}>
      {/* Brand Section */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          cursor: 'pointer', 
          padding: '0 20px',
          marginBottom: '32px'
        }}
        onClick={() => setCurrentTab('feedback')}
        title="PulseBoard Home"
      >
        <div style={{
          width: '38px',
          height: '38px',
          backgroundColor: 'var(--text-primary)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-inverse)',
          fontWeight: 700,
          boxShadow: 'var(--shadow-sm)',
          flexShrink: 0
        }}>
          <Layers size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Pulse<span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>Board</span>
            </span>
          </div>
          <div className="header-brand-subtitle" style={{ fontSize: '0.65rem' }}>
            <span className="pulse-dot" style={{ marginRight: 6 }}></span>
            <span>PulseBoard v4.2</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
        {allowedTabs.includes('feedback') && (
          <button
            className={`btn ${currentTab === 'feedback' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('feedback')}
            style={{ justifyContent: 'flex-start', padding: '10px 16px' }}
          >
            <Inbox size={18} style={{ marginRight: '12px' }} />
            <span>Feedback Ingestion</span>
          </button>
        )}

        {allowedTabs.includes('encapsulation') && (
          <button
            className={`btn ${currentTab === 'encapsulation' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('encapsulation')}
            style={{ justifyContent: 'flex-start', padding: '10px 16px' }}
          >
            <Cpu size={18} style={{ marginRight: '12px' }} />
            <span>Encapsulation Engine</span>
          </button>
        )}

        {allowedTabs.includes('workflow') && (
          <button
            className={`btn ${currentTab === 'workflow' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('workflow')}
            style={{ justifyContent: 'flex-start', padding: '10px 16px' }}
          >
            <GitPullRequest size={18} style={{ marginRight: '12px' }} />
            <span>Workflow Pipeline</span>
          </button>
        )}

        {allowedTabs.includes('analytics') && (
          <button
            className={`btn ${currentTab === 'analytics' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('analytics')}
            style={{ justifyContent: 'flex-start', padding: '10px 16px' }}
          >
            <BarChart3 size={18} style={{ marginRight: '12px' }} />
            <span>SLA & Analytics</span>
          </button>
        )}

        {allowedTabs.includes('users') && (
          <button
            className={`btn ${currentTab === 'users' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('users')}
            style={{ justifyContent: 'flex-start', padding: '10px 16px' }}
          >
            <Users size={18} style={{ marginRight: '12px' }} />
            <span>User Management</span>
          </button>
        )}

        {allowedTabs.includes('audit') && (
          <button
            className={`btn ${currentTab === 'audit' ? 'active' : 'btn-ghost'}`}
            onClick={() => setCurrentTab('audit')}
            style={{ justifyContent: 'flex-start', padding: '10px 16px' }}
          >
            <History size={18} style={{ marginRight: '12px' }} />
            <span>Audit Log</span>
          </button>
        )}
      </nav>

      {/* Bottom Section: Theme & User */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-medium)', marginTop: 'auto' }}>
        
        {/* User Persona Setup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-card-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)'
          }}>
            {currentUser.avatar}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser.title}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-outline"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            style={{ flex: 1, height: '36px' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span style={{ fontSize: '0.75rem', marginLeft: '6px' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          
          <button 
            className="btn btn-ghost"
            onClick={onLogout}
            title="Logout"
            style={{ height: '36px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
