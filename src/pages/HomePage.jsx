import React from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  ArrowRight,
  TrendingUp,
  Truck,
  Leaf,
  ShieldCheck,
  FlaskConical,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function HomePage({
  metrics,
  cluster,
  onOpenMockAccounts,
  onOpenSignIn
}) {
  return (
    <div>
      {/* 1. Hero Section */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '56px 24px 48px 24px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.2, margin: 0 }}>
            Industrial Water Reuse & Fleet Logistics
          </h1>

          <p style={{ margin: '14px auto 0 auto', fontSize: '1.05rem', color: '#475569', maxWidth: '600px', lineHeight: 1.5 }}>
            B2B exchange pairing factory process water with manufacturing buyers to cut procurement costs and dispatch certified tanker deliveries.
          </p>

          {/* Clean Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
            <Link to="/optimizer" className="btn btn-primary btn-lg" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
              <span>View Exchange Network</span>
              <ArrowRight size={15} />
            </Link>

            <button
              className="btn btn-secondary btn-lg"
              onClick={onOpenMockAccounts || onOpenSignIn}
              style={{ borderColor: '#bae6fd', background: '#f0f9ff', color: '#0284c7', fontWeight: 600, padding: '10px 18px', fontSize: '0.88rem' }}
            >
              <Sparkles size={15} color="#0284c7" />
              <span>Explore Mock Companies</span>
            </button>
          </div>

          <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
            <MapPin size={13} color="#0284c7" />
            <span>Active Grid: <strong>{cluster.name}</strong></span>
          </div>
        </div>

        {/* Minimalist 4-Metric Grid */}
        <div style={{ maxWidth: '1000px', margin: '36px auto 0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}
          >
            <div className="ui-card" style={{ padding: '16px 20px', background: '#f8fafc', border: '1px solid var(--border-light)' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>Water Recycled</div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {metrics.totalReusedM3Day?.toLocaleString() || 0} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>m³/day</span>
              </div>
            </div>

            <div className="ui-card" style={{ padding: '16px 20px', background: '#f8fafc', border: '1px solid var(--border-light)' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>Annual Savings</div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                ৳ {Math.round(metrics.netEconomicSurplusYear || 0).toLocaleString()}
              </div>
            </div>

            <div className="ui-card" style={{ padding: '16px 20px', background: '#f8fafc', border: '1px solid var(--border-light)' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>Active Routes</div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {metrics.activeMatchCount || 0} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>corridors</span>
              </div>
            </div>

            <div className="ui-card" style={{ padding: '16px 20px', background: '#f8fafc', border: '1px solid var(--border-light)' }}>
              <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>Emissions Avoided</div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {metrics.avoidedCO2TonsYear || 0} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>t CO₂e/yr</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Core Modules */}
      <section style={{ padding: '44px 24px', background: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Platform Modules
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            
            {/* Module 1 */}
            <Link to="/optimizer" className="ui-card" style={{ padding: '18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Exchange Network
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: 1.45, margin: '4px 0 0 0' }}>
                  Bilateral matching pairing factory suppliers with local buyers based on quality and distance.
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '6px' }}>
                <span>Open Network</span>
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Module 2 */}
            <Link to="/blender" className="ui-card" style={{ padding: '18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlaskConical size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Water Blender Lab
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: 1.45, margin: '4px 0 0 0' }}>
                  Simulate mass-balance blending across multiple streams against ASTM C1602 limits.
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '6px' }}>
                <span>Open Blender</span>
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Module 3 */}
            <Link to="/fleet" className="ui-card" style={{ padding: '18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Live Fleet & Map
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: 1.45, margin: '4px 0 0 0' }}>
                  Real GIS map tracking tanker deliveries along real turn-by-turn highway networks.
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '6px' }}>
                <span>View Map</span>
                <ArrowRight size={12} />
              </div>
            </Link>

            {/* Module 4 */}
            <Link to="/compliance" className="ui-card" style={{ padding: '18px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Safety & Contracts
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: 1.45, margin: '4px 0 0 0' }}>
                  SCADA auto-shutoff telemetry and verified bilateral Water Purchase Agreements.
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto', paddingTop: '6px' }}>
                <span>View Safety</span>
                <ArrowRight size={12} />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* 3. 4-Step Architecture */}
      <section style={{ padding: '44px 24px', background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              How It Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            
            <div className="ui-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>
                01
              </span>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0' }}>
                Facility Onboarding
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                Enter effluent capacity and chemical specs (TDS, pH, COD).
              </p>
            </div>

            <div className="ui-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>
                02
              </span>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0' }}>
                Tolerance Audit
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                Verify water quality against ASTM C1602 or custom standards.
              </p>
            </div>

            <div className="ui-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>
                03
              </span>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0' }}>
                Fleet Dispatch
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                Route tankers and HDPE pipelines with turn-by-turn guidance.
              </p>
            </div>

            <div className="ui-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>
                04
              </span>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0' }}>
                Digital Settlement
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                Execute bilateral purchase agreements and log water savings.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
