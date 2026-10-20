import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Droplets,
  PlusCircle,
  Building2,
  Calculator,
  Award,
  Sparkles,
  LogIn,
  LogOut
} from 'lucide-react';

export default function Header({
  clusters,
  selectedCluster,
  setSelectedCluster,
  user,
  onOpenAddModal,
  onOpenAuth,
  onLogout,
  onOpenHowItWorks,
  onOpenSavingsCalculator,
  onOpenESGCertificate
}) {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-light)',
        background: 'rgba(7, 10, 18, 0.94)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.2s ease'
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '12px 24px',
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
            gap: '12px',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)'
            }}
          >
            <Droplets size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff' }}>
                AquaSwap
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Circular Industrial Water Grid
            </p>
          </div>
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
            Fleet &amp; Matchmaker
          </NavLink>

          <NavLink
            to="/compliance"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Safety &amp; ESG
          </NavLink>
        </nav>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Quick Calculator */}
          <button
            onClick={onOpenSavingsCalculator}
            className="btn btn-secondary btn-sm"
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: '#34d399'
            }}
            title="Calculate potential factory savings"
          >
            <Calculator size={14} />
            <span>ROI Calculator</span>
          </button>

          {/* Cluster Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Building2 size={14} color="var(--text-muted)" />
            <select
              value={selectedCluster.id}
              onChange={(e) => {
                const found = clusters.find((c) => c.id === e.target.value);
                if (found) setSelectedCluster(found);
              }}
              style={{
                width: 'auto',
                minWidth: '150px',
                padding: '6px 8px',
                fontSize: '0.76rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.04)'
              }}
            >
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.split(' ')[0]} Cluster
                </option>
              ))}
            </select>
          </div>

          {/* Auth State */}
          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 10px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-sm)'
              }}
              title={user.email}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
              <span style={{ fontSize: '0.76rem', color: '#cbd5e1', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.company || user.email}
              </span>
              <button
                onClick={onLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px', color: '#94a3b8' }}
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-secondary btn-sm">
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* Onboard Facility Primary CTA */}
          <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
            <PlusCircle size={14} />
            <span>Onboard Plant</span>
          </button>
        </div>
      </div>
    </header>
  );
}
