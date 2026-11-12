import React from 'react';
import ComplianceRadar from '../components/ComplianceRadar';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function CompliancePage({
  selectedMatch,
  cluster,
  metrics,
  onOpenESGCertificate,
  defaultTab = 'all'
}) {
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

      <div
        className="ui-card page-main-card"
        style={{
          padding: '32px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <ComplianceRadar
          selectedMatch={selectedMatch}
          cluster={cluster}
          metrics={metrics}
          onOpenESGCertificate={onOpenESGCertificate}
          defaultTab={defaultTab}
        />
      </div>
    </div>
  );
}
