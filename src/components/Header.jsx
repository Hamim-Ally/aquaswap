import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Droplets,
  PlusCircle,
  Building2,
  Calculator,
  Award,
  Sparkles
} from 'lucide-react';

export default function Header({
  clusters,
  selectedCluster,
  setSelectedCluster,
  onOpenAddModal,
  isSimpleMode,
  setIsSimpleMode,
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
              <span className="status-pill status-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                {isSimpleMode ? '🌱 Easy View' : '⚙️ Pro Mode'}
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
            Live Fleet Map
          </NavLink>

          <NavLink
            to="/matchmaker"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Partner Matchmaker
          </NavLink>

          <NavLink
            to="/compliance"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Safety & Contracts
          </NavLink>

          <NavLink
            to="/esg"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            ESG Audit
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

          {/* Mode Switcher */}
          <button
            onClick={() => setIsSimpleMode(!isSimpleMode)}
            className="btn btn-secondary btn-sm"
            title="Toggle between Simple and Pro views"
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            {isSimpleMode ? (
              <span style={{ color: '#34d399', fontWeight: 600 }}>Simple</span>
            ) : (
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>Pro</span>
            )}
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
