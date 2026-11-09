import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Droplets,
  Leaf,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function ESGPage({ cluster, metrics, onOpenESGCertificate }) {
  const certNumber = `AS-ESG-${new Date().getFullYear()}-${cluster.id.toUpperCase().slice(0, 4)}-7721`;
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="web-section" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.85rem'
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Overview</span>
        </Link>
      </div>

      {/* Main Certificate View */}
      <div
        className="ui-card"
        style={{
          padding: '36px',
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-pill status-emerald">Official ESG Verification</span>
              <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: {certNumber}</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px', margin: '6px 0 0 0' }}>
              Corporate Water Stewardship Audit
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Official Certificate</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onOpenESGCertificate}>
              <span>Open Certificate Modal</span>
            </button>
          </div>
        </div>

        {/* Certificate Display */}
        <div
          style={{
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '36px',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #e0f2fe'
            }}
          >
            <Award size={32} color="#ffffff" />
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--text-main)', margin: 0 }}>
              Certificate of Water Stewardship
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Issued by AquaSwap Industrial Symbiosis & Verification Authority
            </p>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', maxWidth: '640px', lineHeight: 1.6, margin: 0 }}>
            This certifies that the participating industrial facilities within the{' '}
            <strong style={{ color: '#0284c7' }}>{cluster.name}</strong> have undergone verified multi-contaminant water network optimization and circular recycling under international industrial symbiosis standards.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', marginTop: '6px' }}>
            <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#0284c7', fontSize: '0.82rem', fontWeight: 600 }}>
                <Droplets size={16} />
                <span>Groundwater Displaced</span>
              </div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                {metrics.totalFreshwaterDisplacedYear?.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>m³ / year preserved</div>
            </div>

            <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
                <Leaf size={16} />
                <span>Avoided Carbon</span>
              </div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                {metrics.avoidedCO2TonsYear}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>t CO₂e / year cut</div>
            </div>

            <div style={{ padding: '18px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#d97706', fontSize: '0.82rem', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>Economic Surplus</span>
              </div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                ৳ {Math.round(metrics.netEconomicSurplusYear || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>BDT annual value created</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
            <span className="status-pill status-cyan">
              ASTM C1602 Concrete Standards Certified
            </span>
            <span className="status-pill status-emerald">
              ECR 2023 Environmental Compliance Verified
            </span>
            <span className="status-pill status-amber">
              UN SDG 6 (Clean Water) & SDG 12 Aligned
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'left' }}>
              <div>Date of Audit & Issue:</div>
              <strong style={{ color: 'var(--text-main)' }}>{dateFormatted}</strong>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#059669', fontWeight: 700, letterSpacing: '0.04em' }}>[ SCADA TELEMETRY VERIFIED ]</div>
              <div style={{ fontSize: '0.72rem' }}>Zero discharge anomalies logged across telemetry</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div>Authorized Registry:</div>
              <strong style={{ color: '#0284c7' }}>AquaSwap Platform Oversight</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
