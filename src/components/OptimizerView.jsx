import React, { useState } from 'react';
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
  Sparkles,
  HelpCircle,
  MapPin,
  FlaskConical,
  Info,
  Sun,
  CloudRain,
  Calculator,
  Award
} from 'lucide-react';

export default function OptimizerView({
  cluster,
  solverOptions,
  setSolverOptions,
  optimizationResults,
  onRunOptimization,
  isSimpleMode,
  onOpenHowItWorks,
  onViewMap,
  onViewBlender,
  onOpenSavingsCalculator,
  onOpenESGCertificate,
  climateSeason,
  setClimateSeason
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [expandedBuyerId, setExpandedBuyerId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'high_savings', 'short_dist'

  const { activeConnections, buyerAllocations, metrics } = optimizationResults;

  // Real world analogies
  const olympicPools = Math.max(1, Math.round((metrics.totalFreshwaterDisplacedYear || 0) / 2500));
  const peopleSupplied = Math.max(10, Math.round(((metrics.totalReusedM3Day || 0) * 1000) / 120));
  const treesEquivalent = Math.max(5, Math.round((metrics.avoidedCO2TonsYear || 0) * 45));

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
    if (activeFilter === 'short_dist') return conn.distanceKm <= 10;
    if (activeFilter === 'high_savings') return conn.flowVolumeM3 >= 150;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header & Fast Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
              {isSimpleMode ? 'Factory Water Exchange Network' : 'Water Network Optimization'}
            </h1>
            <span className="status-pill status-cyan">
              {cluster.name.split(' ')[0]} Region
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
            {isSimpleMode
              ? 'Real-time matches connecting water suppliers with buyers to save money & avoid river dumping.'
              : `Optimal MILP superstructure allocation across ${cluster.name}`}
          </p>
        </div>

        {/* Action Controls & New Feature Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* ROI Calculator Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenSavingsCalculator}
            style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
          >
            <Calculator size={15} />
            <span>ROI Calculator</span>
          </button>

          {/* ESG Certificate Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenESGCertificate}
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
          >
            <Award size={15} />
            <span>ESG Certificate</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 size={15} />
            <span>{showSettings ? 'Hide Tuning' : isSimpleMode ? 'Change Strategy' : 'Tune Weights'}</span>
            {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button className="btn btn-primary btn-sm" onClick={onRunOptimization}>
            <Play size={15} />
            <span>Recalculate Routes</span>
          </button>
        </div>
      </div>

      {/* Seasonal Climate Stress Simulator Bar */}
      <div
        className="ui-card"
        style={{
          padding: '14px 20px',
          background: climateSeason === 'drought'
            ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)'
            : climateSeason === 'dry'
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(14, 165, 233, 0.08) 100%)'
            : 'rgba(255, 255, 255, 0.02)',
          border: climateSeason === 'drought'
            ? '1px solid rgba(244, 63, 94, 0.35)'
            : '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {climateSeason === 'drought' ? (
            <Sun size={20} color="#f43f5e" />
          ) : (
            <CloudRain size={20} color="var(--brand-cyan)" />
          )}
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#fff' }}>
              Climate & Drought Season Simulator:
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
              {climateSeason === 'drought'
                ? '🚨 Severe Drought: City water price is $3.80/m³. AquaSwap emergency rerouting prevents factory shutdowns!'
                : climateSeason === 'dry'
                ? '⛅ Dry Season: Aquifers stressed. Recycled water saves up to 60% compared to $2.40/m³ tap tariffs.'
                : '🌧️ Monsoon / Wet: Baseline tariffs apply ($1.80/m³). Regular circular trades.'}
            </span>
          </div>
        </div>

        {/* Season Switcher Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`tab-pill ${climateSeason === 'monsoon' ? 'active' : ''}`}
            onClick={() => setClimateSeason('monsoon')}
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
          >
            🌧️ Monsoon
          </button>
          <button
            className={`tab-pill ${climateSeason === 'dry' ? 'active' : ''}`}
            onClick={() => setClimateSeason('dry')}
            style={{ fontSize: '0.78rem', padding: '5px 12px' }}
          >
            ⛅ Dry Season
          </button>
          <button
            className={`tab-pill ${climateSeason === 'drought' ? 'active' : ''}`}
            onClick={() => setClimateSeason('drought')}
            style={{
              fontSize: '0.78rem',
              padding: '5px 12px',
              borderColor: climateSeason === 'drought' ? 'rgba(244, 63, 94, 0.5)' : 'transparent',
              color: climateSeason === 'drought' ? '#fb7185' : 'var(--text-muted)'
            }}
          >
            ☀️ Severe Drought
          </button>
        </div>
      </div>

      {/* Goal Presets Banner */}
      <div
        className="ui-card"
        style={{
          padding: '14px 18px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--brand-cyan)" />
          <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Quick Optimization Goal:</strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Choose what matters most to your industrial park:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => applyPreset('default')}
            style={{ fontSize: '0.78rem' }}
          >
            ⚖️ Balanced Mix
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => applyPreset('eco')}
            style={{ fontSize: '0.78rem', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
          >
            🌿 Save Max Water
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => applyPreset('budget')}
            style={{ fontSize: '0.78rem', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}
          >
            💰 Lowest Costs
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => applyPreset('local')}
            style={{ fontSize: '0.78rem', borderColor: 'rgba(14, 165, 233, 0.3)', color: '#38bdf8' }}
          >
            📍 Shortest Trips Only
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards with Relatable Everyday Analogies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Recycled Volume */}
        <div className="ui-card" style={{ padding: '18px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Water Recycled</span>
              <span title="Volume of wastewater cleaned and reused daily instead of being dumped" style={{ cursor: 'help' }}>ℹ️</span>
            </span>
            <Droplets size={18} color="var(--brand-cyan)" />
          </div>
          <div className="mono" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
            {metrics.totalReusedM3Day?.toLocaleString() || 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>m³/day</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>🏊</span>
            <span>≈ <strong>{olympicPools}</strong> Olympic pools/year</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Enough water for <strong>{peopleSupplied.toLocaleString()}</strong> people daily
          </div>
        </div>

        {/* Money Saved */}
        <div className="ui-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Total Money Saved</span>
              <span title="Net financial savings comparing cheaper recycled water against expensive city water and dumping fines" style={{ cursor: 'help' }}>ℹ️</span>
            </span>
            <DollarSign size={18} color="var(--accent-emerald)" />
          </div>
          <div className="mono" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#34d399', marginTop: '6px' }}>
            ${Math.round(metrics.netEconomicSurplusYear || 0).toLocaleString()}
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/yr</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '6px' }}>
            💵 Combined savings for participating factories
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Avoids ${Math.round(metrics.avoidedDischargeFinesYear || 0).toLocaleString()} in sewer penalty fines
          </div>
        </div>

        {/* Active Connections */}
        <div className="ui-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Active Trade Routes</span>
              <span title="Number of bilateral factory partnerships actively exchanging water" style={{ cursor: 'help' }}>ℹ️</span>
            </span>
            <Layers size={18} color="var(--brand-cyan)" />
          </div>
          <div className="mono" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
            {metrics.activeMatchCount || 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>routes</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Truck size={13} color="var(--brand-cyan)" />
            <span>Avg trip distance: <strong>{metrics.averageTruckDistanceKm || 0} km</strong></span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Fast local delivery via standard tanker trucks
          </div>
        </div>

        {/* Environmental Carbon Saved */}
        <div className="ui-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Emissions Cut</span>
              <span title="CO2 emissions prevented by not needing deep groundwater pumping" style={{ cursor: 'help' }}>ℹ️</span>
            </span>
            <Leaf size={18} color="var(--accent-emerald)" />
          </div>
          <div className="mono" style={{ fontSize: '1.65rem', fontWeight: 700, color: '#34d399', marginTop: '6px' }}>
            {metrics.avoidedCO2TonsYear || 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>t CO₂e/yr</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '6px' }}>
            🌳 Equivalent to planting <strong>{treesEquivalent.toLocaleString()}</strong> trees
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Cuts heavy energy used by deep-well borehole pumps
          </div>
        </div>
      </div>

      {/* Advanced Settings Drawer */}
      {showSettings && (
        <div className="ui-card" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings2 size={16} color="var(--brand-cyan)" />
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>
                {isSimpleMode ? 'Tuning Preferences' : 'Mathematical Objective Weights'}
              </strong>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                applyPreset('default');
                onRunOptimization();
              }}
            >
              <RotateCcw size={13} /> Reset to Defaults
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {isSimpleMode ? 'River Scarcity Priority' : 'Alpha (Scarcity Weight)'}
                </span>
                <span className="mono" style={{ color: '#fff', fontWeight: 600 }}>{solverOptions.alpha.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.1"
                value={solverOptions.alpha}
                onChange={(e) => setSolverOptions({ ...solverOptions, alpha: parseFloat(e.target.value) })}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Higher value = favor helping factories in drought-prone areas
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {isSimpleMode ? 'Travel Distance Penalty' : 'Beta (Logistics Cost Penalty)'}
                </span>
                <span className="mono" style={{ color: '#fff', fontWeight: 600 }}>{solverOptions.beta.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={solverOptions.beta}
                onChange={(e) => setSolverOptions({ ...solverOptions, beta: parseFloat(e.target.value) })}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Higher value = keep truck trips short and local
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {isSimpleMode ? 'Treatment Cost Penalty' : 'Gamma (Treatment OPEX)'}
                </span>
                <span className="mono" style={{ color: '#fff', fontWeight: 600 }}>{solverOptions.gamma.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={solverOptions.gamma}
                onChange={(e) => setSolverOptions({ ...solverOptions, gamma: parseFloat(e.target.value) })}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Higher value = prefer direct reuse over expensive filters
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {isSimpleMode ? 'Min Tanker Volume' : 'qMin (m³/day threshold)'}
                </span>
                <span className="mono" style={{ color: '#fff', fontWeight: 600 }}>{solverOptions.qMin} m³</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={solverOptions.qMin}
                onChange={(e) => setSolverOptions({ ...solverOptions, qMin: parseInt(e.target.value, 10) })}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Smallest trade allowed (1 standard truck = 25 m³)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Routes Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              Active Water Exchange Corridors
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {activeConnections.length} verified routes matching wastewater with industrial needs
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className={`tab-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              All Routes ({activeConnections.length})
            </button>
            <button
              className={`tab-pill ${activeFilter === 'short_dist' ? 'active' : ''}`}
              onClick={() => setActiveFilter('short_dist')}
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              Short Distance (&lt;10km)
            </button>
            <button
              className={`tab-pill ${activeFilter === 'high_savings' ? 'active' : ''}`}
              onClick={() => setActiveFilter('high_savings')}
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              High Volume (150m³+)
            </button>
          </div>
        </div>

        {/* Route Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>
          {filteredConnections.map((conn, idx) => (
            <div
              key={idx}
              className="ui-card"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderLeft: '4px solid var(--brand-cyan)'
              }}
            >
              {/* Partner Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                      {conn.supplierName}
                    </span>
                    <ArrowRight size={14} color="var(--brand-cyan)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
                      {conn.buyerName}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {conn.supplierSector} → {conn.buyerSector}
                  </div>
                </div>

                <span className="status-pill status-emerald">
                  ${Math.round(conn.totalCostDaily * 2.8).toLocaleString()}/day savings
                </span>
              </div>

              {/* Plain English Story Box */}
              <div
                style={{
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  lineHeight: 1.45,
                  color: '#cbd5e1'
                }}
              >
                💧 <strong>How it works:</strong> {conn.supplierName} cleans its leftover rinse water using a{' '}
                <strong style={{ color: '#38bdf8' }}>{conn.treatmentTech.shortName}</strong> and sends{' '}
                <strong style={{ color: '#fff' }}>{conn.flowVolumeM3} m³/day</strong> to {conn.buyerName} across a{' '}
                <strong>{conn.distanceKm} km</strong> trip.
              </div>

              {/* Route Metric Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Daily Volume</div>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    {conn.flowVolumeM3} m³
                  </div>
                </div>

                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Distance</div>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    {conn.distanceKm} km
                  </div>
                </div>

                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Daily Tankers</div>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                    {conn.tankerTrucksDaily} trucks
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
