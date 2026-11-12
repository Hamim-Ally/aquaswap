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
  User,
  LayoutDashboard,
  GitMerge,
  FlaskConical,
  Truck,
  ShieldCheck
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
    <header className="site-header">
      {/* 1. Main Header Bar */}
      <div className="header-top-bar">
        {/* Left Group: Brand + Desktop Navigation */}
        <div className="header-left-group">
          {/* Brand Logo & Name */}
          <Link to="/" className="header-brand-link">
            <div className="header-brand-logo">
              <Droplets size={18} color="#0284c7" />
            </div>
            <span className="header-brand-name">AquaSwap</span>
          </Link>

          {/* Elegant Divider between Brand and Nav (Desktop Only) */}
          <div className="header-brand-divider" />

          {/* Desktop Navigation Links */}
          <nav className="header-desktop-nav">
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
        </div>

        {/* Right Section: Cluster Selector + Account Dropdown */}
        <div className="header-right-actions">
          {/* Cluster Switcher */}
          <div className="header-cluster-wrap">
            <Building2 size={13} color="#64748b" className="cluster-icon" />
            <select
              value={selectedCluster.id}
              onChange={(e) => {
                const found = clusters.find((c) => c.id === e.target.value);
                if (found) setSelectedCluster(found);
              }}
              className="header-cluster-select"
              title="Select Industrial Corridor"
            >
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.split(' ')[0]} Cluster
                </option>
              ))}
            </select>
          </div>

          <div className="header-actions-divider" />

          {/* Unified Login & Switch Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="header-account-btn"
              style={{
                border: currentUser ? '1px solid var(--border-light)' : '1px solid #bae6fd',
                background: currentUser ? '#ffffff' : '#f0f9ff',
                color: currentUser ? 'var(--text-main)' : '#0284c7'
              }}
              title={currentUser ? `Logged in as ${currentUser.name}` : 'Login & Switch Plant'}
            >
              {currentUser ? (
                <>
                  <div className="account-status-dot" />
                  <span className="account-user-name">
                    {currentUser.name}
                  </span>
                </>
              ) : (
                <>
                  <User size={13} color="#0284c7" />
                  <span className="account-user-name">Account</span>
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
              <div className="header-account-dropdown">
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
                      className="dropdown-menu-item"
                    >
                      <Sparkles size={14} color="#0284c7" />
                      <span>Switch Plant (16 Mock)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenSignIn('signin');
                      }}
                      className="dropdown-menu-item"
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
                      className="dropdown-menu-item danger"
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
                      className="dropdown-menu-item"
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
                      className="dropdown-menu-item highlight"
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
                      className="dropdown-menu-item success"
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

      {/* 2. Mobile App-Style Sub-Navigation Bar (Touch Scrollable, Mobile Only) */}
      <nav className="header-mobile-subnav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `mobile-nav-pill ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={13} />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/optimizer"
          className={({ isActive }) => `mobile-nav-pill ${isActive ? 'active' : ''}`}
        >
          <GitMerge size={13} />
          <span>Exchange</span>
        </NavLink>

        <NavLink
          to="/blender"
          className={({ isActive }) => `mobile-nav-pill ${isActive ? 'active' : ''}`}
        >
          <FlaskConical size={13} />
          <span>Blender</span>
        </NavLink>

        <NavLink
          to="/fleet"
          className={({ isActive }) => `mobile-nav-pill ${isActive ? 'active' : ''}`}
        >
          <Truck size={13} />
          <span>Fleet & Match</span>
        </NavLink>

        <NavLink
          to="/compliance"
          className={({ isActive }) => `mobile-nav-pill ${isActive ? 'active' : ''}`}
        >
          <ShieldCheck size={13} />
          <span>Safety & ESG</span>
        </NavLink>
      </nav>
    </header>
  );
}
