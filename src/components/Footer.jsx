import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';

export default function Footer({ onOpenSavingsCalculator, onOpenESGCertificate, onOpenHowItWorks }) {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-light)',
        padding: '48px 24px 32px 24px',
        background: 'rgba(5, 7, 14, 0.98)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '36px',
          marginBottom: '24px'
        }}
      >
        {/* Col 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
            <Droplets size={20} color="#0ea5e9" />
            <span>AquaSwap</span>
          </div>
          <p style={{ marginTop: '10px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
            Industrial Symbiosis & Multi-Contaminant Water Optimization Engine.
          </p>
        </div>

        {/* Col 2 */}
        <div>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '10px' }}>Platform Pages</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/optimizer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Exchange Network</Link>
            <Link to="/blender" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Water Blender Lab</Link>
            <Link to="/fleet" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Live Fleet Map</Link>
            <Link to="/matchmaker" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Partner Matchmaker</Link>
            <Link to="/compliance" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Safety & Contracts</Link>
            <Link to="/esg" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>ESG Stewardship</Link>
          </div>
        </div>

        {/* Col 3 */}
        <div>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '10px' }}>Tools & Audits</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={onOpenSavingsCalculator} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
              Factory ROI Calculator
            </button>
            <button onClick={onOpenESGCertificate} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
              ESG Water Stewardship
            </button>
            <button onClick={onOpenHowItWorks} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textAlign: 'left', cursor: 'pointer', padding: 0 }}>
              Jargon Buster Dictionary
            </button>
          </div>
        </div>

        {/* Col 4 */}
        <div>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '10px' }}>Standards</strong>
          <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>
            Implements ASTM C1602 (Concrete Mixing Specification), Bangladesh ECR 2023, and UN Sustainable Development Goals 6, 9 & 12.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span>© {new Date().getFullYear()} AquaSwap™ Technologies. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Zero River Discharge Initiative</span>
          <span>•</span>
          <span>Decentralized Industrial Symbiosis</span>
        </div>
      </div>
    </footer>
  );
}
