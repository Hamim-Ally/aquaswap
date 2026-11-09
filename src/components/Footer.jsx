import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';

export default function Footer({ onOpenESGCertificate, onOpenHowItWorks, onOpenSignIn }) {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-light)',
        padding: '36px 24px 28px 24px',
        background: '#ffffff',
        fontSize: '0.82rem',
        color: '#64748b'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={16} />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            AquaSwap
          </span>
          <span style={{ color: '#cbd5e1', margin: '0 4px' }}>•</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Industrial Water Reuse Marketplace
          </span>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/optimizer" style={{ color: '#64748b', textDecoration: 'none' }}>Exchange Network</Link>
          <Link to="/blender" style={{ color: '#64748b', textDecoration: 'none' }}>Water Blender</Link>
          <Link to="/fleet" style={{ color: '#64748b', textDecoration: 'none' }}>Fleet Map</Link>
          <Link to="/compliance" style={{ color: '#64748b', textDecoration: 'none' }}>Safety & ESG</Link>
          <button
            onClick={onOpenSignIn}
            style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0, fontSize: '0.82rem', fontWeight: 600 }}
          >
            Mock Login
          </button>
        </div>

        {/* Copyright */}
        <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
          © {new Date().getFullYear()} AquaSwap
        </div>
      </div>
    </footer>
  );
}
