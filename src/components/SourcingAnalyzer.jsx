import React, { useState, useMemo } from 'react';
import { Search, Beaker, Droplets, Truck, ArrowRight, Layers, Gauge, Link2, AlertTriangle } from 'lucide-react';
import { computeAllMatchScores } from '../engine/waterMatchScore';
import { CONTAMINANTS, EXTENDED_CONTAMINANTS, BASE_PARAMS } from '../data/industrialProfiles';

const PARAM_META = { ...CONTAMINANTS, ...EXTENDED_CONTAMINANTS };
const ALL_PARAMS = [...BASE_PARAMS, ...Object.keys(EXTENDED_CONTAMINANTS)];

export function endUseKeyForSector(sector) {
  const s = (sector || '').toLowerCase();
  if (s.includes('cooling')) return 'cooling';
  if (s.includes('textile')) return 'textile';
  if (s.includes('unreinforced') || s.includes('pavement') || s.includes('precast')) return 'concrete_unreinforced';
  return 'concrete_reinforced';
}

export default function SourcingAnalyzer({
  cluster,
  optimizationResults,
  onOpenBlenderForBuyer
}) {
  const buyers = cluster.buyers || [];
  const [selectedBuyerId, setSelectedBuyerId] = useState(buyers[0]?.id);

  const matches = useMemo(
    () => computeAllMatchScores(cluster.suppliers || [], buyers, cluster),
    [cluster]
  );

  const buyer = buyers.find((b) => b.id === selectedBuyerId) || buyers[0];
  const allocation = (optimizationResults.buyerAllocations || []).find((a) => a.buyer.id === selectedBuyerId);
  const activeStreams = allocation?.streams || [];

  const activeSupplierIds = new Set(activeStreams.map((s) => s.supplierId));
  const buyerMatches = matches
    .filter((m) => m.buyer.id === selectedBuyerId)
    .sort((a, b) => b.amsScore - a.amsScore);
  const backups = buyerMatches.filter((m) => !activeSupplierIds.has(m.supplier.id)).slice(0, 3);

  const totalVolume = activeStreams.reduce((acc, s) => acc + s.flowVolumeM3, 0);
  const coveragePct = buyer ? Math.round((totalVolume / buyer.demandD) * 100) : 0;
  const truckCapacityTotal = activeStreams.reduce((acc, s) => acc + s.tripsDaily * s.truckCapacityM3, 0);
  const basketEfficiency = truckCapacityTotal > 0 ? Math.round((totalVolume / truckCapacityTotal) * 100) : 0;
  const totalNetDaily = activeStreams.reduce((acc, s) => acc + (s.netDaily || 0), 0);
  const isMultiSource = activeStreams.length >= 2;

  const requiredParams = (buyer?.toleranceM) || {};

  if (!buyer) return null;

  return (
    <div className="ui-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header + Buyer Picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Sourcing Analyzer</h2>
            <span className="status-pill status-cyan">Buyer-First Workflow</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            How much it needs → who can best supply it → test the exact blend in the Lab.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Search size={14} color="var(--text-muted)" />
          {buyers.map((b) => (
            <button
              key={b.id}
              className={`tab-pill ${selectedBuyerId === b.id ? 'active' : ''}`}
              onClick={() => setSelectedBuyerId(b.id)}
              style={{ fontSize: '0.76rem', padding: '5px 12px' }}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1 — What water does it need? */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span className="status-pill status-emerald">Step 1 — Required Water Profile</span>
          <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{buyer.name}</strong>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>({buyer.sector})</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <div style={{ padding: '8px 14px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Daily demand</span>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
              {buyer.demandD} m³/day
            </div>
          </div>
          <div style={{ padding: '8px 14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Watershed stress</span>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>
              {Math.round((buyer.scarcityFactorS || cluster.watershedScarcityIndex || 0.7) * 100)}%
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ALL_PARAMS.filter((k) => requiredParams[k] !== undefined).map((key) => (
            <span
              key={key}
              className="status-pill status-cyan"
              style={{ fontSize: '0.72rem' }}
            >
              {PARAM_META[key]?.name || key}: ≤ {requiredParams[key].toLocaleString()} {PARAM_META[key]?.unit || 'mg/L'}
            </span>
          ))}
          {requiredParams.pH_min !== undefined && (
            <span className="status-pill status-cyan" style={{ fontSize: '0.72rem' }}>
              pH: {requiredParams.pH_min} – {requiredParams.pH_max}
            </span>
          )}
        </div>
      </div>

      {/* STEP 2 — Best sources & efficiency */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span className="status-pill status-emerald">Step 2 — Best Sources &amp; Transport Efficiency</span>
          {isMultiSource && (
            <span className="status-pill status-cyan" style={{ fontSize: '0.72rem' }}>
              🌐 Sources water from {activeStreams.length} factories simultaneously
            </span>
          )}
          {activeStreams.length > 0 && (
            <span className="status-pill status-amber" style={{ fontSize: '0.72rem' }}>
              Demand coverage {coveragePct}%
            </span>
          )}
        </div>

        {activeStreams.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeStreams.map((st) => (
              <div
                key={st.supplierId}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.4fr 1fr auto',
                  gap: '10px',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    {st.supplierName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {st.treatmentTech.shortName} • buy @{st.purchasePerM3} + truck @{st.transportCostPerM3} + treat @{st.treatmentCostPerM3} = ${st.deliveredCostPerM3}/m³
                  </div>
                </div>

                <div>
                  <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                    {st.flowVolumeM3} m³ • {st.distanceKm} km
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {st.tripsDaily}× {st.truckName} ({st.truckCapacityM3} m³)
                  </div>
                </div>

                <div>
                  <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: st.truckUtilizationPct >= 90 ? '#34d399' : st.truckUtilizationPct >= 70 ? '#fbbf24' : '#fb7185' }}>
                    {st.truckUtilizationPct}% full
                  </div>
                  <div style={{ fontSize: '0.72rem', color: st.transportEfficiencyLossPct > 0 ? '#fb7185' : '#34d399' }}>
                    {st.transportEfficiencyLossPct > 0 ? `−${st.transportEfficiencyLossPct}% efficiency` : 'Zero trip waste'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                    +${Math.round(st.netDaily).toLocaleString()}/day
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    margin ${st.marginPerM3}/m³
                  </div>
                </div>
              </div>
            ))}

            {/* Basket summary strip */}
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(16, 185, 129, 0.07)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gauge size={14} color="#34d399" />
                Combined basket: {totalVolume} m³/day • fleet load factor {basketEfficiency}%
                {basketEfficiency < 100 ? ` (−${100 - basketEfficiency}% trip waste across sources)` : ''}
              </span>
              <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                +${Math.round(totalNetDaily).toLocaleString()}/day total profit
              </span>
            </div>

            {activeStreams.length === 1 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={12} />
                Under dry/drought stress this buyer can be sourced from 2–3 factories at once — switch the climate
                season on the Exchange Network to see the multi-source routing.
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertTriangle size={16} color="#fbbf24" />
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              No ROI-positive source at the current tariff (${cluster.municipalWaterTariff?.toFixed(2)}/m³ city water). Drought
              tariffs unlock emergency routes — switch season on the Exchange Network.
            </span>
          </div>
        )}

        {/* Backup options ranked next */}
        {backups.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Link2 size={12} /> Backup candidates (ranked by compatibility, activate when water value rises):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {backups.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px dashed var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <span>
                    <strong style={{ color: '#94a3b8' }}>{m.supplier.name}</strong> — needs {m.recommendedTreatment.shortName}
                  </span>
                  <span>
                    AMS {m.amsScore} • {Math.round(m.distanceKm)} km
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STEP 3 — Blend simulation */}
      {activeStreams.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '540px', lineHeight: 1.5 }}>
            <Beaker size={16} color="var(--brand-cyan)" />
            <span>
              <strong style={{ color: '#fff' }}>Step 3 — Simulate the blend:</strong> load this exact multi-source basket into
              the Water Blender Lab, mix it with this factory's own recycled internal water and a fresh top-up, and tune the
              volumes until every quality check passes.
            </span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenBlenderForBuyer(buyer.id)}>
            <Layers size={15} />
            <span>Simulate This Blend in the Lab</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
