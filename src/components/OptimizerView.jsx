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
              Factory Water Exchange Network
            </h1>
            <span className="status-pill status-cyan">
              {cluster.name.split(' ')[0]} Region
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
            Real-time matches connecting water suppliers with buyers to save money &amp; avoid river dumping.
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
            <span>{showSettings ? 'Hide Tuning' : 'Change Strategy'}</span>
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            ROI <strong style={{ color: '#34d399' }}>{metrics.roiPercent || 0}%</strong> on{' '}
            ${Math.round(metrics.totalOperatingCostYear || 0).toLocaleString()} invested
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

      {/* Transport Fleet & ROI Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Fleet Load Efficiency */}
        <div className="ui-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="var(--brand-cyan)" />
              <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Transport Network Efficiency</strong>
            </div>
            <span className="status-pill status-cyan">{metrics.trucksOnRoadDaily || 0} truck trips/day</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
            Trucks average <strong style={{ color: '#fff' }}>{metrics.averageTruckDistanceKm || 0} km</strong> per trip. The engine
            picks the cheapest truck size for each route — a larger truck running half-empty loses efficiency because you pay the
            full trip either way.
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fleet load factor (how full the trucks run)</span>
              <span className="mono" style={{ color: '#fff', fontWeight: 700 }}>
                {metrics.fleetUtilizationPct || 0}%
              </span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${metrics.fleetUtilizationPct || 0}%`,
                  background: 'linear-gradient(90deg, #0ea5e9, #34d399)',
                  borderRadius: '6px'
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', lineHeight: 1.55, color: 'var(--text-muted)' }}>
            {metrics.fleetEfficiencyLossPct > 0
              ? `⚠️ ${metrics.fleetEfficiencyLossPct}% of truck space rolls empty — transport cost per m³ rises by that share on partial loads.`
              : '✅ Every truck trip ships completely full — zero transport efficiency loss. 🎯'}
          </div>
        </div>

        {/* Water ROI Ledger */}
        <div className="ui-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="#34d399" />
              <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Water ROI Ledger</strong>
            </div>
            <span className="status-pill status-emerald">ROI {metrics.roiPercent || 0}% / yr</span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            1 m³ is worth <strong style={{ color: '#38bdf8' }}>${(cluster.municipalWaterTariff + cluster.sewerDischargeFine).toFixed(2)}</strong>{' '}
            here — city water ${cluster.municipalWaterTariff.toFixed(2)} + dumping fine ${cluster.sewerDischargeFine.toFixed(2)} avoided.
          </div>

          {[
            { label: '➕ Water value generated', val: metrics.totalValueDaily, neg: false },
            { label: '➖ Buying water from suppliers', val: metrics.totalPurchaseCostDaily, neg: true },
            { label: '➖ Trucking & fuel', val: metrics.totalTransportCostDaily, neg: true },
            { label: '➖ Treatment & cleaning', val: metrics.totalTreatmentCostDaily, neg: true }
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-body)' }}>{row.label}</span>
              <span className="mono" style={{ color: row.neg ? '#fb7185' : '#34d399', fontWeight: 700 }}>
                {row.neg ? '−' : '+'}${Math.abs(Math.round(row.val || 0)).toLocaleString()}/day
              </span>
            </div>
          ))}

          <div
            style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: '10px',
              marginTop: '2px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>Net profit</span>
            <span className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
              +${Math.round(metrics.totalNetDaily || 0).toLocaleString()}/day
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            ${Math.round(metrics.netEconomicSurplusYear || 0).toLocaleString()}/yr net on{' '}
            ${Math.round(metrics.totalOperatingCostYear || 0).toLocaleString()}/yr invested = {metrics.roiPercent || 0}% ROI
            (${metrics.netProfitPerM3 || 0} profit per m³). Only ROI-positive trades are executed.
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
                Tuning Preferences
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
                  River Scarcity Priority
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
                  Travel Distance Penalty
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
                  Treatment Cost Penalty
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
                  Min Tanker Volume
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
                  💰 ${Math.round(conn.netDaily || 0).toLocaleString()}/day profit
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
                <strong>{conn.distanceKm} km</strong> trip with a <strong style={{ color: '#38bdf8' }}>{conn.truckName}</strong> ({conn.tripsDaily} trips/day).
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
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Truck Fleet</div>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                    {conn.tripsDaily}× {conn.truckCapacityM3}m³
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      marginTop: '1px',
                      color: conn.truckUtilizationPct >= 90 ? '#34d399' : conn.truckUtilizationPct >= 70 ? '#fbbf24' : '#fb7185'
                    }}
                  >
                    {conn.truckUtilizationPct}% full
                    {conn.transportEfficiencyLossPct > 0 ? ` (−${conn.transportEfficiencyLossPct}% eff.)` : ' 🎯'}
                  </div>
                </div>
              </div>

              {/* ROI Deal Economics Line */}
              <div
                style={{
                  padding: '10px 12px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.78rem',
                  lineHeight: 1.55,
                  color: '#cbd5e1'
                }}
              >
                💸 <strong style={{ color: '#fff' }}>Deal economics:</strong> buy water at{' '}
                <span className="mono">${conn.purchasePerM3}</span>/m³, truck it for{' '}
                <span className="mono">${conn.transportCostPerM3}</span>/m³
                {conn.transportEfficiencyLossPct > 0 ? ` (incl. ${conn.transportEfficiencyLossPct}% empty-space loss)` : ''}, treat
                at <span className="mono">${conn.treatmentCostPerM3}</span>/m³ — all-in{' '}
                <span className="mono" style={{ color: '#fff' }}>${conn.deliveredCostPerM3}</span>/m³, worth{' '}
                <span className="mono" style={{ color: '#38bdf8' }}>${conn.valuePerM3}</span>/m³ →{' '}
                <span className="mono" style={{ color: '#34d399', fontWeight: 700 }}>
                  +${conn.marginPerM3}/m³ margin
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
