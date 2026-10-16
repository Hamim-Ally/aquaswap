import React from 'react';
import ComplianceRadar from '../components/ComplianceRadar';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CompliancePage({ selectedMatch, cluster, isSimpleMode }) {
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

        <span className="status-pill status-rose">
          Page: /compliance
        </span>
      </div>

      <div
        className="ui-card"
        style={{
          padding: '32px',
          background: 'rgba(11, 16, 28, 0.95)',
          border: '1px solid var(--border-glow)'
        }}
      >
        <ComplianceRadar
          selectedMatch={selectedMatch}
          cluster={cluster}
          isSimpleMode={isSimpleMode}
        />
      </div>
    </div>
  );
}
