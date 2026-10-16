import React from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  ArrowRight,
  TrendingUp,
  Truck,
  Leaf,
  Sparkles,
  Calculator,
  ShieldCheck,
  FlaskConical,
  MapPin,
  Users2,
  FileCheck2,
  Award,
  Zap,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function HomePage({
  metrics,
  cluster,
  onOpenSavingsCalculator,
  onOpenHowItWorks,
  onOpenAddModal
}) {
  const olympicPools = Math.max(1, Math.round((metrics.totalFreshwaterDisplacedYear || 0) / 2500));

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="web-section" style={{ paddingTop: '60px', paddingBottom: '70px', textAlign: 'center' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div className="section-tag">
            <Droplets size={14} />
            <span>Circular Industrial Water Symbiosis</span>
          </div>

          <h1 className="section-title" style={{ fontSize: '3.2rem', marginTop: '16px', lineHeight: 1.15 }}>
            Turn Industrial Wastewater into an{' '}
            <span style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Economic Asset
            </span>.
          </h1>

          <p className="section-subtitle" style={{ margin: '22px auto 0 auto', fontSize: '1.2rem', color: '#94a3b8' }}>
            AquaSwap connects factories producing leftover process water with nearby industrial buyers—like ready-mix concrete and cooling towers.
            Cut city water bills by up to <strong style={{ color: '#38bdf8' }}>58%</strong> while protecting deep drinking aquifers.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '36px', flexWrap: 'wrap' }}>
            <Link to="/optimizer" className="btn btn-primary btn-lg">
              <span>Launch Exchange Network</span>
              <ArrowRight size={16} />
            </Link>

            <button
              className="btn btn-secondary btn-lg"
              onClick={onOpenSavingsCalculator}
            >
              <Calculator size={16} color="#34d399" />
              <span>30-Sec ROI Calculator</span>
            </button>

            <button
              className="btn btn-secondary btn-lg"
              onClick={onOpenHowItWorks}
            >
              <Sparkles size={16} color="#38bdf8" />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* Live KPI Metric Counter Strip */}
        <div
          className="ui-card"
          style={{
            marginTop: '56px',
            padding: '28px 36px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            background: 'rgba(15, 23, 42, 0.65)'
          }}
        >
          <div style={{ textAlign: 'left', borderRight: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Droplets size={15} color="var(--brand-cyan)" />
              <span>Daily Recycled Volume</span>
            </div>
            <div className="mono" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
              {metrics.totalReusedM3Day?.toLocaleString() || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>m³/day</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '4px' }}>
              ≈ {olympicPools} Olympic pools/year
            </div>
          </div>

          <div style={{ textAlign: 'left', borderRight: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <TrendingUp size={15} color="#34d399" />
              <span>Annual Net Savings</span>
            </div>
            <div className="mono" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>
              ${Math.round(metrics.netEconomicSurplusYear || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Vs. municipal extraction tariffs
            </div>
          </div>

          <div style={{ textAlign: 'left', borderRight: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Truck size={15} color="var(--brand-cyan)" />
              <span>Active Delivery Corridors</span>
            </div>
            <div className="mono" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
              {metrics.activeMatchCount || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>routes</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Avg distance: {metrics.averageTruckDistanceKm || 0} km
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Leaf size={15} color="#34d399" />
              <span>Emissions Prevented</span>
            </div>
            <div className="mono" style={{ fontSize: '1.9rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>
              {metrics.avoidedCO2TonsYear || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>t CO₂e/yr</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              From avoided deep-borehole pumping
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Suite Exploration Grid (Links directly to separate pages) */}
      <section style={{ borderTop: '1px solid var(--border-light)', background: 'rgba(10, 14, 25, 0.6)' }}>
        <div className="web-section">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <div className="section-tag">
              <Sparkles size={14} />
              <span>Multi-Page Enterprise Platform</span>
            </div>
            <h2 className="section-title">Explore the AquaSwap Suite</h2>
            <p className="section-subtitle" style={{ margin: '10px auto 0 auto' }}>
              Each page is a dedicated tool engineered to solve a specific piece of the industrial water puzzle.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            
            {/* Page 1: Optimizer */}
            <Link to="/optimizer" className="ui-card" style={{ padding: '28px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid #0ea5e9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <TrendingUp size={22} />
                </div>
                <span className="status-pill status-cyan">MILP Optimizer</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Exchange Network Optimizer →
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                View bilateral water trades, tunable goal presets, seasonal drought crisis testing, and verified cost savings.
              </p>
            </Link>

            {/* Page 2: Water Blender */}
            <Link to="/blender" className="ui-card" style={{ padding: '28px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <FlaskConical size={22} />
                </div>
                <span className="status-pill status-emerald">ASTM C1602 Standards</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Water Blending Lab →
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Test multi-stream mass balance blending like a drink recipe. Simulates 28-day concrete strength & drying time.
              </p>
            </Link>

            {/* Page 3: Live Fleet Map */}
            <Link to="/fleet" className="ui-card" style={{ padding: '28px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                  <Truck size={22} />
                </div>
                <span className="status-pill status-amber">Live Logistics</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Live Tanker Fleet & GIS Map →
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Real-time animated delivery trucks, corridor routes, and digital Bills of Lading with SCADA security QR tokens.
              </p>
            </Link>

            {/* Page 4: Partner Matchmaker */}
            <Link to="/matchmaker" className="ui-card" style={{ padding: '28px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid #818cf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  <Users2 size={22} />
                </div>
                <span className="status-pill status-cyan">AI Matchmaking</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Partner Matchmaker Directory →
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Browse ranked B2B factory matches with 5-star compatibility scores, industry filters, and distance checks.
              </p>
            </Link>

            {/* Page 5: Compliance & Safety */}
            <Link to="/compliance" className="ui-card" style={{ padding: '28px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid #f43f5e' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185' }}>
                  <FileCheck2 size={22} />
                </div>
                <span className="status-pill status-rose">0.2s Fail-Safe</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Safety Telemetry & Contracts →
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Simulate inline SCADA emergency shutoff valves and inspect formal bilateral Water Purchase Agreement contracts.
              </p>
            </Link>

            {/* Page 6: ESG Stewardship */}
            <Link to="/esg" className="ui-card" style={{ padding: '28px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid #34d399' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <Award size={22} />
                </div>
                <span className="status-pill status-emerald">CSRD Aligned</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                ESG Audit & Stewardship →
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Generate official corporate water stewardship certificates aligned with UN SDGs and CSRD reporting.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. "How It Works" 3-Step Section */}
      <section style={{ borderTop: '1px solid var(--border-light)', background: 'rgba(7, 10, 18, 0.95)' }}>
        <div className="web-section">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <div className="section-tag">
              <Sparkles size={14} />
              <span>The 3-Step Flow</span>
            </div>
            <h2 className="section-title">How AquaSwap Works in 3 Steps</h2>
            <p className="section-subtitle" style={{ margin: '10px auto 0 auto' }}>
              A decentralized, zero-pipeline circular water network that operates on day one.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="ui-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                Water Givers List Leftover Effluent
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Textile mills, food processing plants, and refineries register their available leftover wash water and chemical profile (salinity, COD, pH).
              </p>
            </div>

            <div className="ui-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontWeight: 800, fontSize: '1.1rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                Algorithm Matches & Verifies Safety
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Our MILP optimization engine pairs suppliers with nearby buyers (e.g. concrete batching or cooling towers), ensuring 100% compliance with ASTM standards.
              </p>
            </div>

            <div className="ui-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                Tanker Delivery & Mutual Savings
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Standard vacuum tankers deliver the water under digital SCADA verification. Factories save up to 58% on bills, and local rivers stay clean.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pre-Footer High-Converting CTA */}
      <section style={{ borderTop: '1px solid var(--border-light)', background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.08) 0%, rgba(7, 10, 18, 0.98) 100%)' }}>
        <div className="web-section" style={{ textAlign: 'center', padding: '70px 24px' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff' }}>
            Ready to Connect to the Circular Water Grid?
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '1.05rem', maxWidth: '620px', margin: '14px auto 30px auto' }}>
            Join forward-thinking industrial facilities in {cluster.name}. Start recycling water, cutting utility costs, and eliminating river fines today.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={onOpenAddModal}>
              <Building2 size={16} />
              <span>Register a Facility Now</span>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={onOpenSavingsCalculator}>
              <Calculator size={16} color="#34d399" />
              <span>Audit Factory Savings (30s)</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
