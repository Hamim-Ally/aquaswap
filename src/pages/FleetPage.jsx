import React from 'react';
import GISNetworkMap from '../components/GISNetworkMap';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function FleetPage({ cluster, optimizationResults, isSimpleMode }) {
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

        <span className="status-pill status-amber">
          Page: /fleet
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
        <GISNetworkMap
          cluster={cluster}
          optimizationResults={optimizationResults}
          isSimpleMode={isSimpleMode}
        />
      </div>
    </div>
  );
}
