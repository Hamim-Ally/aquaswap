import React from 'react';
import MatchScoreExplorer from '../components/MatchScoreExplorer';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function MatchmakerPage({ cluster, onSelectMatchForWPA }) {
  const navigate = useNavigate();

  const handleSelect = (match) => {
    onSelectMatchForWPA(match);
    navigate('/compliance');
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

      <div
        className="ui-card page-main-card"
        style={{
          padding: '32px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <MatchScoreExplorer
          cluster={cluster}
          onSelectMatchForWPA={handleSelect}
        />
      </div>
    </div>
  );
}
