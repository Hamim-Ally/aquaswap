import React, { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  ArrowRight,
  DatabaseZap
} from 'lucide-react';
import { END_USE_LIMITS, CONTAMINANTS, EXTENDED_CONTAMINANTS } from '../data/industrialProfiles';

const PARAM_META = { ...CONTAMINANTS, ...EXTENDED_CONTAMINANTS };

const RISK_LABELS = {
  TDS: 'Total Saltiness',
  COD: 'Organic Load',
  BOD: 'Biodegradable Organics',
  CHLORIDES: 'Corrosion Risk',
  SULFATES: 'Cracking Risk',
  HARDNESS: 'Scaling Risk',
  SILICA: 'Silica Scale',
  IRON: 'Staining Risk',
  COLOR: 'Color Defects',
  OIL: 'Film Contamination'
};

const STREAM_COLORS = ['#f43f5e', '#0ea5e9', '#10b981', '#fbbf24', '#818cf8', '#38bdf8'];

const DEFAULT_STREAMS = [
  {
    id: 'stream-1',
    name: 'Factory Brine (High Salt Wastewater)',
    volume: 15,
    TDS: 34000,
    COD: 60,
    BOD: 15,
    CHLORIDES: 14500,
    SULFATES: 5200,
    HARDNESS: 2200,
    SILICA: 180,
    IRON: 0.8,
    COLOR: 15,
    OIL: 2,
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
    BOD: 120,
    CHLORIDES: 350,
    SULFATES: 260,
    HARDNESS: 380,
    SILICA: 40,
    IRON: 1.2,
    COLOR: 180,
    OIL: 5,
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
    BOD: 95,
    CHLORIDES: 95,
    SULFATES: 70,
    HARDNESS: 260,
    SILICA: 18,
    IRON: 0.3,
    COLOR: 15,
    OIL: 3,
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
    BOD: 5,
    CHLORIDES: 45,
    SULFATES: 30,
    HARDNESS: 220,
    SILICA: 25,
    IRON: 0.15,
    COLOR: 5,
    OIL: 0.5,
    pH: 7.1,
    color: '#818cf8',
    role: 'Pure Backup Water',
    isFresh: true
  }
];

const PRESET_FRESH_STREAM = DEFAULT_STREAMS[3];

