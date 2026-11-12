import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Settings2,
  RotateCcw,
  Truck,
  ArrowRight,
  DollarSign,
  Droplets,
  ChevronDown,
  ChevronUp,
  Leaf,
  Sun,
  CloudRain,
  Compass,
  Sliders,
  Search,
  Download,
  X
} from 'lucide-react';
import DistantCommuteAnalyzerModal from './DistantCommuteAnalyzerModal';

export default function OptimizerView({
  cluster,
  solverOptions,
  setSolverOptions,
  optimizationResults,
  onRunOptimization,
  climateSeason,
  setClimateSeason
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'heavy_tanker', 'compact_bowser', 'pipeline', 'high_savings'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRouteIdx, setExpandedRouteIdx] = useState(null);
  const [isDistantAnalyzerOpen, setIsDistantAnalyzerOpen] = useState(false);
  const [selectedRouteForAnalysis, setSelectedRouteForAnalysis] = useState(null);

  const { activeConnections = [], metrics = {} } = optimizationResults;

  // Real world analogies
  const olympicPools = Math.max(1, Math.round((metrics.totalFreshwaterDisplacedYear || 0) / 2500));

  // Goal Presets
  const applyPreset = (presetType) => {
    if (presetType === 'eco') {
      setSolverOptions((prev) => ({
        ...prev,
        alpha: 2.0,
        beta: 0.2,
        gamma: 0.3,
        delta: 20.0,
        qMin: 20.0,
        allowBlending: true,
        maxTreatmentLevel: 3
      }));
    } else if (presetType === 'budget') {
      setSolverOptions((prev) => ({
        ...prev,
        alpha: 0.6,
        beta: 0.8,
        gamma: 0.9,
        delta: 80.0,
        qMin: 35.0,
        allowBlending: true,
        maxTreatmentLevel: 2
      }));
    } else if (presetType === 'local') {
      setSolverOptions((prev) => ({
        ...prev,
        alpha: 1.0,
        beta: 1.2,
        gamma: 0.5,
        delta: 60.0,
        qMin: 25.0,
        allowBlending: true,
        maxTreatmentLevel: 3
      }));
    } else {
      setSolverOptions((prev) => ({
        ...prev,
        alpha: 1.0,
        beta: 0.4,
        gamma: 0.5,
        delta: 50.0,
        qMin: 25.0,
        allowBlending: true,
        maxTreatmentLevel: 3
      }));
    }
  };

  const filteredConnections = activeConnections.filter((conn) => {
    if (activeFilter === 'heavy_tanker' && conn.recommendedVehicle !== 'heavy_tanker') return false;
    if (activeFilter === 'compact_bowser' && conn.recommendedVehicle !== 'compact_bowser') return false;
    if (activeFilter === 'pipeline' && conn.recommendedVehicle !== 'pipeline') return false;
    if (activeFilter === 'high_savings' && conn.flowVolumeM3 < 150) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const sName = (conn.supplierName || '').toLowerCase();
      const bName = (conn.buyerName || '').toLowerCase();
      const sSec = (conn.supplierSector || '').toLowerCase();
      const bSec = (conn.buyerSector || '').toLowerCase();
      if (!sName.includes(q) && !bName.includes(q) && !sSec.includes(q) && !bSec.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const heavyCount = activeConnections.filter((c) => c.recommendedVehicle === 'heavy_tanker').length;
  const compactCount = activeConnections.filter((c) => c.recommendedVehicle === 'compact_bowser').length;
  const pipelineCount = activeConnections.filter((c) => c.recommendedVehicle === 'pipeline').length;

  const handleExportCSV = () => {
    if (filteredConnections.length === 0) return;
    const headers = [
      'Route #',
      'Supplier',
      'Supplier Sector',
      'Buyer',
      'Buyer Sector',
      'Daily Volume (m3/d)',
      'Distance (km)',
      'Transport Mode',
      'Daily Savings (BDT)'
    ];
    const rows = filteredConnections.map((conn, idx) => [
      idx + 1,
      `"${conn.supplierName || ''}"`,
      `"${conn.supplierSector || ''}"`,
      `"${conn.buyerName || ''}"`,
      `"${conn.buyerSector || ''}"`,
      conn.flowVolumeM3,
      conn.distanceKm,
      conn.recommendedVehicle === 'heavy_tanker'
        ? 'Heavy Tanker (28m³)'
        : conn.recommendedVehicle === 'compact_bowser'
        ? 'Compact Bowser (14m³)'
        : 'HDPE Pipeline',
      Math.round((conn.flowVolumeM3 || 100) * 16.5)
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aquaswap_corridors_${climateSeason || 'monsoon'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header & Unified Control Bar (All in One Row) */}
      <div
        className="mobile-stack"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '16px'
        }}
      >
        <div style={{ minWidth: 0, flexShrink: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-head, #0f172a)', margin: 0 }}>
              Water Exchange Network
            </h1>
            <span className="status-pill status-cyan" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
              {cluster.name}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '3px 0 0 0' }}>
            Bilateral matching connecting factory effluent producers with manufacturing buyers.
          </p>
        </div>

        {/* Action Controls - Strictly ONE Single Row */}
        <div
          className="mobile-scroll-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'nowrap',
            flexShrink: 0
          }}
        >
          {/* Season Segmented Control */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: '34px',
              background: '#f1f5f9',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--border-light)',
              boxSizing: 'border-box',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <button
              onClick={() => setClimateSeason('monsoon')}
              style={{
                border: 'none',
                background: climateSeason === 'monsoon' ? '#ffffff' : 'transparent',
                color: climateSeason === 'monsoon' ? '#0284c7' : '#64748b',
                fontWeight: climateSeason === 'monsoon' ? 700 : 500,
                fontSize: '0.74rem',
                padding: '0 8px',
                height: '100%',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                boxShadow: climateSeason === 'monsoon' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
              title="Monsoon Baseline (Standard Municipal Tariff)"
            >
              <CloudRain size={12} />
              <span>Monsoon</span>
            </button>
            <button
              onClick={() => setClimateSeason('dry')}
              style={{
                border: 'none',
                background: climateSeason === 'dry' ? '#ffffff' : 'transparent',
                color: climateSeason === 'dry' ? '#0284c7' : '#64748b',
                fontWeight: climateSeason === 'dry' ? 700 : 500,
                fontSize: '0.74rem',
                padding: '0 8px',
                height: '100%',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                boxShadow: climateSeason === 'dry' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
              title="Dry Season (Groundwater stress elevated)"
            >
              <span>Dry</span>
            </button>
            <button
              onClick={() => setClimateSeason('drought')}
              style={{
                border: 'none',
                background: climateSeason === 'drought' ? '#ffffff' : 'transparent',
                color: climateSeason === 'drought' ? '#dc2626' : '#64748b',
                fontWeight: climateSeason === 'drought' ? 700 : 500,
                fontSize: '0.74rem',
                padding: '0 8px',
                height: '100%',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                boxShadow: climateSeason === 'drought' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
              title="Severe Drought (Priority allocation & ৳65/m³ tariff)"
            >
              <Sun size={12} color={climateSeason === 'drought' ? '#dc2626' : '#64748b'} />
              <span>Drought</span>
            </button>
          </div>

          {/* Strategy Presets Dropdown - Fixed compact width */}
          <select
            onChange={(e) => applyPreset(e.target.value)}
            defaultValue="default"
            style={{
              height: '34px',
              width: '165px',
              minWidth: '150px',
              maxWidth: '180px',
              flexShrink: 0,
              padding: '0 8px',
              fontSize: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border-strong)',
              background: '#ffffff',
              color: 'var(--text-head, #0f172a)',
              fontWeight: 600,
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
            title="Select allocation objective"
          >
            <option value="default">Objective: Balanced</option>
            <option value="eco">Objective: Max Water</option>
            <option value="budget">Objective: Low Cost</option>
            <option value="local">Objective: Proximity</option>
          </select>

          {/* Algorithm Weights Toggle */}
          <button
            className="btn btn-secondary"
            onClick={() => setShowSettings(!showSettings)}
            style={{
              height: '34px',
              fontSize: '0.75rem',
              padding: '0 10px',
              gap: '5px',
              boxSizing: 'border-box',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <Sliders size={13} color="#0284c7" />
            <span>{showSettings ? 'Hide Weights' : 'Tuning'}</span>
          </button>

          {/* Recalculate Routes Primary Button */}
          <button
            className="btn btn-primary"
            onClick={onRunOptimization}
            style={{
              height: '34px',
              fontSize: '0.75rem',
              padding: '0 12px',
              gap: '5px',
              boxSizing: 'border-box',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <Play size={13} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* 2. Optional Algorithm Weight Tuning Drawer */}
      {showSettings && (
        <div
          className="ui-card"
          style={{
            padding: '16px 20px',
            background: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-head, #0f172a)' }}>
              <Settings2 size={14} color="#0284c7" />
              <span>Algorithm Parameters & Weights</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                applyPreset('default');
                onRunOptimization();
              }}
              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
            >
              <RotateCcw size={11} /> Reset
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Aquifer Scarcity (Alpha)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{solverOptions.alpha.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.1"
                value={solverOptions.alpha}
                onChange={(e) => setSolverOptions({ ...solverOptions, alpha: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Distance Penalty (Beta)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{solverOptions.beta.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={solverOptions.beta}
                onChange={(e) => setSolverOptions({ ...solverOptions, beta: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Treatment Cost Penalty (Gamma)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{solverOptions.gamma.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={solverOptions.gamma}
                onChange={(e) => setSolverOptions({ ...solverOptions, gamma: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Min Batch Consignment (qMin)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{solverOptions.qMin} m³</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={solverOptions.qMin}
                onChange={(e) => setSolverOptions({ ...solverOptions, qMin: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Symmetrically Aligned 4-Metric Grid */}
      <div className="optimizer-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
        
        {/* Metric 1 */}
        <div
          className="ui-card"
          style={{
            padding: '16px 18px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '106px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>Water Recycled</span>
            <Droplets size={16} color="#0284c7" />
          </div>
          <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-head, #0f172a)', margin: '4px 0' }}>
            {metrics.totalReusedM3Day?.toLocaleString() || 0} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>m³/day</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0284c7' }}>
            ≈ {olympicPools} Olympic pools/yr saved
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className="ui-card"
          style={{
            padding: '16px 18px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '106px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>Annual Savings</span>
            <DollarSign size={16} color="#16a34a" />
          </div>
          <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16a34a', margin: '4px 0' }}>
            ৳ {Math.round(metrics.netEconomicSurplusYear || 0).toLocaleString()} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>BDT/yr</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Net annual economic surplus
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className="ui-card"
          style={{
            padding: '16px 18px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '106px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>Active Corridors</span>
            <Truck size={16} color="#0284c7" />
          </div>
          <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-head, #0f172a)', margin: '4px 0' }}>
            {metrics.activeMatchCount || 0} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>routes</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Avg distance: {metrics.averageTruckDistanceKm || 0} km
          </div>
        </div>

        {/* Metric 4 */}
        <div
          className="ui-card"
          style={{
            padding: '16px 18px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '106px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>Emissions Abated</span>
            <Leaf size={16} color="#16a34a" />
          </div>
          <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-head, #0f172a)', margin: '4px 0' }}>
            {metrics.avoidedCO2TonsYear || 0} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>t CO₂e/yr</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a' }}>
            Reduced deep-well pumping
          </div>
        </div>

      </div>

      {/* 4. Corridors List & Minimalist Filtering */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
        
        {/* Section Header & Toolbar (Search + Export CSV + Filters) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Title & Count Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-head, #0f172a)', margin: 0 }}>
                Active Trade Corridors
              </h2>
              <span className="status-pill status-cyan" style={{ fontSize: '0.74rem' }}>
                {filteredConnections.length} routed
              </span>
            </div>

            {/* Right: Search Box + Export CSV */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              
              {/* Search Corridor / Company Input */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter company or sector..."
                  style={{
                    height: '32px',
                    paddingLeft: '32px',
                    paddingRight: searchQuery ? '28px' : '10px',
                    fontSize: '0.76rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: 'var(--text-head, #0f172a)',
                    width: '210px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Clear filter"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Export CSV Button */}
              <button
                className="btn btn-secondary"
                onClick={handleExportCSV}
                style={{
                  height: '32px',
                  fontSize: '0.76rem',
                  padding: '0 12px',
                  gap: '6px',
                  boxSizing: 'border-box'
                }}
                title="Export current routed pairings as CSV"
              >
                <Download size={13} color="#0284c7" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Clean Filter Pills Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`tab-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '0.74rem',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            >
              All ({activeConnections.length})
            </button>
            <button
              className={`tab-pill ${activeFilter === 'heavy_tanker' ? 'active' : ''}`}
              onClick={() => setActiveFilter('heavy_tanker')}
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '0.74rem',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            >
              Heavy Tanker ({heavyCount})
            </button>
            <button
              className={`tab-pill ${activeFilter === 'compact_bowser' ? 'active' : ''}`}
              onClick={() => setActiveFilter('compact_bowser')}
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '0.74rem',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            >
              Compact Bowser ({compactCount})
            </button>
            {pipelineCount > 0 && (
              <button
                className={`tab-pill ${activeFilter === 'pipeline' ? 'active' : ''}`}
                onClick={() => setActiveFilter('pipeline')}
                style={{
                  height: '28px',
                  padding: '0 10px',
                  fontSize: '0.74rem',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                HDPE Pipeline ({pipelineCount})
              </button>
            )}
            <button
              className={`tab-pill ${activeFilter === 'high_savings' ? 'active' : ''}`}
              onClick={() => setActiveFilter('high_savings')}
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '0.74rem',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            >
              High Volume (150m³+)
            </button>
          </div>
        </div>

        {/* Streamlined Corridor Cards with Symmetrical Grid Alignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredConnections.length === 0 ? (
            <div
              className="ui-card"
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: '#ffffff',
                border: '1px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                No active trade corridors match the selected filter or search query.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
                style={{ marginTop: '12px', fontSize: '0.76rem' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredConnections.map((conn, idx) => {
              const isExpanded = expandedRouteIdx === idx;
              const transportWay = conn.transportWay || {};
              const corridor = transportWay.corridor || {};
              const allOptions = transportWay.allOptions || [];
              const savingsDaily = Math.round((conn.flowVolumeM3 || 100) * 16.5);

              return (
                <div
                  key={idx}
                  className="ui-card"
                  style={{
                    padding: '16px 20px',
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Main Row: Symmetrically Aligned Grid */}
                  <div className="corridor-card-row">
                    
                    {/* Left: Supplier -> Buyer Pairing Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: '#f0f9ff',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.76rem',
                          border: '1px solid #bae6fd',
                          flexShrink: 0
                        }}
                      >
                        #{idx + 1}
                      </div>

                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-head, #0f172a)' }}>
                            {conn.supplierName}
                          </strong>
                          <ArrowRight size={13} color="#0284c7" style={{ flexShrink: 0 }} />
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-head, #0f172a)' }}>
                            {conn.buyerName}
                          </strong>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {conn.supplierSector} &rarr; {conn.buyerSector}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Crisp, Standardized Metrics Strip */}
                    <div className="corridor-metrics-strip">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Daily Volume</div>
                        <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-head, #0f172a)' }}>
                          {conn.flowVolumeM3} m³/d
                        </div>
                      </div>

                      <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Distance</div>
                        <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-head, #0f172a)' }}>
                          {conn.distanceKm} km
                        </div>
                      </div>

                      <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Transport Mode</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Truck size={12} />
                          <span>
                            {conn.recommendedVehicle === 'heavy_tanker'
                              ? '28m³ Tanker'
                              : conn.recommendedVehicle === 'compact_bowser'
                              ? '14m³ Bowser'
                              : 'HDPE Pipeline'}
                          </span>
                        </div>
                      </div>

                      <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Daily Savings</div>
                        <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#16a34a' }}>
                          ৳ {savingsDaily.toLocaleString()}/d
                        </div>
                      </div>
                    </div>

                    {/* Right: Symmetrically Aligned Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', flexShrink: 0 }}>
                      <Link
                        to={`/fleet?supplier=${encodeURIComponent(conn.supplierName || '')}&buyer=${encodeURIComponent(conn.buyerName || '')}`}
                        className="btn btn-secondary"
                        style={{
                          height: '32px',
                          fontSize: '0.74rem',
                          padding: '0 10px',
                          gap: '4px',
                          boxSizing: 'border-box'
                        }}
                        title="Inspect tanker travel along real street paths"
                      >
                        <span>Live Map</span>
                        <ArrowRight size={12} />
                      </Link>

                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedRouteForAnalysis(conn);
                          setIsDistantAnalyzerOpen(true);
                        }}
                        style={{
                          height: '32px',
                          fontSize: '0.74rem',
                          padding: '0 10px',
                          gap: '4px',
                          boxSizing: 'border-box'
                        }}
                        title="Analyze transit cost and vehicle ROI"
                      >
                        <Compass size={12} color="#0284c7" />
                        <span>ROI Tuner</span>
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => setExpandedRouteIdx(isExpanded ? null : idx)}
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxSizing: 'border-box'
                        }}
                        title={isExpanded ? 'Collapse vehicle comparison' : 'View multi-vehicle feasibility analysis'}
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Detail: Multi-Vehicle Feasibility Comparison */}
                  {isExpanded && (
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '6px',
                        padding: '12px 14px',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginTop: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        <span><strong>Corridor:</strong> {corridor.name || 'Industrial Highway'} &bull; Feasibility: <strong>{conn.easeScore || 95}%</strong></span>
                        <span style={{ color: '#0284c7' }}>Recommended: {conn.vehicleName || 'Tri-Axle Heavy Tanker'}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {allOptions.map((opt, oIdx) => {
                          const isChosen = opt.mode === conn.recommendedVehicle;
                          return (
                            <div
                              key={oIdx}
                              style={{
                                padding: '8px 10px',
                                borderRadius: '4px',
                                background: '#ffffff',
                                border: isChosen ? '1.5px solid #0284c7' : '1px solid var(--border-light)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '84px',
                                gap: '4px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <strong style={{ fontSize: '0.78rem', color: isChosen ? '#0284c7' : 'var(--text-head, #0f172a)' }}>
                                  {opt.shortName}
                                </strong>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isChosen ? '#16a34a' : '#64748b' }}>
                                  {opt.easeScore}%
                                </span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.35 }}>
                                {opt.reason}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 'auto' }}>
                                Trips: {opt.dailyTripsLabel}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Commute & Volume Tuner */}
      <DistantCommuteAnalyzerModal
        isOpen={isDistantAnalyzerOpen}
        onClose={() => setIsDistantAnalyzerOpen(false)}
        initialRoute={selectedRouteForAnalysis || activeConnections[0]}
        cluster={cluster}
        activeConnections={activeConnections}
      />
    </div>
  );
}
