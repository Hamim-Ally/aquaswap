import React, { useState } from 'react';
import {
  X,
  Droplets,
  ArrowRight,
  TrendingUp,
  Building2,
  Truck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Scale
} from 'lucide-react';

export default function HowItWorksModal({ isOpen, onClose, onOpenAddModal }) {
  const [activeTab, setActiveTab] = useState('concept'); // 'concept' or 'glossary'

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
          maxHeight: '90vh',
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HelpCircle size={20} color="#0284c7" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                How AquaSwap Operates
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                End-to-end guide to industrial water recycling & marketplace matchmaking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%', width: '32px', height: '32px' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switch */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <button
            className={`tab-pill ${activeTab === 'concept' ? 'active' : ''}`}
            onClick={() => setActiveTab('concept')}
            style={{ fontSize: '0.82rem' }}
          >
            Onboarding & Matchmaker Workflow
          </button>
          <button
            className={`tab-pill ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
            style={{ fontSize: '0.82rem' }}
          >
            Technical Parameters & Glossary
          </button>
        </div>

        {activeTab === 'concept' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Plain English Story & Register Now CTA */}
            <div
              style={{
                padding: '16px 18px',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ maxWidth: '440px', fontSize: '0.84rem', lineHeight: 1.55, color: '#0369a1' }}>
                <strong>The Industrial Solution:</strong> Instead of plants discharging cleanable process water into waterways and depleting drinking aquifers, AquaSwap tests effluent chemistry, pairs neighboring facilities, and schedules compliant logistics transfers.
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  if (onOpenAddModal) onOpenAddModal('supplier');
                }}
              >
                <Building2 size={15} />
                <span>Register Facility Now</span>
              </button>
            </div>

            {/* 6 Comprehensive Onboarding Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.85rem' }}>
                  1
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    1. Enterprise Sign Up & Account Setup Guidelines
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    Create your enterprise corporate profile using official plant credentials. Select your regional industrial cluster (Dhaka-Gazipur, Chattogram-Karnaphuli, or Narayanganj-Shitalakshya) to define a 15–25 km logistics radius, and assign engineering authority contacts.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.85rem' }}>
                  2
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    2. Facility & Business Classification
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    Select your operational role: <strong>Water Giver / Supplier</strong> (Textile Dyeing, Beverage, Pharma, Refineries) or <strong>Water Buyer</strong> (Ready-Mix Concrete ASTM C1602, Cooling Towers, Precast Pavers). Configure shift hours and buffer tank size.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.85rem' }}>
                  3
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    3. Water Inventory & Chemical Fingerprint
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    Log available water types: rinse effluent, CIP packaging wash, cooling blowdown, or RO brine. Enter daily volume (m³/day) and water specs: TDS (salinity), COD/BOD (organics), Chlorides, Sulfates, and pH, or click standard industry presets.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.85rem' }}>
                  4
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    4. Automated Safety & ASTM Standards Audit
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    The engine checks tolerances against rigorous standards (e.g. ASTM C1602 steel rebar corrosion limits) and determines the lowest-cost polishing tech needed (Direct Bypass, Sand Filter, MBR, or RO Skid) with zero environmental penalty risk.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.85rem' }}>
                  5
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    5. Algorithmic Matchmaker & Digital WPA Contracts
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    The optimization engine finds matching plants within economic haul distance and applies bilinear mass-balance blending. Generates digital tripartite Water Purchase Agreements (WPA) with locked-in tariffs and verifiable ESG credits.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.85rem' }}>
                  6
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    6. Logistics Dispatch & Up to 58% Bill Savings
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                    Dispatches certified industrial vacuum tankers with live GPS corridor tracking and digital manifests. Facilities immediately slash city water extraction bills by up to 58% while protecting critical drinking aquifers.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick 1-line summary & Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 18px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Result: Up to 58% lower water bills with full regulatory compliance</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onClose();
                    if (onOpenAddModal) onOpenAddModal('supplier');
                  }}
                >
                  <Building2 size={14} />
                  <span>Register Facility</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Technical Glossary */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Key industrial water parameters and terminology used across the AquaSwap platform:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>TDS (Total Dissolved Solids)</strong>
                  <span className="status-pill status-cyan">Salinity</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                  Quantifies mineral and salt concentration in the water. High TDS water can accelerate rebar corrosion if used untreated in structural reinforced concrete.
                </p>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>COD / BOD (Chemical & Biochemical Oxygen Demand)</strong>
                  <span className="status-pill status-emerald">Organics</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                  Measures the quantity of organic material (dyes, sugars, biodegradable components) in effluent. Low COD ensures odor-free, stable reuse.
                </p>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>pH Balance</strong>
                  <span className="status-pill status-amber">Acidity</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                  Standard index from 0 (acidic) to 14 (alkaline). Safe water for industrial reuse is typically maintained between 6.5 and 8.5.
                </p>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>RO & MBR (Treatment Skids)</strong>
                  <span className="status-pill status-cyan">Filtration</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                  Modular polishing units. Membrane Bioreactors (MBR) remove suspended solids and bacteria; Reverse Osmosis (RO) removes dissolved salts and ionic compounds.
                </p>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Water Purchase Agreement (WPA)</strong>
                  <span className="status-pill status-emerald">Contract</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                  A bilateral commercial agreement between factories establishing supply volumes, locked tariffs ($/m³), quality warranties, and indemnity terms.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
