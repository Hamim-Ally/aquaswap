import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ASTM_C1602_LIMITS } from '../data/industrialProfiles';

export default function BlendingSimulator({ isSimpleMode, onOpenHowItWorks }) {
  const [concreteType, setConcreteType] = useState('reinforced'); // 'reinforced' or 'unreinforced'

  const [streams, setStreams] = useState([
    {
      id: 'stream-1',
      name: 'Factory Brine (High Salt Wastewater)',
      volume: 15,
      TDS: 34000,
      COD: 60,
      CHLORIDES: 14500,
      SULFATES: 5200,
      pH: 7.6,
      color: '#f43f5e',
      role: 'Heavy Salt Waste'
    },
    {
      id: 'stream-2',
      name: 'Textile Rinse Water (Filtered)',
      volume: 120,
      TDS: 1800,
      COD: 420,
      CHLORIDES: 350,
      SULFATES: 260,
      pH: 8.2,
      color: '#0ea5e9',
      role: 'Main Recycled Base'
    },
    {
      id: 'stream-3',
      name: 'Beverage & Wash Water',
      volume: 80,
      TDS: 480,
      COD: 380,
      CHLORIDES: 95,
      SULFATES: 70,
      pH: 6.7,
      color: '#10b981',
      role: 'Clean Dilution Stream'
    },
    {
      id: 'stream-4',
      name: 'Fresh Groundwater (Tap)',
      volume: 35,
      TDS: 280,
      COD: 10,
      CHLORIDES: 45,
      SULFATES: 30,
      pH: 7.1,
      color: '#818cf8',
      role: 'Pure Backup Water'
    }
  ]);

  const limits = ASTM_C1602_LIMITS[concreteType];
  const totalVolume = streams.reduce((acc, s) => acc + s.volume, 0);

  const blended = { TDS: 0, COD: 0, CHLORIDES: 0, SULFATES: 0, pH: 7.0 };

  if (totalVolume > 0) {
    ['TDS', 'COD', 'CHLORIDES', 'SULFATES'].forEach((param) => {
      const totalMass = streams.reduce((acc, s) => acc + s.volume * s[param], 0);
      blended[param] = Math.round(totalMass / totalVolume);
    });
    const totalH = streams.reduce((acc, s) => acc + s.volume * Math.pow(10, -s.pH), 0);
    blended.pH = Number((-Math.log10(totalH / totalVolume)).toFixed(1));
  }

  // Safety evaluations
  const isTdsPass = blended.TDS <= limits.TDS;
  const isChloridePass = blended.CHLORIDES <= limits.CHLORIDES;
  const isSulfatePass = blended.SULFATES <= limits.SULFATES;
  const isCodPass = blended.COD <= limits.COD;
  const isAllPass = isTdsPass && isChloridePass && isSulfatePass && isCodPass;

  // Concrete physical behavior model
  const settingTimeHours = Number(
    Math.max(1.2, Math.min(10.5, 3.5 + (blended.COD / 500) * 1.5 - (blended.CHLORIDES / 5000) * 0.8)).toFixed(1)
  );
  const compressiveStrengthPct = Number(
    Math.max(85, Math.min(104, 100 - (blended.COD / 400) * 2.5 - (blended.SULFATES / 3000) * 2.0)).toFixed(1)
  );

  const recycledVolume = streams[0].volume + streams[1].volume + streams[2].volume;
  const recycledPct = totalVolume > 0 ? Math.round((recycledVolume / totalVolume) * 100) : 0;

  const updateVolume = (idx, val) => {
    const updated = [...streams];
    updated[idx].volume = parseInt(val, 10) || 0;
    setStreams(updated);
  };

  // 1-Click Recipe Presets
  const loadPreset = (type) => {
    if (type === 'safe_eco') {
      setStreams([
        { ...streams[0], volume: 10 },
        { ...streams[1], volume: 130 },
        { ...streams[2], volume: 90 },
        { ...streams[3], volume: 20 }
      ]);
    } else if (type === 'too_salty') {
      setStreams([
        { ...streams[0], volume: 95 },
        { ...streams[1], volume: 40 },
        { ...streams[2], volume: 20 },
        { ...streams[3], volume: 10 }
      ]);
    } else {
      // Benchmark
      setStreams([
        { ...streams[0], volume: 0 },
        { ...streams[1], volume: 0 },
        { ...streams[2], volume: 0 },
        { ...streams[3], volume: 250 }
      ]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
              {isSimpleMode ? 'Water Blending Lab (Recipe Mixer)' : 'Multi-Stream Water Blending Simulator'}
            </h1>
            <span className="status-pill status-cyan">ASTM C1602 Concrete Standard</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
            {isSimpleMode
              ? 'Mix different factory water streams like a drink recipe to find a 100% safe blend for making concrete.'
              : 'Multi-contaminant mass balance blending model calibrated against ASTM C1602 structural limits.'}
          </p>
        </div>

        {/* 1-Click Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadPreset('safe_eco')}
            style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
          >
            <Sparkles size={14} />
            <span>Try Safe Eco Recipe</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadPreset('too_salty')}
            style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
          >
            <span>⚠️ Try "Too Salty" Demo</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadPreset('benchmark')}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Friendly Analogy Box for General Users */}
      {isSimpleMode && (
        <div
          className="ui-card"
          style={{
            padding: '16px 20px',
            background: 'rgba(14, 165, 233, 0.06)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{ fontSize: '1.8rem' }}>🍹</div>
          <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
            <strong>How this works:</strong> Concrete factories need thousands of liters of water to mix cement, but drinking water is scarce.
            If salty wastewater is too concentrated by itself, we can blend it with cleaner wash water.
            Adjust the sliders below to see if the resulting mix is strong and safe enough to build roads and buildings!
          </div>
        </div>
      )}

      {/* Main Grid: Stream Sliders (Left) & Safety Scorecard (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        
        {/* Left: Interactive Ingredients (Streams) */}
        <div className="ui-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={18} color="var(--brand-cyan)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
                Water Ingredients to Mix
              </h2>
            </div>
            <div className="status-pill status-cyan">
              Total Volume: {totalVolume} m³/day
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {streams.map((stream, idx) => (
              <div
                key={stream.id}
                style={{
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stream.color }} />
                      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{stream.name}</strong>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {stream.role} • Saltiness: {stream.TDS.toLocaleString()} mg/L
                    </div>
                  </div>

                  <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>
                    {stream.volume} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>m³/day</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={stream.volume}
                  onChange={(e) => updateVolume(idx, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Concrete Type Selector */}
          <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              What is this concrete used for?
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`tab-pill ${concreteType === 'reinforced' ? 'active' : ''}`}
                onClick={() => setConcreteType('reinforced')}
                style={{ fontSize: '0.78rem', flex: 1, justifyContent: 'center' }}
              >
                🏢 Reinforced (Buildings with Steel)
              </button>
              <button
                className={`tab-pill ${concreteType === 'unreinforced' ? 'active' : ''}`}
                onClick={() => setConcreteType('unreinforced')}
                style={{ fontSize: '0.78rem', flex: 1, justifyContent: 'center' }}
              >
                🛣️ Pavement & Road Blocks
              </button>
            </div>
          </div>
        </div>

        {/* Right: Blended Result & Safety Scorecard */}
        <div className="ui-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
              Blended Recipe Safety Scorecard
            </h2>
            <span className={`status-pill ${isAllPass ? 'status-emerald' : 'status-rose'}`}>
              {isAllPass ? '✅ 100% Safe to Use' : '⚠️ Unsafe: Exceeds Limits'}
            </span>
          </div>

          {/* Big Status Banner */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: isAllPass ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: `1px solid ${isAllPass ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {isAllPass ? (
              <CheckCircle2 size={24} color="#34d399" />
            ) : (
              <AlertCircle size={24} color="#f43f5e" />
            )}
            <div>
              <strong style={{ fontSize: '0.95rem', color: isAllPass ? '#34d399' : '#fb7185' }}>
                {isAllPass
                  ? 'All Safety Checks Passed!'
                  : 'Recipe Exceeds Safety Thresholds!'}
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                {isAllPass
                  ? `This blend replaces ${recycledPct}% of fresh water without risking concrete strength or cracking.`
                  : 'Too much salt or organic waste in the mix. Add more wash water or groundwater to dilute it!'}
              </p>
            </div>
          </div>

          {/* Physical Concrete Performance Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                28-Day Strength Rating
              </div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: compressiveStrengthPct >= 95 ? '#34d399' : '#fbbf24', marginTop: '4px' }}>
                {compressiveStrengthPct}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {compressiveStrengthPct >= 95 ? 'Rock solid strength' : 'Slight strength reduction'}
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Drying / Setting Time
              </div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {settingTimeHours} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>hours</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Ideal window: 2 to 6 hours
              </div>
            </div>
          </div>

          {/* Chemical Limit Breakdown in Plain English */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Chemical Safety Checks:
            </h3>

            {/* Chlorides */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#fff' }}>Chlorides (Corrosion Risk)</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max limit: {limits.CHLORIDES} mg/L</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{ fontSize: '0.9rem', color: isChloridePass ? '#34d399' : '#f43f5e', fontWeight: 600 }}>
                  {blended.CHLORIDES} mg/L
                </span>
                <span style={{ fontSize: '0.8rem' }}>{isChloridePass ? '✅' : '❌'}</span>
              </div>
            </div>

            {/* Sulfates */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#fff' }}>Sulfates (Cracking Risk)</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max limit: {limits.SULFATES} mg/L</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{ fontSize: '0.9rem', color: isSulfatePass ? '#34d399' : '#f43f5e', fontWeight: 600 }}>
                  {blended.SULFATES} mg/L
                </span>
                <span style={{ fontSize: '0.8rem' }}>{isSulfatePass ? '✅' : '❌'}</span>
              </div>
            </div>

            {/* Total Saltiness */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#fff' }}>TDS (Total Saltiness)</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max limit: {limits.TDS} mg/L</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{ fontSize: '0.9rem', color: isTdsPass ? '#34d399' : '#f43f5e', fontWeight: 600 }}>
                  {blended.TDS} mg/L
                </span>
                <span style={{ fontSize: '0.8rem' }}>{isTdsPass ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
