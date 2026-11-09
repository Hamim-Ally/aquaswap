import React, { useState, useMemo } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Building2,
  Droplets,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Truck,
  AlertCircle,
  Loader2,
  Search,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { authAPI } from '../services/api.js';
import { MOCK_ACCOUNTS } from '../data/mockAccounts.js';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'demo',
  onLoginSuccess,
  clusters = []
}) {
  const [mode, setMode] = useState(initialMode); // 'demo', 'signin', 'signup'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Minimalist filters for mock accounts
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'supplier', 'buyer'

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up Form State
  const [factoryName, setFactoryName] = useState('');
  const [factoryRole, setFactoryRole] = useState('supplier');
  const [selectedClusterId, setSelectedClusterId] = useState(clusters[0]?.id || 'dhaka-gazipur');
  const [sector, setSector] = useState('Textile Dyeing & Wet Processing');
  const [dailyVolume, setDailyVolume] = useState(500);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
    setSearchQuery('');
    setRoleFilter('all');
  }, [initialMode, isOpen]);

  // Filtered mock accounts (minimalist)
  const filteredMockAccounts = useMemo(() => {
    return MOCK_ACCOUNTS.filter((acc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        acc.name.toLowerCase().includes(q) ||
        acc.industry.toLowerCase().includes(q) ||
        acc.clusterName.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'all' || acc.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [searchQuery, roleFilter]);

  const supplierCount = MOCK_ACCOUNTS.filter((a) => a.role === 'supplier').length;
  const buyerCount = MOCK_ACCOUNTS.filter((a) => a.role === 'buyer').length;

  const handleQuickDemoLogin = async (acc) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await authAPI.demoLogin(acc);
      onLoginSuccess(result.user);
      onClose();
    } catch (err) {
      console.warn('Backend demo-login fallback to local:', err.message);
      onLoginSuccess(acc);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await authAPI.signin(loginEmail, loginPassword);
      onLoginSuccess(result.user);
      onClose();
    } catch (err) {
      console.error('Signin error:', err);
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!factoryName.trim()) {
      setErrorMessage('Please enter your facility name.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const payload = {
        email: signupEmail || `ops@${factoryName.toLowerCase().replace(/[^a-z0-9]/g, '')}.bd`,
        password: signupPassword,
        facility_name: factoryName.trim(),
        role: factoryRole,
        cluster_id: selectedClusterId,
        sector: sector,
        daily_volume: Number(dailyVolume) || 500
      };

      const result = await authAPI.signup(payload);
      onLoginSuccess(result.user, true);
      onClose();
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mode === 'demo' ? <Sparkles size={16} /> : mode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {mode === 'demo' ? 'Quick Mock Login' : mode === 'signin' ? 'Sign In' : 'Register Plant'}
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {mode === 'demo' ? '1-click simulation for 16 company types' : 'AquaSwap Plant Portal'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px', borderRadius: '50%' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Clean 3-Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr 1fr',
            background: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            gap: '3px'
          }}
        >
          <button
            type="button"
            onClick={() => setMode('demo')}
            style={{
              padding: '6px 8px',
              borderRadius: '5px',
              border: 'none',
              background: mode === 'demo' ? '#ffffff' : 'transparent',
              color: mode === 'demo' ? '#0284c7' : 'var(--text-muted)',
              fontWeight: mode === 'demo' ? 700 : 500,
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              boxShadow: mode === 'demo' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Sparkles size={13} />
            <span>Mock Login</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('signin')}
            style={{
              padding: '6px 8px',
              borderRadius: '5px',
              border: 'none',
              background: mode === 'signin' ? '#ffffff' : 'transparent',
              color: mode === 'signin' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: mode === 'signin' ? 700 : 500,
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              boxShadow: mode === 'signin' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <LogIn size={13} />
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('signup')}
            style={{
              padding: '6px 8px',
              borderRadius: '5px',
              border: 'none',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: mode === 'signup' ? 700 : 500,
              fontSize: '0.76rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <UserPlus size={13} />
            <span>Register</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.76rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: MINIMALIST 1-CLICK MOCK ACCOUNTS */}
        {/* ========================================================================= */}
        {mode === 'demo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Minimalist Search & Role Filter Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '9px', top: '9px' }} />
                <input
                  type="text"
                  placeholder="Filter by company, industry, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 28px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.78rem',
                    background: '#f8fafc'
                  }}
                />
              </div>

              {/* Compact Role Toggle */}
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '5px', padding: '2px', border: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  style={{
                    border: 'none',
                    background: roleFilter === 'all' ? '#ffffff' : 'transparent',
                    color: roleFilter === 'all' ? '#0f172a' : '#64748b',
                    fontWeight: roleFilter === 'all' ? 700 : 500,
                    fontSize: '0.72rem',
                    padding: '3px 7px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('supplier')}
                  style={{
                    border: 'none',
                    background: roleFilter === 'supplier' ? '#ffffff' : 'transparent',
                    color: roleFilter === 'supplier' ? '#0284c7' : '#64748b',
                    fontWeight: roleFilter === 'supplier' ? 700 : 500,
                    fontSize: '0.72rem',
                    padding: '3px 7px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Suppliers ({supplierCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('buyer')}
                  style={{
                    border: 'none',
                    background: roleFilter === 'buyer' ? '#ffffff' : 'transparent',
                    color: roleFilter === 'buyer' ? '#059669' : '#64748b',
                    fontWeight: roleFilter === 'buyer' ? 700 : 500,
                    fontSize: '0.72rem',
                    padding: '3px 7px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Buyers ({buyerCount})
                </button>
              </div>
            </div>

            {/* Minimalist 1-Click Company Rows List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '360px',
                overflowY: 'auto',
                paddingRight: '2px'
              }}
            >
              {filteredMockAccounts.map((acc) => {
                const isSupplier = acc.role === 'supplier';
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(acc)}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      background: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = isSupplier ? '#38bdf8' : '#34d399';
                      e.currentTarget.style.background = isSupplier ? '#f0f9ff' : '#f0fdf4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    {/* Left: Role Icon & Company Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: isSupplier ? '#e0f2fe' : '#dcfce7',
                          color: isSupplier ? '#0284c7' : '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isSupplier ? <Droplets size={14} /> : <Building2 size={14} />}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {acc.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {acc.industry} • {acc.clusterName}
                        </div>
                      </div>
                    </div>

                    {/* Right: Volume & Role Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        {acc.volume} m³/d
                      </span>
                      <span
                        className={`status-pill ${isSupplier ? 'status-cyan' : 'status-emerald'}`}
                        style={{ fontSize: '0.65rem', padding: '1px 5px' }}
                      >
                        {isSupplier ? 'Supplier' : 'Buyer'}
                      </span>
                      <ArrowRight size={13} color="#94a3b8" />
                    </div>
                  </button>
                );
              })}

              {filteredMockAccounts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.78rem' }}>
                  No company found matching "{searchQuery}".
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', paddingTop: '2px' }}>
              💡 Click any company row to instantly simulate plant telemetry & dashboard view.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STANDARD PASSWORD SIGN IN */}
        {/* ========================================================================= */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Plant Operator Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="email"
                  required
                  placeholder="ops@apexhorizon.bd"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 12px 7px 32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Terminal Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 12px 7px 32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '9px', fontSize: '0.85rem', fontWeight: 700, marginTop: '4px', gap: '6px' }}
            >
              {isLoading ? <Loader2 size={15} className="spin" /> : <LogIn size={15} />}
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Plant Portal'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setMode('demo')}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
              >
                ← Back to 1-Click Mock Accounts
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: REGISTER NEW FACTORY */}
        {/* ========================================================================= */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Role Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFactoryRole('supplier')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: factoryRole === 'supplier' ? '2px solid #0284c7' : '1px solid var(--border-light)',
                  background: factoryRole === 'supplier' ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0284c7'
                }}
              >
                💧 Water Supplier
              </button>
              <button
                type="button"
                onClick={() => setFactoryRole('buyer')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: factoryRole === 'buyer' ? '2px solid #059669' : '1px solid var(--border-light)',
                  background: factoryRole === 'buyer' ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#059669'
                }}
              >
                🏗️ Water Buyer
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Factory Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Meghna Precast Pavers Ltd."
                value={factoryName}
                onChange={(e) => setFactoryName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                  Regional Cluster
                </label>
                <select
                  value={selectedClusterId}
                  onChange={(e) => setSelectedClusterId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.78rem',
                    background: '#ffffff'
                  }}
                >
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                  Daily Volume (m³/d)
                </label>
                <input
                  type="number"
                  min="25"
                  max="5000"
                  step="25"
                  required
                  value={dailyVolume}
                  onChange={(e) => setDailyVolume(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Industry Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.78rem',
                  background: '#ffffff'
                }}
              >
                <option value="Textile Dyeing & Wet Processing">Textile Dyeing & Wet Processing</option>
                <option value="Ready-Mix Concrete (ASTM C1602)">Ready-Mix Concrete (ASTM C1602)</option>
                <option value="Pharmaceutical Synthesis">Pharmaceutical Synthesis</option>
                <option value="Food & Beverage Processing">Food & Beverage Processing</option>
                <option value="Steel Quenching & Rolling">Steel Quenching & Rolling</option>
                <option value="Precast Concrete & Pavers">Precast Concrete & Pavers</option>
                <option value="Power Plant Cooling Towers">Power Plant Cooling Towers</option>
                <option value="Quarry Aggregate Wash">Quarry Aggregate Wash</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="ops@facility.bd"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '9px', fontSize: '0.85rem', fontWeight: 700, marginTop: '4px', gap: '6px' }}
            >
              {isLoading ? <Loader2 size={15} className="spin" /> : <ShieldCheck size={15} />}
              <span>{isLoading ? 'Registering...' : 'Register Factory'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
