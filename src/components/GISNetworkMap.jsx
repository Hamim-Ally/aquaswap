import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  Droplets,
  X,
  Info,
  Building2,
  ArrowRight,
  Play,
  Pause,
  QrCode,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function GISNetworkMap({ cluster, optimizationResults, isSimpleMode }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'suppliers', 'buyers'
  const [isFleetRunning, setIsFleetRunning] = useState(true);
  const [fleetProgress, setFleetProgress] = useState(0); // 0 to 1 along the path
  const [selectedBillOfLading, setSelectedBillOfLading] = useState(null);

  const suppliers = cluster.suppliers || [];
  const buyers = cluster.buyers || [];
  const { activeConnections } = optimizationResults;

  const mapWidth = 900;
  const mapHeight = 520;

  // Real-time animation loop for live tanker trucks
  useEffect(() => {
    if (!isFleetRunning) return;
    const interval = setInterval(() => {
      setFleetProgress((prev) => (prev >= 1 ? 0 : prev + 0.008));
    }, 50);
    return () => clearInterval(interval);
  }, [isFleetRunning]);

  // Helper to interpolate along a quadratic bezier curve: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
  const getBezierPoint = (x1, y1, mx, my, x2, y2, t) => {
    const invT = 1 - t;
    const x = invT * invT * x1 + 2 * invT * t * mx + t * t * x2;
    const y = invT * invT * y1 + 2 * invT * t * my + t * t * y2;
    return { x, y };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
              {isSimpleMode ? 'Live Tanker Fleet & Route Map' : 'Industrial Topology & Dispatch GIS Map'}
            </h1>
            <span className="status-pill status-cyan">{cluster.region}</span>
            <span className="status-pill status-emerald">
              {isFleetRunning ? '🟢 Live Fleet Active' : '⏸️ Fleet Paused'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
            {isSimpleMode
              ? 'Watch automated tanker trucks deliver water in real time, or click any truck to inspect its digital Bill of Lading.'
              : `Geospatial routing, multi-tanker dispatch telemetry, and digital chain-of-custody tracking.`}
          </p>
        </div>

        {/* Fleet Animation Controls & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsFleetRunning(!isFleetRunning)}
            style={{ fontSize: '0.78rem' }}
          >
            {isFleetRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isFleetRunning ? 'Pause Trucks' : 'Resume Trucks'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className={`tab-pill ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              All
            </button>
            <button
              className={`tab-pill ${filterType === 'suppliers' ? 'active' : ''}`}
              onClick={() => setFilterType('suppliers')}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              💧 Givers ({suppliers.length})
            </button>
            <button
              className={`tab-pill ${filterType === 'buyers' ? 'active' : ''}`}
              onClick={() => setFilterType('buyers')}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              🏭 Users ({buyers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Map Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 340px' : '1fr', gap: '20px', transition: 'all 0.3s ease' }}>
        
        {/* Vector Canvas */}
        <div
          className="ui-card"
          style={{
            position: 'relative',
            height: '560px',
            overflow: 'hidden',
            background: 'radial-gradient(circle at 50% 50%, #0d1527 0%, #080c14 100%)'
          }}
        >
          {/* Quick Guide Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              zIndex: 10,
              background: 'rgba(9, 13, 22, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Info size={14} color="var(--brand-cyan)" />
            <span>Click any truck 🚚 or factory pin for digital manifests</span>
          </div>

          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Basin Waterway */}
            <path
              d="M 50 60 Q 250 160 420 280 T 850 440"
              fill="none"
              stroke="rgba(14, 165, 233, 0.12)"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <text x="730" y="410" fill="rgba(14, 165, 233, 0.3)" fontSize="11" fontFamily="var(--font-mono)">
              Turag-Balu River Basin
            </text>

            {/* Flow Arcs & Real-Time Animated Tankers */}
            {activeConnections.map((conn, idx) => {
              const sup = suppliers.find((s) => s.id === conn.supplierId);
              const buy = buyers.find((b) => b.id === conn.buyerId);
              if (!sup || !buy) return null;

              const x1 = sup.coords.x;
              const y1 = sup.coords.y;
              const x2 = buy.coords.x;
              const y2 = buy.coords.y;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2 - 20;

              // Calculate animated truck position with staggered offset per connection
              const offsetT = (fleetProgress + idx * 0.28) % 1;
              const truckPos = getBezierPoint(x1, y1, mx, my, x2, y2, offsetT);

              return (
                <g key={`flow-${idx}`}>
                  {/* Glowing line */}
                  <path
                    d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    opacity="0.65"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedNode({ type: 'corridor', conn, sup, buy })}
                  />

                  {/* Corridor Midpoint Badge */}
                  <rect
                    x={mx - 24}
                    y={my - 12}
                    width="48"
                    height="18"
                    rx="9"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke="#0ea5e9"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedNode({ type: 'corridor', conn, sup, buy })}
                  />
                  <text
                    x={mx}
                    y={my + 1}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedNode({ type: 'corridor', conn, sup, buy })}
                  >
                    {conn.flowVolumeM3}m³
                  </text>

                  {/* LIVE ANIMATED TANKER TRUCK ICON */}
                  <g
                    transform={`translate(${truckPos.x}, ${truckPos.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedBillOfLading({
                        truckId: `TNK-0${idx + 1}`,
                        sup,
                        buy,
                        conn,
                        progress: Math.round(offsetT * 100),
                        etaMin: Math.max(2, Math.round((1 - offsetT) * (conn.distanceKm * 2.2)))
                      });
                    }}
                  >
                    {/* Pulsing beacon glow */}
                    <circle r="12" fill="rgba(16, 185, 129, 0.3)" />
                    <rect x="-10" y="-8" width="20" height="16" rx="4" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                    <text x="0" y="4" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold">
                      🚚
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Suppliers (Blue Givers) */}
            {(filterType === 'all' || filterType === 'suppliers') &&
              suppliers.map((s) => (
                <g
                  key={s.id}
                  transform={`translate(${s.coords.x}, ${s.coords.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode({ type: 'supplier', data: s })}
                >
                  <circle r="16" fill="rgba(14, 165, 233, 0.2)" />
                  <circle r="9" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
                  <text
                    y="24"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="11"
                    fontWeight="600"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {s.name.split(' ')[0]}
                  </text>
                </g>
              ))}

            {/* Buyers (Green Users) */}
            {(filterType === 'all' || filterType === 'buyers') &&
              buyers.map((b) => (
                <g
                  key={b.id}
                  transform={`translate(${b.coords.x}, ${b.coords.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode({ type: 'buyer', data: b })}
                >
                  <circle r="16" fill="rgba(16, 185, 129, 0.2)" />
                  <circle r="9" fill="#10b981" stroke="#fff" strokeWidth="2" />
                  <text
                    y="24"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="11"
                    fontWeight="600"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {b.name.split(' ')[0]}
                  </text>
                </g>
              ))}
          </svg>
        </div>

        {/* Right Drawer: Selected Node Details */}
        {selectedNode && (
          <div
            className="ui-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: '#0d1322'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span className="status-pill status-cyan">
                  {selectedNode.type === 'corridor'
                    ? 'Active Water Corridor'
                    : selectedNode.type === 'supplier'
                    ? 'Water Giver (Supplier)'
                    : 'Water User (Buyer)'}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
                  {selectedNode.type === 'corridor'
                    ? `${selectedNode.sup.name.split(' ')[0]} → ${selectedNode.buy.name.split(' ')[0]}`
                    : selectedNode.data.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px', borderRadius: '50%' }}
              >
                <X size={15} />
              </button>
            </div>

            {selectedNode.type === 'corridor' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  This corridor connects <strong>{selectedNode.sup.name}</strong> to <strong>{selectedNode.buy.name}</strong>.
                </p>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Volume Traded</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                    {selectedNode.conn.flowVolumeM3} m³/day
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distance & Delivery</div>
                  <div className="mono" style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                    {selectedNode.conn.distanceKm} km • {selectedNode.conn.tankerTrucksDaily} trucks/day
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Daily Cost Savings</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                    ${Math.round(selectedNode.conn.totalCostDaily * 2.8).toLocaleString()}/day
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sector: <strong style={{ color: '#fff' }}>{selectedNode.data.sector}</strong>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {selectedNode.data.description}
                </p>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedNode.type === 'supplier' ? 'Leftover Water Produced' : 'Daily Water Demand'}
                  </div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    {selectedNode.type === 'supplier' ? selectedNode.data.capacityW : selectedNode.data.demandD} m³/day
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saltiness (TDS)</div>
                  <div className="mono" style={{ fontSize: '1rem', fontWeight: 600, color: '#38bdf8', marginTop: '2px' }}>
                    {selectedNode.type === 'supplier' ? selectedNode.data.effluent.TDS : selectedNode.data.toleranceM.TDS} mg/L
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DIGITAL BILL OF LADING (BOL) MODAL */}
      {selectedBillOfLading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 8, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedBillOfLading(null)}
        >
          <div
            className="ui-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              background: '#0d1322',
              border: '1px solid rgba(14, 165, 233, 0.4)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--brand-cyan)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                  Digital Bill of Lading (Custody Manifest)
                </h3>
              </div>
              <button
                onClick={() => setSelectedBillOfLading(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px', borderRadius: '50%' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tanker ID:</span>
                <span className="mono" style={{ color: '#fff', fontWeight: 700 }}>{selectedBillOfLading.truckId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>🚚 In Transit ({selectedBillOfLading.progress}% journey complete)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Arrival:</span>
                <span className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{selectedBillOfLading.etaMin} minutes</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Origin (Supplier):</span>
                <strong style={{ color: '#fff' }}>{selectedBillOfLading.sup.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Destination (Buyer):</span>
                <strong style={{ color: '#38bdf8' }}>{selectedBillOfLading.buy.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payload Volume:</span>
                <strong style={{ color: '#fff' }}>25.0 m³ (Vacuum Stainless Steel)</strong>
              </div>
            </div>

            {/* Quality Pre-Check Pass Seal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <ShieldCheck size={20} color="#34d399" />
              <div style={{ fontSize: '0.78rem', color: '#e2e8f0' }}>
                <strong style={{ color: '#34d399' }}>SCADA Pre-Trip Test: PASSED</strong>
                <br />TDS: {selectedBillOfLading.conn.treatedEffluent?.TDS || 1800} mg/L • pH: 7.4 • Zero prohibited toxins detected.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <QrCode size={18} color="var(--brand-cyan)" />
                <span>QR Verification Token #9942</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedBillOfLading(null)}>
                Confirm & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
