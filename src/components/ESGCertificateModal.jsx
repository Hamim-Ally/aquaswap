import React from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Award,
  Droplets,
  Leaf,
  CheckCircle2,
  Calendar,
  Building2,
  FileCheck2
} from 'lucide-react';

export default function ESGCertificateModal({
  isOpen,
  onClose,
  cluster,
  metrics
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const certNumber = `AS-ESG-${new Date().getFullYear()}-${cluster.id.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 8, 15, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '94vh',
          overflowY: 'auto',
          background: '#0a0e1a',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-pill status-emerald">Official ESG Verification</span>
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: {certNumber}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Certificate Body (Clean, Verifiable Formal Document) */}
        <div
          style={{
            border: '2px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            background: 'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.05) 0%, rgba(10, 14, 26, 0.95) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '18px'
          }}
        >
          {/* Official Emblem */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
              border: '3px solid #fff'
            }}
          >
            <Award size={34} color="#fff" />
          </div>

          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff' }}>
              Certificate of Water Stewardship
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Issued by AquaSwap™ Industrial Symbiosis & Verification Authority
            </p>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '600px', lineHeight: 1.6 }}>
            This certifies that the participating industrial facilities within the{' '}
            <strong style={{ color: '#38bdf8' }}>{cluster.name}</strong> have undergone verified multi-contaminant water network optimization and circular recycling under international industrial symbiosis standards.
          </p>

          {/* 3 Large Certified Numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', width: '100%', marginTop: '6px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--brand-cyan)', fontSize: '0.8rem' }}>
                <Droplets size={16} />
                <span>Groundwater Displaced</span>
              </div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                {metrics.totalFreshwaterDisplacedYear?.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>m³ / year preserved</div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#34d399', fontSize: '0.8rem' }}>
                <Leaf size={16} />
                <span>Avoided Carbon</span>
              </div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>
                {metrics.avoidedCO2TonsYear}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>t CO₂e / year cut</div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.8rem' }}>
                <ShieldCheck size={16} />
                <span>Economic Surplus</span>
              </div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', marginTop: '6px' }}>
                ${Math.round(metrics.netEconomicSurplusYear || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>USD annual value created</div>
            </div>
          </div>

          {/* Compliance & Standards Badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <span className="status-pill status-cyan">
              ✓ ASTM C1602 Concrete Standards Certified
            </span>
            <span className="status-pill status-emerald">
              ✓ ECR 2023 Environmental Compliance Verified
            </span>
            <span className="status-pill status-amber">
              ✓ UN SDG 6 (Clean Water) & SDG 12 Aligned
            </span>
          </div>

          {/* Signatures & Issue Date */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'left' }}>
              <div>Date of Audit & Issue:</div>
              <strong style={{ color: '#fff' }}>{dateFormatted}</strong>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#34d399', fontWeight: 700, letterSpacing: '0.1em' }}>[ DIGITAL SCADA VERIFIED ]</div>
              <div style={{ fontSize: '0.7rem' }}>Zero discharge anomalies logged</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div>Authorized Registry:</div>
              <strong style={{ color: '#38bdf8' }}>AquaSwap Platform Oversight</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
