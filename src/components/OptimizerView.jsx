import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Settings2,
  RotateCcw,
  Truck,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Droplets,
  Layers,
  ChevronDown,
  ChevronUp,
  Leaf,
  Sun,
  CloudRain,
  Compass,
  Sliders,
  Filter
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
    if (activeFilter === 'heavy_tanker') return conn.recommendedVehicle === 'heavy_tanker';
    if (activeFilter === 'compact_bowser') return conn.recommendedVehicle === 'compact_bowser';
    if (activeFilter === 'pipeline') return conn.recommendedVehicle === 'pipeline';
    if (activeFilter === 'high_savings') return conn.flowVolumeM3 >= 150;
    return true;
  });

  const heavyCount = activeConnections.filter((c) => c.recommendedVehicle === 'heavy_tanker').length;
  const compactCount = activeConnections.filter((c) => c.recommendedVehicle === 'compact_bowser').length;
  const pipelineCount = activeConnections.filter((c) => c.recommendedVehicle === 'pipeline').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Clean Header & Control Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Water Exchange Network
            </h1>
            <span className="status-pill status-cyan" style={{ fontSize: '0.74rem' }}>
              {cluster.name}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
            Bilateral matching connecting factory effluent producers with manufacturing buyers.
          </p>
        </div>

        {/* Compact Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Season Segmented Control */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-light)' }}>
            <button
              onClick={() => setClimateSeason('monsoon')}
              style={{
                border: 'none',
                background: climateSeason === 'monsoon' ? '#ffffff' : 'transparent',
                color: climateSeason === 'monsoon' ? '#0284c7' : '#64748b',
                fontWeight: climateSeason === 'monsoon' ? 700 : 500,
                fontSize: '0.74rem',
                padding: '4px 9px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
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
                padding: '4px 9px',
                borderRadius: '4px',
                cursor: 'pointer',
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
                padding: '4px 9px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: climateSeason === 'drought' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
              title="Severe Drought (Priority allocation & ৳65/m³ tariff)"
            >
              <Sun size={12} color={climateSeason === 'drought' ? '#dc2626' : '#64748b'} />
              <span>Drought</span>
            </button>
          </div>

          {/* Strategy Presets Dropdown */}
          <select
            onChange={(e) => applyPreset(e.target.value)}
            defaultValue="default"
            style={{
              padding: '5px 9px',
              fontSize: '0.76rem',
              borderRadius: '6px',
              border: '1px solid var(--border-light)',
              background: '#ffffff',
              color: 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Select allocation objective"
          >
            <option value="default">Objective: Balanced</option>
            <option value="eco">Objective: Max Water Recovery</option>
            <option value="budget">Objective: Lowest Logistics Cost</option>
            <option value="local">Objective: Local Proximity</option>
          </select>

          {/* Algorithm Weights Toggle */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSettings(!showSettings)}
            style={{ fontSize: '0.76rem', padding: '5px 10px', gap: '5px' }}
          >
            <Sliders size={13} color="#0284c7" />
            <span>{showSettings ? 'Hide Weights' : 'Tuning'}</span>
          </button>

          {/* Recalculate Routes Primary Button */}
          <button
            className="btn btn-primary btn-sm"
            onClick={onRunOptimization}
            style={{ fontSize: '0.76rem', padding: '5px 12px', gap: '5px' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-heading)' }}>
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

      {/* 3. Clean 4-Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        
        {/* Metric 1 */}
        <div className="ui-card" style={{ padding: '14px 18px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>Water Recycled</span>
            <Droplets size={16} color="#0284c7" />
          </div>
          <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
            {metrics.totalReusedM3Day?.toLocaleString() || 0} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>m³/day</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0284c7', marginTop: '3px' }}>
            ≈ {olympicPools} Olympic pools/yr saved
          </div>
        </div>

        {/* Metric 2 */}
        <div className="ui-card" style={{ padding: '14px 18px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>Annual Savings</span>
            <DollarSign size={16} color="#16a34a" />
          </div>
          <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
            ৳ {Math.round(metrics.netEconomicSurplusYear || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
            Net annual economic surplus
          </div>
        </div>

        {/* Metric 3 */}
        <div className="ui-card" style={{ padding: '14px 18px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>Active Corridors</span>
            <Truck size={16} color="#0284c7" />
          </div>
          <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
            {metrics.activeMatchCount || 0} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>routes</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
            Avg distance: {metrics.averageTruckDistanceKm || 0} km
          </div>
        </div>

        {/* Metric 4 */}
        <div className="ui-card" style={{ padding: '14px 18px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>Emissions Abated</span>
            <Leaf size={16} color="#16a34a" />
          </div>
          <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {metrics.avoidedCO2TonsYear || 0} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>t CO₂e/yr</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: '3px' }}>
            Reduced deep-well pumping
          </div>
        </div>

      </div>

      {/* 4. Corridors List & Minimalist Filtering */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
        
        {/* Section Header & Vehicle Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Active Trade Corridors
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {filteredConnections.length} verified trade pairings currently routed
            </span>
          </div>

          {/* Clean Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <button
              className={`tab-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
            >
              All ({activeConnections.length})
            </button>
            <button
              className={`tab-pill ${activeFilter === 'heavy_tanker' ? 'active' : ''}`}
              onClick={() => setActiveFilter('heavy_tanker')}
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
            >
              Heavy Tanker ({heavyCount})
            </button>
            <button
              className={`tab-pill ${activeFilter === 'compact_bowser' ? 'active' : ''}`}
              onClick={() => setActiveFilter('compact_bowser')}
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
            >
              Compact Bowser ({compactCount})
            </button>
            {pipelineCount > 0 && (
              <button
                className={`tab-pill ${activeFilter === 'pipeline' ? 'active' : ''}`}
                onClick={() => setActiveFilter('pipeline')}
                style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              >
                HDPE Pipeline ({pipelineCount})
              </button>
            )}
            <button
              className={`tab-pill ${activeFilter === 'high_savings' ? 'active' : ''}`}
              onClick={() => setActiveFilter('high_savings')}
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
            >
              High Volume (150m³+)
            </button>
          </div>
        </div>

        {/* Streamlined Corridor Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredConnections.map((conn, idx) => {
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
                {/* Main Row: Pairing Info, Metrics, Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  
                  {/* Left: Supplier -> Buyer Pairing */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '280px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.76rem' }}>
                      #{idx + 1}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.94rem', color: 'var(--text-heading)' }}>
                          {conn.supplierName}
                        </strong>
                        <ArrowRight size={13} color="#0284c7" />
                        <strong style={{ fontSize: '0.94rem', color: 'var(--text-heading)' }}>
                          {conn.buyerName}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {conn.supplierSector} &rarr; {conn.buyerSector}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Badges Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center', minWidth: '70px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Daily Volume</div>
                      <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {conn.flowVolumeM3} m³/d
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />

                    <div style={{ textAlign: 'center', minWidth: '70px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Distance</div>
                      <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                        {conn.distanceKm} km
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />

                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Transport Mode</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Truck size={12} />
                        <span>{conn.recommendedVehicle === 'heavy_tanker' ? '28m³ Tanker' : conn.recommendedVehicle === 'compact_bowser' ? '14m³ Bowser' : 'HDPE Pipeline'}</span>
                      </div>
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />

                    <div style={{ textAlign: 'center', minWidth: '85px' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Daily Savings</div>
                      <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#16a34a' }}>
                        ৳ {savingsDaily.toLocaleString()}/d
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link
                      to="/fleet"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '5px 10px', gap: '4px' }}
                      title="Inspect tanker travel along real street paths"
                    >
                      <span>Live Map</span>
                      <ArrowRight size={12} />
                    </Link>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedRouteForAnalysis(conn);
                        setIsDistantAnalyzerOpen(true);
                      }}
                      style={{ fontSize: '0.74rem', padding: '5px 10px', gap: '4px' }}
                      title="Analyze transit cost and vehicle ROI"
                    >
                      <Compass size={12} color="#0284c7" />
                      <span>ROI Tuner</span>
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setExpandedRouteIdx(isExpanded ? null : idx)}
                      style={{ fontSize: '0.74rem', padding: '5px 8px' }}
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
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <strong style={{ fontSize: '0.78rem', color: isChosen ? '#0284c7' : 'var(--text-heading)' }}>
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
          })}
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
