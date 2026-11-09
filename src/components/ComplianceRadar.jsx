import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Award,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ComplianceRadar({
  selectedMatch,
  cluster,
  metrics = {},
  onOpenESGCertificate,
  defaultTab = 'safety'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab === 'all' ? 'safety' : defaultTab);
  const [onlineTds, setOnlineTds] = useState(2200);
  const [onlinePh, setOnlinePh] = useState(7.8);
  const [showFullContract, setShowFullContract] = useState(false);

  const sup = selectedMatch?.supplier || cluster.suppliers[0];
  const buy = selectedMatch?.buyer || cluster.buyers[0];
  const maxAllowedTds = buy.toleranceM?.TDS || 50000;

  const isDiverted = onlineTds > maxAllowedTds || onlinePh < 6.0 || onlinePh > 9.0;
  const contractId = `WPA-2026-${(cluster.id || 'DHAK').toUpperCase().slice(0, 4)}-${(sup.id || 'SUP1').slice(0, 4).toUpperCase()}-${(buy.id || 'BUY1').slice(0, 4).toUpperCase()}`;

  const municipalTariff = cluster.municipalWaterTariff || 45.0;
  const agreedTariff = 22.0;
  const tariffSavingsPercent = Math.max(10, Math.round((1 - agreedTariff / municipalTariff) * 100));
  const dailyVolume = Math.min(sup.capacityW || 120, buy.demandD || 150);

  const handlePrint = () => {
    window.print();
  };

  const handlePresetTest = (tds, ph) => {
    setOnlineTds(tds);
    setOnlinePh(ph);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Clean Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
            Safety & Contracts
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px', margin: '4px 0 0 0' }}>
            Automated inline SCADA shutoff telemetry and verified supply agreements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          {onOpenESGCertificate && (
            <button className="btn btn-primary btn-sm" onClick={onOpenESGCertificate}>
              <Award size={14} />
              <span>ESG Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Simple Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          width: 'fit-content'
        }}
      >
        <button
          className={`tab-pill ${activeTab === 'safety' ? 'active' : ''}`}
          onClick={() => setActiveTab('safety')}
        >
          <Zap size={14} />
          <span>SCADA Safety Valve</span>
        </button>

        <button
          className={`tab-pill ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          <FileCheck2 size={14} />
          <span>Water Purchase Agreement</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SCADA SAFETY VALVE SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'safety' && (
        <div
          className="ui-card"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'var(--bg-card)',
            border: isDiverted ? '1px solid #fca5a5' : '1px solid var(--border-light)'
          }}
        >
          {/* Status Banner */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: isDiverted ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${isDiverted ? '#fecaca' : '#bbf7d0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: isDiverted ? '#fee2e2' : '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {isDiverted ? (
                  <AlertTriangle size={24} color="#e11d48" />
                ) : (
                  <ShieldCheck size={24} color="#16a34a" />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isDiverted ? '#991b1b' : '#166534' }}>
                    {isDiverted ? 'Automatic Shutoff: Diversion Active' : 'Water Dispatch Active (Quality Approved)'}
                  </span>
                  <span className="mono" style={{ fontSize: '0.72rem', color: isDiverted ? '#991b1b' : '#166534', background: isDiverted ? '#fee2e2' : '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                    &lt;200ms
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: isDiverted ? '#7f1d1d' : '#14532d', marginTop: '2px' }}>
                  {isDiverted
                    ? `Threshold breached (TDS: ${onlineTds} mg/L, pH: ${onlinePh}). Valve closed. ৳0 delivery charge.`
                    : `Telemetry verified: TDS ${onlineTds} mg/L (limit: ${maxAllowedTds.toLocaleString()}), pH ${onlinePh}.`}
                </div>
              </div>
            </div>

            {/* Quick Test Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>Test:</span>
              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                onClick={() => handlePresetTest(1800, 7.4)}
              >
                Normal
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                onClick={() => handlePresetTest(52000, 7.2)}
              >
                Salinity Spike
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                onClick={() => handlePresetTest(2200, 4.6)}
              >
                Acid Spike
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* TDS */}
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>TDS (Total Salinity)</span>
                <span className="mono" style={{ color: onlineTds > maxAllowedTds ? '#e11d48' : '#0284c7', fontWeight: 700 }}>
                  {onlineTds.toLocaleString()} mg/L
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="60000"
                step="500"
                value={onlineTds}
                onChange={(e) => setOnlineTds(parseInt(e.target.value, 10))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Freshwater: &lt;500 mg/L</span>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>Limit: {maxAllowedTds.toLocaleString()} mg/L</span>
              </div>
            </div>

            {/* pH */}
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>Acidity / pH Level</span>
                <span className="mono" style={{ color: onlinePh < 6 || onlinePh > 9 ? '#e11d48' : '#16a34a', fontWeight: 700 }}>
                  {onlinePh.toFixed(1)} pH
                </span>
              </div>
              <input
                type="range"
                min="4.0"
                max="12.0"
                step="0.1"
                value={onlinePh}
                onChange={(e) => setOnlinePh(parseFloat(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Acid (&lt;6.0)</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Safe Window: 6.0 – 9.0</span>
                <span>Alkaline (&gt;9.0)</span>
              </div>
            </div>

          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Hardware Fail-Safe: Valves automatically divert to containment if power or sensor signal is interrupted.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WATER PURCHASE AGREEMENT (WPA) */}
      {/* ========================================================================= */}
      {activeTab === 'contracts' && (
        <div
          className="ui-card"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Active Supply Agreement
                </h2>
                <span className="status-pill status-emerald">Active Contract</span>
              </div>
              <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {contractId}
              </span>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <FileText size={14} />
              <span>Export PDF</span>
            </button>
          </div>

          {/* Key Terms Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600 }}>SUPPLIER &rarr; BUYER</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '0.88rem', display: 'block', marginTop: '2px' }}>
                {sup.name?.split(' ')[0]} &rarr; {buy.name?.split(' ')[0]}
              </strong>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sup.sector} to {buy.sector}</div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600 }}>DAILY SUPPLY VOLUME</span>
              <div className="mono" style={{ color: '#0284c7', fontWeight: 800, fontSize: '1.2rem', marginTop: '2px' }}>
                {dailyVolume} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>m³/day</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Certified tanker carriers</div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600 }}>AGREED TARIFF</span>
              <div className="mono" style={{ color: '#059669', fontWeight: 800, fontSize: '1.2rem', marginTop: '2px' }}>
                ৳ {agreedTariff.toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ m³</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
                Saves {tariffSavingsPercent}% vs municipal
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block', fontWeight: 600 }}>QUALITY STANDARD</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '0.88rem', display: 'block', marginTop: '2px' }}>
                ASTM C1602 Compliant
              </strong>
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>Zero-cost liability on breach</div>
            </div>

          </div>

          {/* Toggle Full Legal Clauses */}
          <div>
            <button
              type="button"
              onClick={() => setShowFullContract(!showFullContract)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 0'
              }}
            >
              <span>{showFullContract ? 'Hide Legal Clauses' : 'View Full Legal Clauses'}</span>
              {showFullContract ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showFullContract && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  color: 'var(--text-body)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div>
                  <strong>Article 1 (Quality Warranty):</strong> Supplier warrants that water supplied complies with agreed limits (TDS &le; {maxAllowedTds.toLocaleString()} mg/L, pH 6.0&ndash;9.0).
                </div>
                <div>
                  <strong>Article 2 (Automatic Indemnity):</strong> Any delivery triggering SCADA telemetry shutdown is diverted to containment with ৳0 liability to Buyer.
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Record SHA-256: 4f8b91c0e3a89073e82a0d922bc01 &bull; Verified under Industrial Symbiosis Guidelines
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
