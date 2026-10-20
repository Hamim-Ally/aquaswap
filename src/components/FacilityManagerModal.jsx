import React, { useState } from 'react';
import { PlusCircle, X, FlaskConical, ArrowRight, CheckCircle2 } from 'lucide-react';

const BASE_FIELDS = [
  { key: 'tds', label: 'Total Dissolved Solids', unit: 'mg/L' },
  { key: 'cod', label: 'Chemical Oxygen Demand', unit: 'mg/L' },
  { key: 'bod', label: 'Biochemical Oxygen Demand', unit: 'mg/L' },
  { key: 'chlorides', label: 'Chlorides', unit: 'mg/L' },
  { key: 'sulfates', label: 'Sulfates', unit: 'mg/L' },
  { key: 'ph', label: 'pH', unit: '' }
];

const EXTENDED_FIELDS = [
  { key: 'hardness', label: 'Hardness (CaCO₃)', unit: 'mg/L' },
  { key: 'silica', label: 'Silica', unit: 'mg/L' },
  { key: 'iron', label: 'Iron & Mn', unit: 'mg/L' },
  { key: 'color', label: 'Color / Dye', unit: 'Pt-Co' },
  { key: 'oil', label: 'Oil & Grease', unit: 'mg/L' }
];

const PRESET_TEMPLATES = {
  textile: {
    sector: 'Textile Dyeing & Finishing',
    emoji: '👕 Textile Dyeing',
    volume: 600,
    tds: 2200,
    cod: 480,
    bod: 120,
    chlorides: 450,
    sulfates: 320,
    ph: 7.8,
    hardness: 380,
    silica: 40,
    iron: 1.2,
    color: 450,
    oil: 6,
    desc: 'Washing and rinse effluent with low salt and moderate organic dyes.'
  },
  beverage: {
    sector: 'Food & Beverage Processing',
    emoji: '🥤 Food & Beverage',
    volume: 350,
    tds: 650,
    cod: 380,
    bod: 180,
    chlorides: 90,
    sulfates: 60,
    ph: 6.8,
    hardness: 260,
    silica: 18,
    iron: 0.3,
    color: 40,
    oil: 4,
    desc: 'Clean bottle wash and packaging process water.'
  },
  concrete: {
    sector: 'Concrete & Masonry Batching',
    emoji: '🧱 Concrete Plant',
    volume: 400,
    tds: 35000,
    cod: 500,
    bod: 100,
    chlorides: 1000,
    sulfates: 3000,
    ph: 8.5,
    hardness: 1800,
    silica: 120,
    iron: 1.8,
    color: 60,
    oil: 12,
    desc: 'High tolerance for batch mixing and dust suppression.'
  },
  cooling: {
    sector: 'Industrial Cooling Towers',
    emoji: '❄️ Cooling Towers',
    volume: 500,
    tds: 2500,
    cod: 80,
    bod: 20,
    chlorides: 400,
    sulfates: 350,
    ph: 7.5,
    hardness: 700,
    silica: 90,
    iron: 0.6,
    color: 25,
    oil: 2,
    desc: 'Cooling tower makeup water with low organic content.'
  }
};

