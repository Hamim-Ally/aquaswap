import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Info,
  Building2,
  ArrowRight
} from 'lucide-react';

export default function ComplianceRadar({ selectedMatch, cluster, isSimpleMode }) {
  const [onlineTds, setOnlineTds] = useState(2200);
  const [onlinePh, setOnlinePh] = useState(7.8);

  const sup = selectedMatch?.supplier || cluster.suppliers[0];
  const buy = selectedMatch?.buyer || cluster.buyers[0];
  const maxAllowedTds = buy.toleranceM.TDS || 50000;

  const isDiverted = onlineTds > maxAllowedTds || onlinePh < 6.0 || onlinePh > 9.0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
              {isSimpleMode ? 'Emergency Safety Valves & Contract' : 'Biosecurity & Water Purchase Agreement'}
            </h1>
            <span className="status-pill status-cyan">Automated SCADA Safety</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
            {isSimpleMode
              ? 'Test how automated sensors protect factories from bad water, and generate standard trade contracts.'
              : 'Real-time telemetry threshold triggers, fail-safe diversion architecture, and legal covenants.'}
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={15} />
          <span>Print / Export Contract</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        
        {/* Left: Emergency Shutoff Valve Simulator */}
        <div className="ui-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--brand-cyan)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
                Live Safety Valve Simulator
              </h2>
            </div>
            <span className={`status-pill ${isDiverted ? 'status-rose' : 'status-emerald'}`}>
              {isDiverted ? '🚨 Emergency Shutoff' : '🟢 Flowing Safely'}
            </span>
          </div>

          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(14, 165, 233, 0.06)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(14, 165, 233, 0.2)',
              fontSize: '0.82rem',
              color: '#cbd5e1',
              lineHeight: 1.5
            }}
          >
            🧪 <strong>Try the test:</strong> What happens if an upstream factory accidentally sends water that is too salty or acidic?
            Drag the sensor sliders below to watch the automatic shutoff valve snap closed in real time!
          </div>

          {/* Big Visual Valve Status Indicator */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: isDiverted ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${isDiverted ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            {isDiverted ? (
              <AlertTriangle size={28} color="#f43f5e" />
            ) : (
              <ShieldCheck size={28} color="#34d399" />
            )}
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: isDiverted ? '#fb7185' : '#34d399' }}>
                {isDiverted ? 'VALVE DIVERTED TO SAFE TANK' : 'WATER FLOWING NORMALLY'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '2px' }}>
                {isDiverted
                  ? 'Sensor exceeded safety limit. Water instantly redirected away from buyer to prevent equipment damage.'
                  : 'All sensor readings are within contract limits. Safe for buyer process equipment.'}
              </div>
            </div>
          </div>

          {/* Test Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Water Saltiness (TDS)</span>
                <span className="mono" style={{ color: onlineTds > maxAllowedTds ? '#f43f5e' : '#fff', fontWeight: 600 }}>
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
                <span>Safe tap water: &lt;500 mg/L</span>
                <span style={{ color: '#38bdf8' }}>Buyer Max Cap: {maxAllowedTds.toLocaleString()} mg/L</span>
              </div>
            </div>

            <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Water Acidity / pH Value</span>
                <span className="mono" style={{ color: onlinePh < 6 || onlinePh > 9 ? '#f43f5e' : '#fff', fontWeight: 600 }}>
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
                <span>Acidic (under 6.0)</span>
                <span>Neutral (7.0 - 8.0)</span>
                <span>Alkaline (over 9.0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Water Purchase Agreement Document */}
        <div
          className="ui-card"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: '#0d1322'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck2 size={18} color="var(--brand-cyan)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>
                Standard Water Trade Contract
              </h2>
            </div>
            <span className="status-pill status-cyan">WPA Agreement</span>
          </div>

          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: '#cbd5e1'
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#fff' }}>Agreement Parties:</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ color: '#38bdf8' }}>{sup.name} (Seller)</span>
                <ArrowRight size={14} color="var(--text-muted)" />
                <span style={{ color: '#34d399' }}>{buy.name} (Buyer)</span>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#fff' }}>Agreed Supply Volume:</strong>
              <div style={{ color: '#e2e8f0', marginTop: '2px' }}>
                Up to {Math.min(sup.capacityW, buy.demandD)} m³/day via certified tanker delivery.
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#fff' }}>Agreed Tariff:</strong>
              <div style={{ color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                $0.85 per m³ (Saves 53% compared to $1.80 city water)
              </div>
            </div>

            <div>
              <strong style={{ color: '#fff' }}>Biosecurity & Quality Guarantee:</strong>
              <p style={{ marginTop: '2px', color: 'var(--text-muted)' }}>
                Water is continuously monitored at holding tanks. Any water exceeding {maxAllowedTds} mg/L TDS will automatically divert to holding ponds with zero delivery charge to Buyer.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.78rem', color: '#34d399' }}>
              ✓ Legal terms comply with standard industrial commercial codes
            </span>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
