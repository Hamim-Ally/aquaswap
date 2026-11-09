import React, { useState } from 'react';
import GISNetworkMap from '../components/GISNetworkMap';
import MatchScoreExplorer from '../components/MatchScoreExplorer';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  Users2,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function FleetPage({
  cluster,
  optimizationResults,
  onSelectMatchForWPA,
  defaultTab = 'all'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const navigate = useNavigate();

  const handleSelectMatch = (match) => {
    if (onSelectMatchForWPA) {
      onSelectMatchForWPA(match);
    }
    navigate('/compliance');
  };

  return (
    <div className="web-section" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      
      {/* 1. Breadcrumb */}
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

      {/* 2. Page Hero Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
          Live Fleet & Partner Directory
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px', margin: '4px 0 0 0' }}>
          Real-time GIS routing and bilateral B2B compatibility matches across {cluster.name}.
        </p>
      </div>

      {/* 3. View Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px'
        }}
      >
        <button
          className={`tab-pill ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          <span>All Views</span>
        </button>

        <button
          className={`tab-pill ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
          style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Truck size={14} color="#0284c7" />
          <span>Fleet Map</span>
        </button>

        <button
          className={`tab-pill ${activeTab === 'matchmaker' ? 'active' : ''}`}
          onClick={() => setActiveTab('matchmaker')}
          style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Users2 size={14} color="#475569" />
          <span>Matchmaker Directory</span>
        </button>
      </div>

      {/* 4. Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Module 1: Live GIS Network Map */}
        {(activeTab === 'all' || activeTab === 'fleet') && (
          <div
            className="ui-card"
            style={{
              padding: '28px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <GISNetworkMap
              cluster={cluster}
              optimizationResults={optimizationResults}
            />
          </div>
        )}

        {/* Module 2: Partner Matchmaker Directory */}
        {(activeTab === 'all' || activeTab === 'matchmaker') && (
          <div
            className="ui-card"
            style={{
              padding: '28px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <MatchScoreExplorer
              cluster={cluster}
              onSelectMatchForWPA={handleSelectMatch}
            />
          </div>
        )}

      </div>
    </div>
  );
}
