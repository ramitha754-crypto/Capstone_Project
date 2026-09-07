import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  Sun, 
  Moon, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Shield, 
  UserPlus, 
  LogIn,
  CheckCircle2
} from 'lucide-react';
import type { UserPersona } from '../../types/feedback';

interface LoginProps {
  onLogin: (user: UserPersona) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, theme, onToggleTheme }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Sign In form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Status & Error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Real-time password requirement checks (matches backend policy: 16+ chars, upper, lower, special char)
  const passwordCriteria = {
    length: regPassword.length >= 16,
    lower: /[a-z]/.test(regPassword),
    upper: /[A-Z]/.test(regPassword),
    special: /[^A-Za-z0-9]/.test(regPassword),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const passwordsMatch = regPassword === regConfirmPassword && regConfirmPassword.length > 0;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: loginUsername.trim(), 
          password: loginPassword 
        }),
      });

      let data: any = {};
      const responseText = await response.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        const message = data.error || 'Please check your username and password and try again.';
        throw new Error(message);
      }

      onLogin(data as UserPersona);
    } catch (err: any) {
      setError(err.message || 'Please check your username and password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!regName.trim() || !regUsername.trim() || !regPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regUsername.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must meet all 4 security criteria shown below.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: regName.trim(),
          username: regUsername.trim(),
          email: regEmail.trim() || undefined,
          title: regTitle.trim() || undefined,
          password: regPassword,
        }),
      });

      let data: any = {};
      const responseText = await response.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setSuccessMessage('Account registered successfully! Logging you in...');
      
      // Seamlessly log the user into the application
      setTimeout(() => {
        onLogin(data as UserPersona);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top Corner Theme Switcher */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
        <button
          className="btn btn-outline"
          onClick={onToggleTheme}
          style={{ height: '36px', fontSize: '0.8rem', padding: '0 12px' }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
      </div>

      {/* Background Monochromatic Radial Glow Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 30%, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: mode === 'register' ? '500px' : '420px',
        position: 'relative',
        zIndex: 1,
        transition: 'max-width 0.25s ease',
      }}>
        {/* Top Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--text-primary)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-inverse)',
            marginBottom: '14px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <Layers size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Pulse<span style={{ fontWeight: 300, color: 'var(--text-secondary)' }}>Board</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enterprise Customer Feedback & Spec Workflow
          </p>
        </div>

        {/* Main Monochromatic Card */}
        <div className="glass-panel" style={{ padding: mode === 'register' ? '28px 32px' : '32px' }}>
          
          {/* Segmented Auth Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-card-active)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid var(--border-medium)'
          }}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: mode === 'login' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('register')}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: mode === 'register' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <UserPlus size={15} />
              <span>Register</span>
            </button>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Customer Account'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mode === 'login' 
                ? 'Sign in to access your feedback portal' 
                : 'Register to submit issues, feature requests, and track team responses'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.85rem',
              lineHeight: 1.4
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              color: '#22c55e',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ── MODE 1: LOGIN FORM ── */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Username
                </label>
                <input
                  type="text"
                  className="input"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  placeholder="e.g. admin or your username"
                  autoComplete="username"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {showLoginPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showLoginPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="••••••••••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ width: '100%', height: '44px', fontSize: '0.9rem', marginBottom: '20px' }}
              >
                {isLoading ? 'Authenticating...' : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Register here
                </button>
              </div>
            </form>
          ) : (
            /* ── MODE 2: REGISTER FORM ── */
            <form onSubmit={handleRegisterSubmit}>
              {/* Role information note */}
              <div style={{
                backgroundColor: 'var(--bg-card-active)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Shield size={16} style={{ color: 'var(--text-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Customer Representative Access:</strong> Registered accounts are automatically assigned the Customer Representative role. You will be able to submit product feedback and view engineering & triage status updates.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="e.g. David Chen"
                  />
                </div>

                {/* Username */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    placeholder="e.g. david_chen"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Work Email Address
                </label>
                <input
                  type="email"
                  className="input"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. dchen@acmefinancial.com"
                  autoComplete="email"
                />
              </div>

              {/* Title / Organization */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Title / Organization
                </label>
                <input
                  type="text"
                  className="input"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  placeholder="e.g. VP Technology (Acme Financial)"
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {showRegPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showRegPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  className="input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="Must be 16+ chars, mixed case, special char"
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Confirm Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {showRegConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showRegConfirmPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  className="input"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                {regConfirmPassword.length > 0 && !passwordsMatch && (
                  <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '4px' }}>
                    Passwords do not match
                  </div>
                )}
              </div>

              {/* Interactive Password Strength Criteria Checklist */}
              <div style={{
                backgroundColor: 'var(--text-inverse)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                padding: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Security Policy Requirements
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.74rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordCriteria.length ? '#22c55e' : 'var(--text-muted)' }}>
                    {passwordCriteria.length ? <Check size={13} /> : <X size={13} />}
                    <span>16+ characters ({regPassword.length}/16)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordCriteria.upper ? '#22c55e' : 'var(--text-muted)' }}>
                    {passwordCriteria.upper ? <Check size={13} /> : <X size={13} />}
                    <span>Uppercase letter (A-Z)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordCriteria.lower ? '#22c55e' : 'var(--text-muted)' }}>
                    {passwordCriteria.lower ? <Check size={13} /> : <X size={13} />}
                    <span>Lowercase letter (a-z)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordCriteria.special ? '#22c55e' : 'var(--text-muted)' }}>
                    {passwordCriteria.special ? <Check size={13} /> : <X size={13} />}
                    <span>Special character (!@#$)</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !isPasswordValid || !passwordsMatch}
                style={{ width: '100%', height: '44px', fontSize: '0.9rem', marginBottom: '16px' }}
              >
                {isLoading ? 'Creating Account...' : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
