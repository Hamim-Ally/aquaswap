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
  if (!isOpen) return null;

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

  // AquaSwap pricing model: Reused water trades at ~$0.75/m3 (transport + treatment)
  const aquaSwapCostPerM3 = 0.75;
  const grossSavingsPerM3 = Math.max(0.2, currentTariff - aquaSwapCostPerM3);

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
          maxWidth: '740px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#0d1322',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          padding: '26px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Calculator size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Factory Water Savings & ROI Calculator
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Calculate annual cash savings and payback time in 30 seconds
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Your Factory Industry:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className={`tab-pill ${industryType === 'textile' ? 'active' : ''}`}
                onClick={() => setIndustryType('textile')}
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
              >
                👕 Textile Mill
              </button>
              <button
                type="button"
                className={`tab-pill ${industryType === 'food' ? 'active' : ''}`}
                onClick={() => setIndustryType('food')}
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
              >
                🥤 Food / Beverage
              </button>
              <button
                type="button"
                className={`tab-pill ${industryType === 'concrete' ? 'active' : ''}`}
                onClick={() => setIndustryType('concrete')}
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
              >
                🧱 Concrete Batching
              </button>
              <button
                type="button"
                className={`tab-pill ${industryType === 'chemical' ? 'active' : ''}`}
                onClick={() => setIndustryType('chemical')}
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
              >
                🧪 Chemical / Pharma
              </button>
            </div>
          </div>

          {/* Daily Water Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Daily Water Usage:</span>
              <span className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{dailyVolume} m³/day</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={dailyVolume}
              onChange={(e) => setDailyVolume(parseInt(e.target.value, 10))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>Small plant (50 m³)</span>
              <span>Large plant (2,000 m³)</span>
            </div>
          </div>
        </div>

        {/* Tariffs and Local Benchmark */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current City Water Tariff ($/m³)</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
              ${currentTariff.toFixed(2)} / m³
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AquaSwap Exchange Tariff ($/m³)</div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
              ${aquaSwapCostPerM3.toFixed(2)} / m³ <span style={{ fontSize: '0.75rem', color: '#34d399' }}>(-58%)</span>
            </div>
          </div>
        </div>

        {/* Big ROI Results Banner */}
        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(14, 165, 233, 0.12) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="status-pill status-emerald">Projected Financial ROI</span>
              <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                ${totalAnnualBenefit.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ year</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                Estimated total annual net financial gain from water savings & fine avoidance
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Equipment Payback Period</div>
              <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8' }}>
                {paybackMonths} months
              </div>
              <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Rapid positive cash flow</div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Water Bill Cut</div>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                ${annualWaterPurchaseSavings.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avoided Sewer Fines</div>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                ${annualAvoidedFines.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Freshwater Saved</div>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                {annualReusableVolume.toLocaleString()} m³
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏊 ≈ <strong>{olympicPools}</strong> Olympic swimming pools saved annually</span>
            <span>•</span>
            <span>💧 Supplies daily water for <strong>{householdsDaily.toLocaleString()}</strong> people</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Best partner fit for your effluent: <strong style={{ color: '#fff' }}>{currentProfile.reusableFor}</strong>
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
              <Sparkles size={14} />
              <span>Onboard My Factory Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