export default function FacilityManagerModal({
  isOpen,
  onClose,
  onAddFacility,
  onOpenBlender,
  onOpenNetwork
}) {
  if (!isOpen) return null;

  const [type, setType] = useState('supplier'); // 'supplier' or 'buyer'
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('textile');
  const [sector, setSector] = useState(PRESET_TEMPLATES.textile.sector);
  const [volume, setVolume] = useState(PRESET_TEMPLATES.textile.volume);
  const [chem, setChem] = useState({
    tds: PRESET_TEMPLATES.textile.tds,
    cod: PRESET_TEMPLATES.textile.cod,
    bod: PRESET_TEMPLATES.textile.bod,
    chlorides: PRESET_TEMPLATES.textile.chlorides,
    sulfates: PRESET_TEMPLATES.textile.sulfates,
    ph: PRESET_TEMPLATES.textile.ph,
    hardness: PRESET_TEMPLATES.textile.hardness,
    silica: PRESET_TEMPLATES.textile.silica,
    iron: PRESET_TEMPLATES.textile.iron,
    color: PRESET_TEMPLATES.textile.color,
    oil: PRESET_TEMPLATES.textile.oil
  });
  const [showChem, setShowChem] = useState(false);
  const [registered, setRegistered] = useState(null); // { id, name, role, type }

  const applyTemplate = (key) => {
    setSelectedTemplate(key);
    const tmpl = PRESET_TEMPLATES[key];
    if (tmpl) {
      setSector(tmpl.sector);
      setVolume(tmpl.volume);
      setChem({
        tds: tmpl.tds,
        cod: tmpl.cod,
        bod: tmpl.bod,
        chlorides: tmpl.chlorides,
        sulfates: tmpl.sulfates,
        ph: tmpl.ph,
        hardness: tmpl.hardness,
        silica: tmpl.silica,
        iron: tmpl.iron,
        color: tmpl.color,
        oil: tmpl.oil
      });
    }
  };

  const parsedChem = {
    TDS: parseInt(chem.tds, 10) || 0,
    COD: parseInt(chem.cod, 10) || 0,
    BOD: parseInt(chem.bod, 10) || 0,
    CHLORIDES: parseInt(chem.chlorides, 10) || 0,
    SULFATES: parseInt(chem.sulfates, 10) || 0,
    HARDNESS: parseFloat(chem.hardness) || 0,
    SILICA: parseFloat(chem.silica) || 0,
    IRON: parseFloat(chem.iron) || 0,
    COLOR: parseFloat(chem.color) || 0,
    OIL: parseFloat(chem.oil) || 0,
    pH: parseFloat(chem.ph) || 7.0
  };

  // Does this factory's water profile fit the blending analysis?
  // (needs a plausible numeric chemistry: some solids, a valid pH)
  const fitsBlender = parsedChem.TDS > 0 && parsedChem.pH >= 4 && parsedChem.pH <= 11;

  const handleSubmit = (e) => {
    e.preventDefault();
    const facilityName = name.trim() || `${sector.split(' ')[0]} Facility ${Math.floor(Math.random() * 100)}`;

    // Generate random map offset within bounds
    const rx = 180 + Math.floor(Math.random() * 550);
    const ry = 120 + Math.floor(Math.random() * 320);

    const coords = { x: rx, y: ry, lat: 24.01 + (ry - 250) * 0.0005, lng: 90.39 + (rx - 400) * 0.0005 };

    if (type === 'supplier') {
      const newSup = {
        id: `sup-${Date.now()}`,
        name: facilityName,
        sector,
        category: 'Orange',
        capacityW: parseInt(volume, 10),
        effluent: { ...parsedChem },
        coords,
        description: `Registered ${sector} generating ${volume} m³/day of reusable water.`
      };
      onAddFacility('supplier', newSup);
      setRegistered({ id: newSup.id, name: facilityName, role: 'supplier' });
    } else {
      const newBuy = {
        id: `buy-${Date.now()}`,
        name: facilityName,
        sector,
        demandD: parseInt(volume, 10),
        scarcityFactorS: 0.85,
        toleranceM: {
          ...parsedChem,
          TDS: parsedChem.TDS,
          pH_min: Math.max(4, Math.round((parsedChem.pH - 1) * 10) / 10),
          pH_max: Math.min(11, Math.round((parsedChem.pH + 1) * 10) / 10)
        },
        coords,
        description: `Registered ${sector} with demand of ${volume} m³/day for industrial process water.`
      };
      onAddFacility('buyer', newBuy);
      setRegistered({ id: newBuy.id, name: facilityName, role: 'buyer' });
    }
  };

  const restartForm = () => {
    setRegistered(null);
    setName('');
  };

  /* ------------ SUCCESS STEP: shown right after registration ------------ */
  if (registered) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={onClose}
      >
        <div
          className="ui-card"
          style={{
            width: '100%',
            maxWidth: '480px',
            background: '#0d1322',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle2 size={26} color="#34d399" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                {registered.name} is live!
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {registered.role === 'supplier'
                  ? 'Its leftover water quality is already being scanned for profitable matches.'
                  : 'Its quality tolerances are already being matched against supplier streams.'}
              </p>
            </div>
          </div>

          {fitsBlender ? (
            <div
              style={{
                padding: '14px',
                background: 'rgba(14, 165, 233, 0.06)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.83rem',
                color: '#cbd5e1',
                lineHeight: 1.5
              }}
            >
              🧪 <strong style={{ color: '#38bdf8' }}>Water chemistry captured.</strong> This factory's parameters fit our
              blending analysis — you can stress-test its water recipe before it trades.
            </div>
          ) : (
            <div
              style={{
                padding: '14px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.83rem',
                color: '#cbd5e1',
                lineHeight: 1.5
              }}
            >
              ⚠️ Water chemistry looks incomplete — the Blender Lab needs a valid solids & pH reading. It still trades on
              the Exchange Network with the values on file.
            </div>
          )}

          {fitsBlender ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={() => onOpenBlender(registered.id)}
                style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FlaskConical size={16} />
                <span>
                  {registered.role === 'supplier'
                    ? 'Test its Water in the Blender Lab'
                    : 'Review its Quality Targets in the Blender'}
                </span>
                <ArrowRight size={15} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenNetwork(registered.id)}
                style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>
                  {registered.role === 'supplier'
                    ? 'Or see its trade routes in the Exchange Network'
                    : 'Or match suppliers in the Exchange Network'}
                </span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => onOpenNetwork(registered.id)}
              style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>See its trade routes in the Exchange Network</span>
              <ArrowRight size={15} />
            </button>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '4px' }}>
            <button className="btn btn-secondary btn-sm" onClick={restartForm}>
              <PlusCircle size={14} />
              <span>Register another factory</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------ REGISTRATION FORM ------------ */
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#0d1322',
          border: '1px solid rgba(14, 165, 233, 0.35)',
          padding: '26px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(14, 165, 233, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PlusCircle size={20} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                Register a Factory
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Add a new water supplier or buyer to the network
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '4px', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Role Choice */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Factory Role in AquaSwap:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`tab-pill ${type === 'supplier' ? 'active' : ''}`}
                onClick={() => setType('supplier')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                💧 Water Giver (Has Leftover Water)
              </button>
              <button
                type="button"
                className={`tab-pill ${type === 'buyer' ? 'active' : ''}`}
                onClick={() => setType('buyer')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                🏭 Water User (Needs Cheap Water)
              </button>
            </div>
          </div>

          {/* 1-Click Industry Templates */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              ⚡ 1-Click Quick Template (Fills typical water chemistry):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {Object.entries(PRESET_TEMPLATES).map(([key, tmpl]) => (
                <button
                  key={key}
                  type="button"
                  className={`tab-pill ${selectedTemplate === key ? 'active' : ''}`}
                  onClick={() => applyTemplate(key)}
                  style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                >
                  {tmpl.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Volume */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Factory Name:
              </label>
              <input
                type="text"
                placeholder="e.g. Green Valley Mills"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                {type === 'supplier' ? 'Daily Leftover Water (m³):' : 'Daily Water Needed (m³):'}
              </label>
              <input
                type="number"
                min="20"
                max="2000"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
            </div>
          </div>

          {/* Editable Water Chemistry */}
          <div
            style={{
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {type === 'supplier'
                  ? '💧 Actual effluent chemistry (what the factory sends out):'
                  : '🧪 Maximum quality tolerances the factory accepts:'}
              </div>
              {fitsBlender ? (
                <span className="status-pill status-emerald" style={{ fontSize: '0.7rem' }}>
                  Fits Blender analysis ✓
                </span>
              ) : (
                <span className="status-pill status-amber" style={{ fontSize: '0.7rem' }}>
                  Incomplete ✗
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {BASE_FIELDS.map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                    {f.label} {f.unit && <span style={{ opacity: 0.7 }}>({f.unit})</span>}:
                  </label>
                  <input
                    type="number"
                    step={f.key === 'ph' ? '0.1' : '1'}
                    value={chem[f.key]}
                    onChange={(e) => setChem((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              className="tab-pill"
              onClick={() => setShowChem(!showChem)}
              style={{ marginTop: '10px', fontSize: '0.74rem' }}
            >
              {showChem ? '− Hide sector-specific parameters' : '+ More parameters (sector-specific)'}
            </button>

            {showChem && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
                {EXTENDED_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                      {f.label} {f.unit && <span style={{ opacity: 0.7 }}>({f.unit})</span>}:
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={chem[f.key]}
                      onChange={(e) => setChem((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                ))}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'end' }}>
                  Only the parameters an industry tracks are enforced — leave the rest at 0.
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              <span>Add to Network</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
