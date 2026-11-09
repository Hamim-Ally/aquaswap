import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Building2,
  Droplets,
  X,
  Sparkles,
  CheckCircle2,
  FlaskConical,
  Compass,
  ArrowRight,
  ShieldCheck,
  Truck
} from 'lucide-react';

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

export default function FacilityManagerModal({ isOpen, onClose, onAddFacility, initialType = 'supplier' }) {
  const navigate = useNavigate();

  const [type, setType] = useState(initialType);
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

  // Success state after registration
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  React.useEffect(() => {
    if (initialType) setType(initialType);
  }, [initialType, isOpen]);

  const handleClose = () => {
    setIsSuccess(false);
    setRegisteredData(null);
    onClose();
  };

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

    let createdFacility;

    if (type === 'supplier') {
      createdFacility = {
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
      onAddFacility('supplier', createdFacility);
    } else {
      createdFacility = {
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
      onAddFacility('buyer', createdFacility);
    }

    // Persist to localStorage so the Blender Lab knows about this newly registered factory stream
    try {
      localStorage.setItem('aquaswap_latest_facility', JSON.stringify({
        type,
        facility: createdFacility
      }));
    } catch {
      // ignore
    }

    setRegisteredData({ type, facility: createdFacility });
    setIsSuccess(true);
  };

  const handleGoToBlender = () => {
    handleClose();
    navigate('/blender');
  };

  const handleGoToOptimizer = () => {
    handleClose();
    navigate('/optimizer');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={handleClose}
    >
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: isSuccess ? '640px' : '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          padding: '26px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isSuccess ? '#dcfce7' : '#f0f9ff',
                border: isSuccess ? '1px solid #bbf7d0' : '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isSuccess ? (
                <CheckCircle2 size={20} color="#16a34a" />
              ) : (
                <PlusCircle size={20} color="#0284c7" />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {isSuccess ? 'Facility Registered Successfully' : 'Register Industrial Facility'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isSuccess
                  ? 'Your facility profile is now indexed in the AquaSwap network'
                  : 'Add an industrial water supplier or buyer to the regional network'}
              </p>
            </div>
          </div>

          <button onClick={handleClose} className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* VIEW 1: REGISTRATION SUCCESS & NEXT-STEP SCREEN */}
        {isSuccess && registeredData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Registration Summary Card */}
            <div
              style={{
                padding: '16px 18px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                    {registeredData.facility.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {registeredData.facility.sector}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`status-pill ${registeredData.type === 'supplier' ? 'status-cyan' : 'status-emerald'}`}>
                    {registeredData.type === 'supplier' ? 'Water Supplier' : 'Water Buyer'}
                  </span>
                  <span className="status-pill status-cyan">
                    {registeredData.facility.capacityW || registeredData.facility.demandD} m³/day
                  </span>
                </div>
              </div>

              {/* Water chemistry parameters quick grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                {registeredData.facility.effluent ? (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TDS</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: 600 }}>{registeredData.facility.effluent.TDS}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chlorides</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: 600 }}>{registeredData.facility.effluent.CHLORIDES}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sulfates</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: 600 }}>{registeredData.facility.effluent.SULFATES}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>COD</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: 600 }}>{registeredData.facility.effluent.COD}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pH</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: 600 }}>{registeredData.facility.effluent.pH}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max TDS</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>{registeredData.facility.toleranceM.TDS}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max Cl</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>{registeredData.facility.toleranceM.CHLORIDES}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max SO4</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>{registeredData.facility.toleranceM.SULFATES}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max COD</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>{registeredData.facility.toleranceM.COD}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pH Range</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>{registeredData.facility.toleranceM.pH_min}-{registeredData.facility.toleranceM.pH_max}</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* NEXT STEP SELECTION: HIGHLIGHTING WATER BLENDER LAB FIRST */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recommended Actions:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* 1. PRIMARY OPTION: WATER BLENDER LAB (RECOMMENDED FIRST STEP) */}
                <div
                  style={{
                    padding: '18px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1.5px solid #0284c7',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ position: 'absolute', top: '-10px', right: '16px' }}>
                    <span className="status-pill status-cyan" style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px' }}>
                      Recommended Next Step
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <FlaskConical size={22} color="#0284c7" />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Simulate Stream Blending in Water Lab</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginTop: '4px', lineHeight: 1.5 }}>
                        Different factories require specific water quality thresholds. Simulate blending this water with local cluster streams to test compatibility against ASTM C1602 or Cooling Tower standards and see how many buyers unlock!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleGoToBlender}
                    style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.9rem' }}
                  >
                    <FlaskConical size={16} />
                    <span>Launch Water Blender with this Facility</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* 2. SECONDARY OPTION: WATER EXCHANGE NETWORK & OPTIMIZER */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Compass size={20} color="#0284c7" />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                        View in Exchange Network
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                        Explore verified GIS coordinates, vehicle haulage models (Pipeline vs 28m³ Tanker vs 14m³ Bowser), and trading economics.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleGoToOptimizer}
                    style={{ width: '100%', justifyContent: 'center', padding: '9px', fontSize: '0.85rem' }}
                  >
                    <Truck size={15} />
                    <span>View Network Corridors & Fleet Logistics</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClose}
                style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}
              >
                Close & Return to Overview
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: REGISTRATION FORM */
          <>
            {/* Onboarding Guidelines Banner */}
            <div style={{ padding: '12px 14px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.8rem', color: '#0369a1', lineHeight: 1.5 }}>
              <strong style={{ color: '#0284c7' }}>Registration Guidelines:</strong> Select your trading role, choose your factory business type, and specify your water volume & chemistry parameters. Once registered, you will immediately have the option to test and blend your water in the Water Blender Lab.
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Role Choice */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-heading)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Facility Role in AquaSwap:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`tab-pill ${type === 'supplier' ? 'active' : ''}`}
                    onClick={() => setType('supplier')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Water Supplier (Discharge Source)
                  </button>
                  <button
                    type="button"
                    className={`tab-pill ${type === 'buyer' ? 'active' : ''}`}
                    onClick={() => setType('buyer')}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Water Buyer (Industrial Intake)
                  </button>
                </div>
              </div>

              {/* 1-Click Industry Templates */}
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-heading)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Industry Template (Pre-fills standard chemistry baseline):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    className={`tab-pill ${selectedTemplate === 'textile' ? 'active' : ''}`}
                    onClick={() => applyTemplate('textile')}
                    style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    Textile Dyeing & Finishing
                  </button>
                  <button
                    type="button"
                    className={`tab-pill ${selectedTemplate === 'beverage' ? 'active' : ''}`}
                    onClick={() => applyTemplate('beverage')}
                    style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    Food & Beverage Processing
                  </button>
                  <button
                    type="button"
                    className={`tab-pill ${selectedTemplate === 'concrete' ? 'active' : ''}`}
                    onClick={() => applyTemplate('concrete')}
                    style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    Concrete Batching Plant
                  </button>
                  <button
                    type="button"
                    className={`tab-pill ${selectedTemplate === 'cooling' ? 'active' : ''}`}
                    onClick={() => applyTemplate('cooling')}
                    style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    Cooling Towers Makeup
                  </button>
                </div>
              </div>

              {/* Name & Volume */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-heading)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Facility Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Industrial Ltd"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-heading)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    {type === 'supplier' ? 'Daily Discharge Flow (m³):' : 'Daily Water Needed (m³):'}
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

              {/* Chemistry Parameters */}
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-heading)', marginBottom: '8px', fontWeight: 600 }}>
                  Water Chemistry Parameters:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TDS (mg/L)</label>
                    <input type="number" value={tds} onChange={(e) => setTds(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chlorides (mg/L)</label>
                    <input type="number" value={chlorides} onChange={(e) => setChlorides(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sulfates (mg/L)</label>
                    <input type="number" value={sulfates} onChange={(e) => setSulfates(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>COD (mg/L)</label>
                    <input type="number" value={cod} onChange={(e) => setCod(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BOD (mg/L)</label>
                    <input type="number" value={bod} onChange={(e) => setBod(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>pH (6.0 - 9.0)</label>
                    <input type="number" step="0.1" value={ph} onChange={(e) => setPh(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem' }} />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <PlusCircle size={15} />
                  <span>Register Facility Profile</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
