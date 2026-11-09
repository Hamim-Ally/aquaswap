import React, { useState, useMemo } from 'react';
import {
  X,
  Compass,
  Truck,
  DollarSign,
  Droplets,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Gauge,
  Sliders,
  Layers,
  MapPin,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export default function DistantCommuteAnalyzerModal({
  isOpen,
  onClose,
  initialRoute,
  cluster,
  activeConnections = []
}) {

  // Selected corridor route (default to initialRoute or first distant route)
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  
  // Available routes to choose from
  const routesList = useMemo(() => {
    if (activeConnections && activeConnections.length > 0) {
      return activeConnections;
    }
    return [
      {
        supplierName: 'Konabari Knit Composite Ltd',
        supplierSector: 'Textile Wet Processing & Dyeing',
        buyerName: 'Crown Ready-Mix Concrete Plant #4',
        buyerSector: 'Structural Concrete (ASTM C1602)',
        distanceKm: 12.5,
        flowVolumeM3: 80,
        corridorName: 'Dhaka-Mymensingh N3 Arterial Highway',
        treatmentTech: { name: 'Multi-Stage Membrane Bioreactor' }
      }
    ];
  }, [activeConnections]);

  const activeRoute = routesList[selectedRouteIdx] || routesList[0];

  // User Interactive Tuner State
  const [distanceKm, setDistanceKm] = useState(
    activeRoute.distanceKm ? Math.max(5, Math.round(activeRoute.distanceKm)) : 12
  );
  const [intakeVolumeM3, setIntakeVolumeM3] = useState(
    Math.min(100, Math.max(10, activeRoute.flowVolumeM3 || 50))
  );
  const [selectedVehicleMode, setSelectedVehicleMode] = useState('auto'); // 'auto', 'shuttle_8', 'bowser_14', 'tanker_28', 'convoy_60'
  const [waterPurchaseRate, setWaterPurchaseRate] = useState(20); // ৳/m3 water cost
  const [industrialIncomeRate, setIndustrialIncomeRate] = useState(68); // ৳/m3 revenue/benefit (replaces WASA tariff + utility)

  // Vehicle specifications & fleet models (calibrated for Bangladesh road transport)
  const vehicleOptions = [
    {
      id: 'shuttle_8',
      name: '8 m³ Agile Rapid Shuttle',
      shortName: '8 m³ Shuttle',
      typeCode: 'LIGHT-8',
      capacityM3: 8,
      fixedTripFee: 1500, // Driver dispatch + loading dock fee (৳)
      fuelRatePerM3Km: 12, // Diesel & wear per m3-km (৳)
      deadheadRatePerM3Km: 4.5, // Cost penalty for carrying empty tank air/steel (৳)
      recommendedRange: '5 - 20 m³',
      description: 'Agile light commercial chassis. No municipal curfew restrictions, rapid 8-min offload.'
    },
    {
      id: 'bowser_14',
      name: '14 m³ Compact Industrial Bowser',
      shortName: '14 m³ Bowser',
      typeCode: 'MEDIUM-14',
      capacityM3: 14,
      fixedTripFee: 2500,
      fuelRatePerM3Km: 10,
      deadheadRatePerM3Km: 4.0,
      recommendedRange: '20 - 55 m³',
      description: 'Rigid dual-axle tanker with tight turning radius for narrow industrial park alleyways.'
    },
    {
      id: 'tanker_28',
      name: '28 m³ Heavy Vacuum Tanker',
      shortName: '28 m³ Tanker',
      typeCode: 'HEAVY-28',
      capacityM3: 28,
      fixedTripFee: 4000,
      fuelRatePerM3Km: 8,
      deadheadRatePerM3Km: 3.5,
      recommendedRange: '55 - 160 m³',
      description: 'Tri-axle highway semi-trailer with pneumatic bottom-discharge for large bulk haulage.'
    },
    {
      id: 'convoy_60',
      name: '60 m³ Bulk Freight Road Train',
      shortName: '60 m³ Convoy',
      typeCode: 'BULK-60',
      capacityM3: 60,
      fixedTripFee: 7500,
      fuelRatePerM3Km: 6,
      deadheadRatePerM3Km: 3.0,
      recommendedRange: '150 m³+',
      description: 'B-Double tandem trailer combination for high-volume inter-cluster water logistics.'
    }
  ];

  // Auto-determine the most efficient vehicle for the current tuned volume
  const autoBestVehicle = useMemo(() => {
    let best = vehicleOptions[0];
    let bestTotalCost = Infinity;

    vehicleOptions.forEach((veh) => {
      const trips = Math.ceil(intakeVolumeM3 / veh.capacityM3);
      const totalDeployedCapacity = trips * veh.capacityM3;
      const unusedCapacity = Math.max(0, totalDeployedCapacity - intakeVolumeM3);

      const tripCost = trips * veh.fixedTripFee;
      const fuelCost = intakeVolumeM3 * distanceKm * veh.fuelRatePerM3Km;
      const deadheadPenalty = unusedCapacity * distanceKm * veh.deadheadRatePerM3Km;
      const totalTransportCost = tripCost + fuelCost + deadheadPenalty;

      if (totalTransportCost < bestTotalCost) {
        bestTotalCost = totalTransportCost;
        best = veh;
      }
    });

    return best;
  }, [intakeVolumeM3, distanceKm]);

  // Active chosen vehicle
  const activeVehicle = useMemo(() => {
    if (selectedVehicleMode === 'auto') {
      return autoBestVehicle;
    }
    return vehicleOptions.find((v) => v.id === selectedVehicleMode) || autoBestVehicle;
  }, [selectedVehicleMode, autoBestVehicle]);

  // Efficiency & Capacity Loss Calculations
  const calculations = useMemo(() => {
    const veh = activeVehicle;
    const trips = Math.ceil(intakeVolumeM3 / veh.capacityM3);
    const totalDeployedCapacity = trips * veh.capacityM3;
    const unusedCapacity = Math.max(0, totalDeployedCapacity - intakeVolumeM3);
    
    // Payload Utilization Factor %
    const utilizationPct = Math.round((intakeVolumeM3 / totalDeployedCapacity) * 100);
    const capacityLossPct = 100 - utilizationPct;

    // Costs & Deadhead Penalties
    const tripCost = trips * veh.fixedTripFee;
    const fuelCost = intakeVolumeM3 * distanceKm * veh.fuelRatePerM3Km;
    const deadheadPenalty = unusedCapacity * distanceKm * veh.deadheadRatePerM3Km;
    const totalTransportCostDaily = Math.round((tripCost + fuelCost + deadheadPenalty) * 100) / 100;
    const transportCostPerM3 = Math.round((totalTransportCostDaily / intakeVolumeM3) * 100) / 100;

    // Water Purchase Cost
    const totalWaterCostDaily = Math.round(intakeVolumeM3 * waterPurchaseRate * 100) / 100;

    // Income & Derived Value
    // Using this recycled water avoids expensive municipal supply, avoids groundwater extraction, and powers production
    const totalIncomeDaily = Math.round(intakeVolumeM3 * industrialIncomeRate * 100) / 100;

    // Net Profit & Justified ROI
    const totalExpenseDaily = totalWaterCostDaily + totalTransportCostDaily;
    const netDailyProfit = Math.round((totalIncomeDaily - totalExpenseDaily) * 100) / 100;
    const netAnnualSavings = Math.round(netDailyProfit * 365);
    const roiPercentage = totalExpenseDaily > 0 
      ? Math.round((netDailyProfit / totalExpenseDaily) * 100) 
      : 0;

    // Efficiency Rating Evaluation
    let efficiencyStatus = 'optimal';
    let efficiencyLabel = 'Optimal Payload Utilization';
    let efficiencyColor = '#34d399';

    if (utilizationPct < 50) {
      efficiencyStatus = 'severe_loss';
      efficiencyLabel = 'Heavy Capacity Loss (Oversized Vehicle)';
      efficiencyColor = '#f87171';
    } else if (utilizationPct < 75) {
      efficiencyStatus = 'moderate';
      efficiencyLabel = 'Moderate Efficiency (Partial Empty Haul)';
      efficiencyColor = '#fbbf24';
    }

    return {
      trips,
      totalDeployedCapacity,
      unusedCapacity,
      utilizationPct,
      capacityLossPct,
      totalTransportCostDaily,
      transportCostPerM3,
      deadheadPenalty: Math.round(deadheadPenalty * 100) / 100,
      totalWaterCostDaily,
      totalIncomeDaily,
      totalExpenseDaily,
      netDailyProfit,
      netAnnualSavings,
      roiPercentage,
      efficiencyStatus,
      efficiencyLabel,
      efficiencyColor
    };
  }, [intakeVolumeM3, distanceKm, activeVehicle, waterPurchaseRate, industrialIncomeRate]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.12)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ padding: '6px', background: '#e0f2fe', borderRadius: '8px', color: '#0284c7' }}>
                <Compass size={20} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Long-Distance Perfect Match & Commute ROI Analyzer
              </h2>
              <span className="status-pill status-cyan" style={{ fontSize: '0.72rem' }}>
                WNO Logistics Engine
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px', lineHeight: 1.5, margin: '6px 0 0 0' }}>
              Analyze transportation optionality for distant factory matches, calculate deadhead capacity loss for tuned water volumes, and verify justified financial ROI.
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 1. Distant Route Context Card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} color="#0284c7" /> 100% Water Quality Perfect Match
            </span>
            <span className="status-pill status-emerald" style={{ fontSize: '0.72rem' }}>
              Zero Additional Treatment Needed
            </span>
          </div>

          {/* Supplier to Buyer Route Display */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                Distant Supplier
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {activeRoute.supplierName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {activeRoute.supplierSector}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>
                {distanceKm} km
              </span>
              <ArrowRight size={18} color="#0284c7" style={{ margin: '2px 0' }} />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Corridor Haul</span>
            </div>

            <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                Receiving Buyer
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {activeRoute.buyerName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {activeRoute.buyerSector}
              </div>
            </div>
          </div>

          {/* Distance Tweak Slider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Commute Haul Distance: <strong style={{ color: 'var(--text-main)' }}>{distanceKm} km</strong>
            </span>
            <input
              type="range"
              min="3"
              max="35"
              step="1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              style={{ width: '160px' }}
            />
          </div>
        </div>

        {/* 2. Interactive Water Intake Tuner */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="#0284c7" />
              <div>
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  Tune Water Intake Volume ("পানি কতটুকু নিবি")
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Adjust volume to analyze payload efficiency and avoid hauling empty deadweight.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>
                {intakeVolumeM3}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>m³/day</span>
            </div>
          </div>

          {/* Volume Slider */}
          <input
            type="range"
            min="5"
            max="200"
            step="5"
            value={intakeVolumeM3}
            onChange={(e) => setIntakeVolumeM3(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
          />

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
            {[
              { label: '10 m³ (Batch)', val: 10 },
              { label: '25 m³ (Small)', val: 25 },
              { label: '50 m³ (Medium)', val: 50 },
              { label: '84 m³ (Optimal 3 Tankers)', val: 84 },
              { label: '140 m³ (High Demand)', val: 140 }
            ].map((p) => (
              <button
                key={p.val}
                className={`tab-pill ${intakeVolumeM3 === p.val ? 'active' : ''}`}
                onClick={() => setIntakeVolumeM3(p.val)}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Transportation Optionality & Vehicle Efficiency Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Transportation Optionality & Vehicle Comparison
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Select a vehicle to observe efficiency loss when matching capacity with {intakeVolumeM3} m³ demand.
              </p>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedVehicleMode('auto')}
              style={{
                fontSize: '0.74rem',
                borderColor: selectedVehicleMode === 'auto' ? '#0284c7' : 'var(--border-light)',
                color: selectedVehicleMode === 'auto' ? '#0284c7' : 'var(--text-main)'
              }}
            >
              <Truck size={14} />
              <span>Auto-Select Optimal ({autoBestVehicle.shortName})</span>
            </button>
          </div>

          {/* Vehicle Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
            {vehicleOptions.map((veh) => {
              const isSelected = activeVehicle.id === veh.id;
              const isAutoBest = autoBestVehicle.id === veh.id;
              const trips = Math.ceil(intakeVolumeM3 / veh.capacityM3);
              const totalCap = trips * veh.capacityM3;
              const utilPct = Math.round((intakeVolumeM3 / totalCap) * 100);

              let badgeColor = '#059669';
              if (utilPct < 50) badgeColor = '#dc2626';
              else if (utilPct < 75) badgeColor = '#d97706';

              return (
                <div
                  key={veh.id}
                  onClick={() => setSelectedVehicleMode(veh.id)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    border: isSelected ? '2px solid #0284c7' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  {isAutoBest && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '8px',
                        background: '#0284c7',
                        color: '#fff',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}
                    >
                      Optimal Match
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '6px', background: isSelected ? '#e0f2fe' : '#f1f5f9', borderRadius: '6px', color: '#0284c7' }}>
                      <Truck size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#0284c7' : 'var(--text-main)' }}>
                        {veh.shortName}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Capacity: {veh.capacityM3} m³
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Trips: <strong style={{ color: 'var(--text-main)' }}>{trips}</strong>
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: badgeColor }}>
                      {utilPct}% Utilized
                    </span>
                  </div>

                  {utilPct < 50 && (
                    <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 600 }}>
                      Notice: {100 - utilPct}% Capacity Loss
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Live Efficiency Loss & Capacity Penalty Warning */}
        {calculations.utilizationPct < 65 && (
          <div
            style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
              <strong style={{ color: '#dc2626' }}>
                Transportation Capacity Loss Alert ({calculations.capacityLossPct}% Unutilized):
              </strong>{' '}
              You are transporting <strong style={{ color: 'var(--text-main)' }}>{intakeVolumeM3} m³</strong> using a{' '}
              <strong style={{ color: 'var(--text-main)' }}>{activeVehicle.name}</strong> (Capacity: {activeVehicle.capacityM3} m³).
              Hauling an under-filled tanker creates an unutilized penalty of{' '}
              <strong style={{ color: '#dc2626' }}>৳ {Math.round(calculations.deadheadPenalty).toLocaleString()}/day</strong> in wasted logistics overhead.
              {activeVehicle.id !== autoBestVehicle.id && (
                <span>
                  {' '}Switching to the{' '}
                  <strong style={{ color: '#0284c7', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setSelectedVehicleMode(autoBestVehicle.id)}>
                    {autoBestVehicle.shortName}
                  </strong>{' '}
                  improves efficiency to {Math.round((intakeVolumeM3 / (Math.ceil(intakeVolumeM3 / autoBestVehicle.capacityM3) * autoBestVehicle.capacityM3)) * 100)}% and maximizes net daily margin.
                </span>
              )}
            </div>
          </div>
        )}

        {/* 5. Simple Financial Cost Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Financial Cost & Revenue Balance
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* 1. Water Cost */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600 }}>Water Purchase Cost</span>
                <span className="mono" style={{ fontSize: '0.72rem' }}>৳ {waterPurchaseRate}/m³</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                "কয় টাকার পানি আনতেছিস"
              </div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                ৳ {Math.round(calculations.totalWaterCostDaily).toLocaleString()}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/day</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Direct purchase & basic pre-treatment from {activeRoute.supplierName.split(' ')[0]}
              </div>
            </div>

            {/* 2. Transportation Cost */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600 }}>Transportation Cost</span>
                <span className="mono" style={{ fontSize: '0.72rem' }}>৳ {calculations.transportCostPerM3.toFixed(1)}/m³</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                "কয় টাকা ট্রান্সপোর্টেশনে লাগতেছে"
              </div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                ৳ {Math.round(calculations.totalTransportCostDaily).toLocaleString()}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/day</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {calculations.trips} trip(s) with {activeVehicle.shortName} across {distanceKm} km
              </div>
            </div>

            {/* 3. Income Derived */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#059669', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 600 }}>Value / Income Derived</span>
                <span className="mono" style={{ fontSize: '0.72rem' }}>৳ {industrialIncomeRate}/m³</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                "কয় টাকা ইনকাম করতে পারবি ঐ পানি দিয়ে"
              </div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                ৳ {Math.round(calculations.totalIncomeDaily).toLocaleString()}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/day</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Avoided Dhaka WASA industrial tariff (৳45/m³) + production utility value
              </div>
            </div>
          </div>
        </div>

        {/* 6. Results & ROI Justification Verdict */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-md)',
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-pill status-emerald" style={{ fontWeight: 700 }}>
                {calculations.roiPercentage >= 40 ? 'ROI Strongly Justified' : 'Feasible Return'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Net Commercial Feasibility
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '6px' }}>
              <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>
                +৳ {Math.round(calculations.netDailyProfit).toLocaleString()}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/day</span>
              </div>
              <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284c7' }}>
                (+৳ {calculations.netAnnualSavings.toLocaleString()}/yr)
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: '4px 0 0 0', maxWidth: '520px', lineHeight: 1.5 }}>
              Despite commuting <strong>{distanceKm} km</strong>, the process compatibility of this reclaimed water saves more in municipal tariffs and regulatory levies than the transport cost.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Investment Return
            </div>
            <div className="mono" style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>
              +{calculations.roiPercentage}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Net ROI on Logistics + Water
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Analysis
          </button>
          <button
            onClick={() => {
              alert(`Saved commute preference: ${intakeVolumeM3} m³/day via ${activeVehicle.name} across ${distanceKm} km corridor. Net surplus: +৳ ${Math.round(calculations.netDailyProfit).toLocaleString()}/day.`);
              onClose();
            }}
            className="btn btn-primary"
          >
            <CheckCircle2 size={16} />
            <span>Apply Commute Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