export default function BlendingSimulator({
  cluster,
  focusFacilityId,
  focusBuyerId,
  buyerAllocations,
  onOpenExchange,
  onOpenHowItWorks
}) {
  const [endUseKey, setEndUseKey] = useState('concrete_reinforced');
  const [streams, setStreams] = useState(DEFAULT_STREAMS);

  const endUse = END_USE_LIMITS[endUseKey];
  const limits = endUse.limits;
  const checkedParams = useMemo(
    () =>
      Object.keys(limits).filter(
        (k) => k !== 'pH' && k !== 'pH_min' && k !== 'pH_max'
      ),
    [limits]
  );

  // Auto-load the freshly registered factory's live water into the recipe
  useEffect(() => {
    if (focusFacilityId && cluster?.suppliers) {
      loadLiveSnapshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusFacilityId]);

  // Auto-load a sourcing plan: this buyer's actual multi-source basket + its own recycled water + fresh top-up
  useEffect(() => {
    if (focusBuyerId && buyerAllocations?.length) {
      loadBuyerSourceMix(focusBuyerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusBuyerId, buyerAllocations]);

  const totalVolume = streams.reduce((acc, s) => acc + s.volume, 0);

  const blended = useMemo(() => {
    const mix = { pH: 7.0 };
    if (totalVolume > 0) {
      checkedParams.forEach((param) => {
        const totalMass = streams.reduce((acc, s) => acc + s.volume * (s[param] || 0), 0);
        mix[param] = Math.round((totalMass / totalVolume) * 10) / 10;
      });
      const totalH = streams.reduce((acc, s) => acc + s.volume * Math.pow(10, -(s.pH ?? 7)), 0);
      mix.pH = Number((-Math.log10(totalH / totalVolume)).toFixed(1));
    } else {
      checkedParams.forEach((param) => {
        mix[param] = 0;
      });
    }
    return mix;
  }, [streams, checkedParams, totalVolume]);

  const isPhPass = blended.pH >= limits.pH_min && blended.pH <= limits.pH_max;
  const paramResults = checkedParams.map((key) => ({
    key,
    value: blended[key] || 0,
    limit: limits[key],
    pass: (blended[key] || 0) <= limits[key]
  }));
  const isAllPass = isPhPass && paramResults.every((r) => r.pass);

  // Physical outcome proxies per end-use
  const outcomes = useMemo(() => {
    if (endUse.outcomeType === 'concrete') {
      const strength = Number(
        Math.max(85, Math.min(104, 100 - ((blended.COD || 0) / 400) * 2.5 - ((blended.SULFATES || 0) / 3000) * 2.0)).toFixed(1)
      );
      const settingTime = Number(
        Math.max(1.2, Math.min(10.5, 3.5 + ((blended.COD || 0) / 500) * 1.5 - ((blended.CHLORIDES || 0) / 5000) * 0.8)).toFixed(1)
      );
      return [
        {
          label: '28-Day Strength Rating',
          value: `${strength}%`,
          hint: strength >= 95 ? 'Rock solid strength' : 'Slight strength reduction',
          color: strength >= 95 ? '#34d399' : '#fbbf24'
        },
        {
          label: 'Drying / Setting Time',
          value: `${settingTime} h`,
          hint: 'Ideal window: 2 to 6 hours',
          color: '#fff'
        }
      ];
    }

    if (endUse.outcomeType === 'cooling') {
      const scaling = Math.min(
        100,
        Math.round(((blended.HARDNESS || 0) / limits.HARDNESS) * 60 + ((blended.SILICA || 0) / limits.SILICA) * 40)
      );
      const bio = Math.min(
        100,
        Math.round(((blended.COD || 0) / limits.COD) * 60 + ((blended.BOD || 0) / limits.BOD) * 40)
      );
      return [
        {
          label: 'Scale Buildup Danger',
          value: `${scaling}%`,
          hint: scaling <= 35 ? 'Loops run clean between cleaners' : scaling <= 70 ? 'Descale twice a season' : 'Frequent acid cleaning required',
          color: scaling <= 35 ? '#34d399' : scaling <= 70 ? '#fbbf24' : '#fb7185'
        },
        {
          label: 'Biological Growth Risk',
          value: `${bio}%`,
          hint: bio <= 35 ? 'Biocide demand stays minimal' : bio <= 70 ? 'Boost biocide dosing' : 'Legionella monitoring required',
          color: bio <= 35 ? '#34d399' : bio <= 70 ? '#fbbf24' : '#fb7185'
        }
      ];
    }

    const staining = Math.min(
      100,
      Math.round(
        ((blended.COLOR || 0) / limits.COLOR) * 45 +
          ((blended.IRON || 0) / limits.IRON) * 30 +
          ((blended.HARDNESS || 0) / limits.HARDNESS) * 25
      )
    );
    const spotting = Math.min(
      100,
      Math.round(((blended.OIL || 0) / limits.OIL) * 60 + ((blended.TDS || 0) / limits.TDS) * 40)
    );
    return [
      {
        label: 'Fabric Staining Risk',
        value: `${staining}%`,
        hint: staining <= 35 ? 'Batch dyeing stays shade-true' : staining <= 70 ? 'Pre-wash recommended' : 'Rejects & re-dyes likely',
        color: staining <= 35 ? '#34d399' : staining <= 70 ? '#fbbf24' : '#fb7185'
      },
      {
        label: 'Spotting / Feel Defects',
        value: `${spotting}%`,
        hint: spotting <= 35 ? 'Smooth premium handfeel' : spotting <= 70 ? 'Extra softening pass needed' : 'Visible spots & stiff patches',
        color: spotting <= 35 ? '#34d399' : spotting <= 70 ? '#fbbf24' : '#fb7185'
      }
    ];
  }, [endUse, blended, limits]);

  const recycledStreams = streams.filter((s) => !s.isFresh);
  const recycledVolume = recycledStreams.reduce((acc, s) => acc + s.volume, 0);
  const recycledPct = totalVolume > 0 ? Math.round((recycledVolume / totalVolume) * 100) : 0;

  const updateVolume = (id, val) => {
    setStreams((prev) => prev.map((s) => (s.id === id ? { ...s, volume: parseInt(val, 10) || 0 } : s)));
  };

  // 1-Click Recipe Presets (always restore the default ingredient set)
  const loadPreset = (type) => {
    const volumes = type === 'safe_eco' ? [10, 130, 90, 20] : type === 'too_salty' ? [95, 40, 20, 10] : [0, 0, 0, 250];
    setStreams(DEFAULT_STREAMS.map((s, i) => ({ ...DEFAULT_STREAMS[i], volume: volumes[i] })));
  };

  // Load real, live effluent streams straight from the Exchange Network cluster
  const loadLiveSnapshot = () => {
    const live = (cluster?.suppliers || []).slice(0, 5).map((sup, i) => ({
      id: `live-${sup.id}`,
      name: sup.name,
      volume: Math.min(sup.capacityW, 400),
      COLOR: sup.effluent.COLOR ?? 0,
      HARDNESS: sup.effluent.HARDNESS ?? 0,
      SILICA: sup.effluent.SILICA ?? 0,
      IRON: sup.effluent.IRON ?? 0,
      OIL: sup.effluent.OIL ?? 0,
      TDS: sup.effluent.TDS,
      COD: sup.effluent.COD,
      BOD: sup.effluent.BOD ?? 0,
      CHLORIDES: sup.effluent.CHLORIDES,
      SULFATES: sup.effluent.SULFATES,
      pH: sup.effluent.pH,
      color: STREAM_COLORS[i % STREAM_COLORS.length],
      role: `${sup.sector} • Live network feed`
    }));
    if (live.length === 0) return;
    setStreams([...live, { ...PRESET_FRESH_STREAM, id: 'fresh-backup', name: 'Fresh Groundwater (Top-up)' }]);
  };

  // Build a buyer's sourcing plan: all its allocated supplier streams + its own recycled internal water + fresh top-up
  const loadBuyerSourceMix = (buyerId) => {
    const allocation = (buyerAllocations || []).find((a) => a.buyer.id === buyerId);
    if (!allocation) return;
    const buyerName = allocation.buyer.name;
    const sector = allocation.buyer.sector || '';
    const s = sector.toLowerCase();
    const target = s.includes('cooling')
      ? 'cooling'
      : s.includes('textile')
      ? 'textile'
      : s.includes('unreinforced') || s.includes('pavement') || s.includes('precast')
      ? 'concrete_unreinforced'
      : 'concrete_reinforced';
    setEndUseKey(target);

    const purchased = allocation.streams.map((st, i) => ({
      id: `mix-${st.supplierId}`,
      name: st.supplierName,
      volume: Math.min(st.flowVolumeM3, 400),
      TDS: st.treatedEffluent.TDS ?? 0,
      COD: st.treatedEffluent.COD ?? 0,
      BOD: st.treatedEffluent.BOD ?? 0,
      CHLORIDES: st.treatedEffluent.CHLORIDES ?? 0,
      SULFATES: st.treatedEffluent.SULFATES ?? 0,
      HARDNESS: st.treatedEffluent.HARDNESS ?? 0,
      SILICA: st.treatedEffluent.SILICA ?? 0,
      IRON: st.treatedEffluent.IRON ?? 0,
      COLOR: st.treatedEffluent.COLOR ?? 0,
      OIL: st.treatedEffluent.OIL ?? 0,
      pH: st.treatedEffluent.pH ?? 7.0,
      color: STREAM_COLORS[i % STREAM_COLORS.length],
      role: `${st.treatmentTech.shortName} • Sourced stream`
    }));

    const own = {
      id: 'own-internal',
      name: `${buyerName} — Own Recycled Internal Water`,
      volume: 60,
      TDS: 600,
      COD: 150,
      BOD: 40,
      CHLORIDES: 100,
      SULFATES: 80,
      HARDNESS: 300,
      SILICA: 20,
      IRON: 0.2,
      COLOR: 25,
      OIL: 1,
      pH: 7.2,
      color: '#a78bfa',
      role: "Factory's own recycled stream"
    };

    const fresh = {
      ...PRESET_FRESH_STREAM,
      id: 'fresh-topup',
      name: 'Fresh Groundwater (Top-up)',
      volume: 40
    };

    setStreams([...(allocation.streams.length > 0 ? purchased : []), own, fresh]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
              Water Blending Lab (Recipe Mixer)
            </h1>
            <span className="status-pill status-cyan">{endUse.label}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
            Mix real factory water streams like a drink recipe until every parameter that matters for the target industry passes.
          </p>
        </div>

        {/* 1-Click Presets & Live Load */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadLiveSnapshot}
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
            title="Pull the current effluent streams of every registered supplier in this cluster"
          >
            <DatabaseZap size={14} />
            <span>Load Live Network Water</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              loadPreset('safe_eco');
              setEndUseKey('concrete_reinforced');
            }}
            style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
          >
            <Sparkles size={14} />
            <span>Safe Eco Recipe</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadPreset('too_salty')}
            style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185' }}
          >
            <span>⚠️ Too Salty Demo</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              loadPreset('benchmark');
              setEndUseKey('concrete_reinforced');
            }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* End-Use Selector — nobody factory fits one parameter list */}
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
        <div>
          <strong style={{ fontSize: '0.85rem', color: '#fff' }}>This recipe is for:</strong>{' '}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{endUse.note}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {Object.values(END_USE_LIMITS).map((eu) => (
            <button
              key={eu.id}
              className={`tab-pill ${endUseKey === eu.id ? 'active' : ''}`}
              onClick={() => setEndUseKey(eu.id)}
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              {eu.label}
            </button>
          ))}
        </div>
      </div>

      {/* Friendly Analogy Box */}
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
          <strong>How this works:</strong> Factories don't drink the water they reuse — they ask "does this mix clear the
          specific chemistry MY process cares about?". Each end-use above keeps its own parameter checklist, and parameter rows
          only appear if that industry tracks them. Blend a too-dirty stream with a cleaner one until every check turns green!
        </div>
      </div>

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
            {streams.map((stream) => {
              const isFocus = focusFacilityId && stream.id === `live-${focusFacilityId}`;
              return (
                <div
                  key={stream.id}
                  style={{
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: isFocus ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stream.color }} />
                        <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{stream.name}</strong>
                        {isFocus && <span className="status-pill status-emerald">🆕 Just registered</span>}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {stream.role} • Saltiness: {(stream.TDS || 0).toLocaleString()} mg/L
                      </div>
                    </div>

                    <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8' }}>
                      {stream.volume} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>m³/day</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="400"
                    step="5"
                    value={stream.volume}
                    onChange={(e) => updateVolume(stream.id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Blended Result & Safety Scorecard */}
        <div className="ui-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
              Blended Recipe Safety Scorecard
            </h2>
            <span className={`status-pill ${isAllPass ? 'status-emerald' : 'status-rose'}`}>
              {isAllPass ? '✅ Safe to Use' : '⚠️ Exceeds Limits'}
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
            {isAllPass ? <CheckCircle2 size={24} color="#34d399" /> : <AlertCircle size={24} color="#f43f5e" />}
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.95rem', color: isAllPass ? '#34d399' : '#fb7185' }}>
                {isAllPass ? 'All Safety Checks Passed!' : 'Recipe Exceeds Safety Thresholds!'}
              </strong>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                {isAllPass
                  ? `This blend replaces ${recycledPct}% of fresh water for ${endUse.label.replace(/^[^\s]+\s/, '')} use.`
                  : 'Too concentrated for this end-use. Add more wash water or fresh top-up to dilute!'}
              </p>
            </div>
            {isAllPass && onOpenExchange && (
              <button className="btn btn-primary btn-sm" onClick={onOpenExchange} style={{ whiteSpace: 'nowrap' }}>
                <span>Send to Exchange Network</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Physical outcome proxies */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {outcomes.map((o, i) => (
              <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.label}</div>
                <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: o.color, marginTop: '4px' }}>
                  {o.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{o.hint}</div>
              </div>
            ))}
          </div>

          {/* Chemical Limit Breakdown — dynamic per end-use */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Chemical Safety Checks ({checkedParams.length} params tracked for this end-use):
            </h3>

            {/* pH range check */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#fff' }}>pH (Acidity Balance)</strong>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Allowed window: {limits.pH_min} – {limits.pH_max}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{ fontSize: '0.9rem', color: isPhPass ? '#34d399' : '#f43f5e', fontWeight: 600 }}>
                  {blended.pH}
                </span>
                <span style={{ fontSize: '0.8rem' }}>{isPhPass ? '✅' : '❌'}</span>
              </div>
            </div>

            {paramResults.map((r) => (
              <div
                key={r.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#fff' }}>
                    {PARAM_META[r.key]?.name || r.key} ({RISK_LABELS[r.key]})
                  </strong>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Max limit: {r.limit.toLocaleString()} {PARAM_META[r.key]?.unit || 'mg/L'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono" style={{ fontSize: '0.9rem', color: r.pass ? '#34d399' : '#f43f5e', fontWeight: 600 }}>
                    {r.value} {PARAM_META[r.key]?.unit || 'mg/L'}
                  </span>
                  <span style={{ fontSize: '0.8rem' }}>{r.pass ? '✅' : '❌'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
