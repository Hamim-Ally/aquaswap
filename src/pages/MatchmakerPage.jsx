import React from 'react';
import MatchScoreExplorer from '../components/MatchScoreExplorer';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function MatchmakerPage({ cluster, onSelectMatchForWPA, isSimpleMode }) {
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

        <span className="status-pill status-cyan">
          Page: /matchmaker
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
        <MatchScoreExplorer
          cluster={cluster}
          onSelectMatchForWPA={handleSelect}
          isSimpleMode={isSimpleMode}
        />
      </div>
    </div>
  );
}
