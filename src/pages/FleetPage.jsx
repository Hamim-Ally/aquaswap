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

      {/* 2. Page Hero Header & View Switcher (All in One Row) */}
      <div
        className="mobile-stack"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div style={{ minWidth: 0, flexShrink: 1 }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-head, #0f172a)', margin: 0 }}>
            Live Fleet & Partner Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
            Real-time GIS routing and bilateral B2B compatibility matches across {cluster.name}.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div
          className="mobile-scroll-row"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#f1f5f9',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid var(--border-light)',
            flexShrink: 0
          }}
        >
          <button
            className={`tab-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
            style={{
              height: '32px',
              padding: '0 12px',
              fontSize: '0.78rem',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          >
            <span>All Views</span>
          </button>

          <button
            className={`tab-pill ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
            style={{
              height: '32px',
              padding: '0 12px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          >
            <Truck size={14} color="#0284c7" />
            <span>Fleet Map</span>
          </button>

          <button
            className={`tab-pill ${activeTab === 'matchmaker' ? 'active' : ''}`}
            onClick={() => setActiveTab('matchmaker')}
            style={{
              height: '32px',
              padding: '0 12px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              borderRadius: '6px',
              boxSizing: 'border-box'
            }}
          >
            <Users2 size={14} color="#475569" />
            <span>Matchmaker Directory</span>
          </button>
        </div>
      </div>

      {/* 4. Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Module 1: Live GIS Network Map */}
        {(activeTab === 'all' || activeTab === 'fleet') && (
          <div
            className="ui-card page-main-card"
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
            className="ui-card page-main-card"
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
