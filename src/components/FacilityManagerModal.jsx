import React, { useState } from 'react';
import { PlusCircle, Building2, Droplets, X, Sparkles } from 'lucide-react';

const PRESET_TEMPLATES = {
  textile: {
    sector: 'Textile Dyeing & Finishing',
    volume: 600,
    tds: 2200,
    cod: 480,
    bod: 120,
    chlorides: 450,
    sulfates: 320,
    ph: 7.8,
    desc: 'Washing and rinse effluent with low salt and moderate organic dyes.'
  },
  beverage: {
    sector: 'Food & Beverage Processing',
    volume: 350,
    tds: 650,
    cod: 380,
    bod: 180,
    chlorides: 90,
    sulfates: 60,
    ph: 6.8,
    desc: 'Clean bottle wash and packaging process water.'
  },
  concrete: {
    sector: 'Concrete & Masonry Batching',
    volume: 400,
    tds: 35000,
    cod: 500,
    bod: 100,
    chlorides: 1000,
    sulfates: 3000,
    ph: 8.5,
    desc: 'High tolerance for batch mixing and dust suppression.'
  },
  cooling: {
    sector: 'Industrial Cooling Towers',
    volume: 500,
    tds: 2500,
    cod: 80,
    bod: 20,
    chlorides: 400,
    sulfates: 350,
    ph: 7.5,
    desc: 'Cooling tower makeup water with low organic content.'
  }
};

export default function FacilityManagerModal({ isOpen, onClose, onAddFacility, isSimpleMode }) {
  if (!isOpen) return null;

  const [type, setType] = useState('supplier'); // 'supplier' or 'buyer'
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('textile');
  const [sector, setSector] = useState(PRESET_TEMPLATES.textile.sector);
  const [volume, setVolume] = useState(PRESET_TEMPLATES.textile.volume);
  const [tds, setTds] = useState(PRESET_TEMPLATES.textile.tds);
  const [chlorides, setChlorides] = useState(PRESET_TEMPLATES.textile.chlorides);
  const [cod, setCod] = useState(PRESET_TEMPLATES.textile.cod);
  const [sulfates, setSulfates] = useState(PRESET_TEMPLATES.textile.sulfates);
  const [bod, setBod] = useState(PRESET_TEMPLATES.textile.bod);
  const [ph, setPh] = useState(PRESET_TEMPLATES.textile.ph);

  const applyTemplate = (key) => {
    setSelectedTemplate(key);
    const tmpl = PRESET_TEMPLATES[key];
    if (tmpl) {
      setSector(tmpl.sector);
      setVolume(tmpl.volume);
      setTds(tmpl.tds);
      setChlorides(tmpl.chlorides);
      setCod(tmpl.cod);
      setSulfates(tmpl.sulfates);
      setBod(tmpl.bod);
      setPh(tmpl.ph);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const facilityName = name.trim() || `${sector.split(' ')[0]} Facility ${Math.floor(Math.random() * 100)}`;

    // Generate random map offset within bounds
    const rx = 180 + Math.floor(Math.random() * 550);
    const ry = 120 + Math.floor(Math.random() * 320);

    if (type === 'supplier') {
      const newSup = {
        id: `sup-${Date.now()}`,
        name: facilityName,
        sector,
        category: 'Orange',
        capacityW: parseInt(volume, 10),
        effluent: {
          TDS: parseInt(tds, 10),
          COD: parseInt(cod, 10),
          BOD: parseInt(bod, 10),
          CHLORIDES: parseInt(chlorides, 10),
          SULFATES: parseInt(sulfates, 10),
          pH: parseFloat(ph)
        },
        coords: { x: rx, y: ry, lat: 24.01 + (ry - 250) * 0.0005, lng: 90.39 + (rx - 400) * 0.0005 },
        description: `Registered ${sector} generating ${volume} m³/day of reusable water.`
      };
      onAddFacility('supplier', newSup);
    } else {
      const newBuy = {
        id: `buy-${Date.now()}`,
        name: facilityName,
        sector,
        demandD: parseInt(volume, 10),
        scarcityFactorS: 0.85,
        toleranceM: {
          TDS: parseInt(tds, 10),
          COD: parseInt(cod, 10),
          BOD: parseInt(bod, 10),
          CHLORIDES: parseInt(chlorides, 10),
          SULFATES: parseInt(sulfates, 10),
          pH_min: 6.0,
          pH_max: 9.0
        },
        coords: { x: rx, y: ry, lat: 24.01 + (ry - 250) * 0.0005, lng: 90.39 + (rx - 400) * 0.0005 },
        description: `Registered ${sector} with demand of ${volume} m³/day for industrial process water.`
      };
      onAddFacility('buyer', newBuy);
    }

    onClose();
  };

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
              <button
                type="button"
                className={`tab-pill ${selectedTemplate === 'textile' ? 'active' : ''}`}
                onClick={() => applyTemplate('textile')}
                style={{ fontSize: '0.75rem', justifyContent: 'center' }}
              >
                👕 Textile Dyeing
              </button>
              <button
                type="button"
                className={`tab-pill ${selectedTemplate === 'beverage' ? 'active' : ''}`}
                onClick={() => applyTemplate('beverage')}
                style={{ fontSize: '0.75rem', justifyContent: 'center' }}
              >
                🥤 Food & Beverage
              </button>
              <button
                type="button"
                className={`tab-pill ${selectedTemplate === 'concrete' ? 'active' : ''}`}
                onClick={() => applyTemplate('concrete')}
                style={{ fontSize: '0.75rem', justifyContent: 'center' }}
              >
                🧱 Concrete Plant
              </button>
              <button
                type="button"
                className={`tab-pill ${selectedTemplate === 'cooling' ? 'active' : ''}`}
                onClick={() => applyTemplate('cooling')}
                style={{ fontSize: '0.75rem', justifyContent: 'center' }}
              >
                ❄️ Cooling Towers
              </button>
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
