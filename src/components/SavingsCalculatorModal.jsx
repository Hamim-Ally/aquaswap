import React, { useState } from 'react';
import {
  X,
  Calculator,
  DollarSign,
  Droplets,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Layers
} from 'lucide-react';

export default function SavingsCalculatorModal({
  isOpen,
  onClose,
  cluster,
  onOpenAddFacility
}) {

  const [industryType, setIndustryType] = useState('textile'); // 'textile', 'food', 'concrete', 'chemical'
  const [dailyVolume, setDailyVolume] = useState(500); // m3/day
  const [currentTariff, setCurrentTariff] = useState(cluster?.municipalWaterTariff || 1.80); // $/m3
  const [currentDischargeFine, setCurrentDischargeFine] = useState(cluster?.sewerDischargeFine || 0.95); // $/m3

  // Industry presets
  const industryProfiles = {
    textile: {
      name: 'Textile Dyeing & Finishing',
      recyclePotential: 0.75, // 75% can be recycled
      capexPerM3: 450, // basic filtration/clarifier skid
      reusableFor: 'Concrete Batching & Cooling Towers'
    },
    food: {
      name: 'Food & Beverage Processing',
      recyclePotential: 0.85,
      capexPerM3: 350,
      reusableFor: 'Industrial Washing & Construction'
    },
    concrete: {
      name: 'Ready-Mix Concrete & Masonry',
      recyclePotential: 0.90, // can absorb high volume
      capexPerM3: 200,
      reusableFor: 'Direct Process Absorption'
    },
    chemical: {
      name: 'Chemical & Pharmaceuticals',
      recyclePotential: 0.60,
      capexPerM3: 1200,
      reusableFor: 'Low-Grade Industrial Washing'
    }
  };

  const currentProfile = industryProfiles[industryType];
  const reusableVolumeDaily = Math.round(dailyVolume * currentProfile.recyclePotential);
  const annualReusableVolume = reusableVolumeDaily * 365;

  // AquaSwap pricing model: Reused water trades at ~৳20/m3 (transport + treatment)
  const aquaSwapCostPerM3 = 20.0;
  const grossSavingsPerM3 = Math.max(5.0, currentTariff - aquaSwapCostPerM3);

  // Financial calculations
  const annualWaterPurchaseSavings = Math.round(annualReusableVolume * grossSavingsPerM3);
  const annualAvoidedFines = Math.round(annualReusableVolume * currentDischargeFine * 0.7);
  const totalAnnualBenefit = annualWaterPurchaseSavings + annualAvoidedFines;

  // Payback period
  const estimatedEquipmentCapex = Math.round(reusableVolumeDaily * currentProfile.capexPerM3 * 0.4); // subsidized modular setup
  const paybackMonths = Number(((estimatedEquipmentCapex / (totalAnnualBenefit || 1)) * 12).toFixed(1));

  // Environmental impact
  const olympicPools = Math.round(annualReusableVolume / 2500);
  const householdsDaily = Math.round((reusableVolumeDaily * 1000) / 120);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: '740px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.12)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Calculator size={20} color="#0284c7" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Factory Water Savings & ROI Calculator
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Calculate annual operating savings and capital payback schedule
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Input Parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {/* Industry Type */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Facility Industry Sector:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className={`tab-pill ${industryType === 'textile' ? 'active' : ''}`}
                onClick={() => setIndustryType('textile')}
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
              >
                Textile Processing
              </button>
              <button
                type="button"
                className={`tab-pill ${industryType === 'food' ? 'active' : ''}`}
                onClick={() => setIndustryType('food')}
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
              >
                Food & Beverage
              </button>
              <button
                type="button"
                className={`tab-pill ${industryType === 'concrete' ? 'active' : ''}`}
                onClick={() => setIndustryType('concrete')}
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
              >
                Ready-Mix Concrete
              </button>
              <button
                type="button"
                className={`tab-pill ${industryType === 'chemical' ? 'active' : ''}`}
                onClick={() => setIndustryType('chemical')}
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
              >
                Chemical / Pharma
              </button>
            </div>
          </div>

          {/* Daily Water Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-muted)' }}>Daily Water Usage:</span>
              <span className="mono" style={{ color: '#0284c7', fontWeight: 700 }}>{dailyVolume} m³/day</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={dailyVolume}
              onChange={(e) => setDailyVolume(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>Small plant (50 m³)</span>
              <span>Large plant (2,000 m³)</span>
            </div>
          </div>
        </div>

        {/* Tariffs and Local Benchmark */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Municipal Water Tariff (৳/m³)</div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              ৳ {currentTariff.toFixed(0)} / m³
            </div>
          </div>

          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AquaSwap Exchange Tariff (৳/m³)</div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              ৳ {aquaSwapCostPerM3.toFixed(0)} / m³ <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>(-58%)</span>
            </div>
          </div>
        </div>

        {/* ROI Results Banner */}
        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="status-pill status-emerald" style={{ fontWeight: 700 }}>Projected Financial ROI</span>
              <div className="mono" style={{ fontSize: '1.85rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
                ৳ {totalAnnualBenefit.toLocaleString()} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ year</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                Estimated annual net financial gain from water savings and regulatory fine avoidance
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Equipment Payback</div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                {paybackMonths} months
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Rapid positive cash flow</div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Water Bill Reduction</div>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                ৳ {annualWaterPurchaseSavings.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avoided Sewer Fines</div>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                ৳ {annualAvoidedFines.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '12px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Freshwater Conserved</div>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                {annualReusableVolume.toLocaleString()} m³
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={14} color="#0284c7" />
            <span>Preserves <strong>{annualReusableVolume.toLocaleString()} m³</strong> of deep groundwater annually</span>
            <span>•</span>
            <span>Equivalent to municipal consumption for <strong>{householdsDaily.toLocaleString()}</strong> residents</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Optimal reuse matching for effluent: <strong style={{ color: 'var(--text-main)' }}>{currentProfile.reusableFor}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                if (onOpenAddFacility) onOpenAddFacility();
              }}
            >
              <ArrowRight size={14} />
              <span>Register Facility Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
