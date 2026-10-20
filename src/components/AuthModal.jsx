import React, { useState } from 'react';
import { X, UserPlus, LogIn, Building2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { user, signup, login } = useAuth();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup(email, password, company);
      } else {
        await login(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#0d1322',
          border: '1px solid rgba(14, 165, 233, 0.35)',
          padding: '26px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              {mode === 'signup' ? 'Create Your AquaSwap Account' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {mode === 'signup'
                ? 'One account for all your factory registrations'
                : 'Sign in to manage your registered factories'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '4px', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', padding: '10px 0' }}>
            <CheckCircle2 size={34} color="#34d399" style={{ margin: '0 auto' }} />
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
              Already signed in as <strong style={{ color: '#fff' }}>{user.email}</strong>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onClose} style={{ justifyContent: 'center' }}>
              Continue
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`tab-pill ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => switchMode('signup')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <UserPlus size={14} /> Sign Up
              </button>
              <button
                className={`tab-pill ${mode === 'login' ? 'active' : ''}`}
                onClick={() => switchMode('login')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <LogIn size={14} /> Log In
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Business Email:
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@factory.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Company (optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Green Valley Mills Ltd"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Password (min 6 characters):
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: '#fb7185'
                  }}
                >
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={busy} style={{ justifyContent: 'center' }}>
                <Building2 size={15} />
                <span>{busy ? 'Please wait…' : mode === 'signup' ? 'Create Account & Register Factory' : 'Log In'}</span>
              </button>
            </form>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              Your data is stored in the local AquaSwap database and can be migrated to the cloud later.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
