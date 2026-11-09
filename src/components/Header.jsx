import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Droplets,
  Building2,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  ChevronDown,
  User
} from 'lucide-react';

export default function Header({
  clusters,
  selectedCluster,
  setSelectedCluster,
  currentUser,
  onOpenSignIn,
  onOpenSignUp,
  onOpenMockAccounts,
  onLogout
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-light)',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        {/* Brand Logo & Name */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '7px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Droplets size={18} color="#0284c7" />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
            AquaSwap
          </span>
        </Link>

        {/* Multi-Page Navigation Bar */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexWrap: 'wrap'
          }}
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Overview
          </NavLink>

          <NavLink
            to="/optimizer"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Exchange Network
          </NavLink>

          <NavLink
            to="/blender"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Water Blender Lab
          </NavLink>

          <NavLink
            to="/fleet"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Fleet & Matchmaker
          </NavLink>

          <NavLink
            to="/compliance"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Safety & ESG
          </NavLink>
        </nav>

        {/* Right Section: Cluster Selector + Account/Switch Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Cluster Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Building2 size={13} color="#64748b" />
            <select
              value={selectedCluster.id}
              onChange={(e) => {
                const found = clusters.find((c) => c.id === e.target.value);
                if (found) setSelectedCluster(found);
              }}
              style={{
                width: 'auto',
                minWidth: '135px',
                padding: '5px 8px',
                fontSize: '0.76rem',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.split(' ')[0]} Cluster
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-light)' }} />

          {/* Unified Login & Switch Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 11px',
                borderRadius: '6px',
                border: currentUser ? '1px solid var(--border-light)' : '1px solid #bae6fd',
                background: currentUser ? '#ffffff' : '#f0f9ff',
                color: currentUser ? 'var(--text-main)' : '#0284c7',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={currentUser ? `Logged in as ${currentUser.name}` : 'Login & Switch Plant'}
            >
              {currentUser ? (
                <>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                  <span style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </span>
                </>
              ) : (
                <>
                  <User size={13} color="#0284c7" />
                  <span>Account</span>
                </>
              )}
              <ChevronDown
                size={13}
                color={currentUser ? '#64748b' : '#0284c7'}
                style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease'
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  width: '230px',
                  background: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 1000
                }}
              >
                {currentUser ? (
                  <>
                    {/* Active Plant Info Banner */}
                    <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <span className={`status-pill ${currentUser.role === 'supplier' ? 'status-cyan' : 'status-emerald'}`} style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                          {currentUser.role === 'supplier' ? 'Supplier' : 'Buyer'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {currentUser.sector?.split(' ')[0] || 'Factory'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onOpenMockAccounts) onOpenMockAccounts();
                        else onOpenSignIn('demo');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <Sparkles size={14} color="#0284c7" />
                      <span>Switch Plant (16 Mock)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenSignIn('signin');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <LogIn size={14} color="#64748b" />
                      <span>Sign In as Another Plant</span>
                    </button>

                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '0.78rem',
                        color: '#dc2626',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <LogOut size={14} color="#dc2626" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenSignIn('signin');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <LogIn size={14} color="#0284c7" />
                      <span>Sign In</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onOpenMockAccounts) onOpenMockAccounts();
                        else onOpenSignIn('demo');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '0.78rem',
                        color: '#0284c7',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <Sparkles size={14} color="#0284c7" />
                      <span>Switch / Mock Accounts</span>
                    </button>

                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenSignUp();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '0.78rem',
                        color: '#16a34a',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <UserPlus size={14} color="#16a34a" />
                      <span>Register Plant</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
