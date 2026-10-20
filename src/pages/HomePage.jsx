import React from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  ArrowRight,
  TrendingUp,
  Truck,
  Sparkles,
  Calculator,
  FlaskConical,
  Users2,
  FileCheck2,
  Award,
  Building2,
  CheckCircle2,
  KeyRound,
  Factory,
  Mountain,
  ShieldCheck,
  Waves
} from 'lucide-react';

const NUM_FMT = (n) => (typeof n === 'number' ? n.toLocaleString() : n);

export default function HomePage({
  cluster,
  metrics,
  onOpenSavingsCalculator,
  onOpenHowItWorks,
  onOpenAddModal,
  onOpenAuth
}) {
  const m = metrics || {};
  const statCells = [
    {
      value: `${NUM_FMT(m.totalFreshwaterDisplacedYear || 0)} m³`,
      label: 'Fresh water redirected / year',
      color: '#38bdf8'
    },
    {
      value: `$${NUM_FMT(m.netEconomicSurplusYear || 0)}`,
      label: 'Net grid surplus / year',
      color: '#34d399'
    },
    {
      value: `${m.roiPercent ?? 0}%`,
      label: 'Network ROI',
      color: '#a3e635'
    },
    {
      value: `${m.activeMatchCount ?? 0} plants`,
      label: 'Trading simultaneously',
      color: '#fbbf24'
    }
  ];

  return (
    <div>
      {/* 1. Hero — Xometry/Bindplane-style headline with hard numbers + Homerun stats band */}
      <section className="web-section" style={{ paddingTop: '72px', paddingBottom: '56px', textAlign: 'center' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <div className="section-tag">
            <Droplets size={14} />
            <span>The Zero-Pipeline Industrial Water Exchange</span>
          </div>

          <h1 className="section-title" style={{ fontSize: '3.4rem', marginTop: '18px', lineHeight: 1.12, letterSpacing: '-0.03em' }}>
            Turn your wastewater into an{' '}
            <span className="gradient-text">economic asset</span>.
          </h1>

          <p className="section-subtitle" style={{ margin: '24px auto 0 auto', fontSize: '1.12rem', color: '#94a3b8', maxWidth: '640px' }}>
            AquaSwap matches leftover industrial effluent with nearby factories that need cheap process
            water —{' '}
            <strong style={{ color: '#e2e8f0' }}>
              {NUM_FMT(m.totalFreshwaterDisplacedYear || 0)} m³ redirected per year
            </strong>{' '}
            across {m.activeMatchCount ?? 0} live trade routes, at a{' '}
            <strong style={{ color: '#34d399' }}>{m.roiPercent ?? 0}% network ROI</strong>.
          </p>

          {/* Dual CTA — Register Now is the primary action everywhere */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '34px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={onOpenAddModal}>
              <Building2 size={17} />
              <span>Register Now</span>
              <ArrowRight size={15} />
            </button>

            <Link to="/optimizer" className="btn btn-secondary btn-lg">
              <TrendingUp size={16} color="#38bdf8" />
              <span>See the Network Live</span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '22px', marginTop: '20px', flexWrap: 'wrap' }}>
            <span className="check-item">
              <CheckCircle2 size={14} color="#34d399" /> 0.2s compliance checks
            </span>
            <span className="check-item">
              <CheckCircle2 size={14} color="#34d399" /> No pipeline capex
            </span>
            <span className="check-item">
              <button onClick={onOpenAuth} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', padding: 0 }}>
                Sign Up / Log In →
              </button>
            </span>
          </div>

          {/* Live stats band */}
          <div
            className="ui-card stat-band"
            style={{
              marginTop: '48px',
              padding: '28px 32px',
              display: 'flex',
              background: 'rgba(11, 16, 28, 0.85)',
              border: '1px solid var(--border-glow)'
            }}
          >
            {statCells.map((s) => (
              <div key={s.label} className="stat-cell">
                <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Trust strip — Bindplane-style partner band */}
      <section style={{ borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', background: 'rgba(5, 8, 14, 0.7)' }}>
        <div className="web-section" style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '6px' }}>
            Factories already trading on the {cluster.name} demo grid
          </p>
          <div className="logo-strip">
            {['Apex Horizon', 'Square Pharma', 'Pran Agro', 'Seven Rings', 'Summit Power', 'Bengal Polytex', 'Crown Ready-Mix', 'Meghna Equipment'].map((n) => (
              <span key={n} className="logo-item">
                <Mountain size={12} style={{ opacity: 0.5 }} />
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Suite bento — Miro-style mixed feature grid */}
      <section style={{ borderTop: '1px solid var(--border-light)', background: 'rgba(10, 14, 25, 0.6)' }}>
        <div className="web-section">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 44px auto' }}>
            <h2 className="section-title">Explore the AquaSwap Suite</h2>
            <p className="section-subtitle" style={{ margin: '10px auto 0 auto' }}>
              Each tool solves one piece of the industrial water puzzle — from sourcing to contracts.
            </p>
          </div>

          <div className="bento-grid">
            {/* A — Exchange Network (wide) */}
            <Link to="/optimizer" className="ui-card bento-card bento-a" style={{ textDecoration: 'none' }}>
              <div className="bento-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                <TrendingUp size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                Exchange Network Optimizer →
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Mixed-integer optimization computes every ROI-positive trade route across the watershed —
                water sourcing, truck selection and treatment sizing in one solve.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="status-pill status-cyan">MILP Solver</span>
                <span className="status-pill status-cyan">${NUM_FMT(m.netEconomicSurplusYear || 0)}/yr surplus</span>
                <span className="status-pill status-cyan">{m.trucksOnRoadDaily ?? 0} trucks/day</span>
              </div>
            </Link>

            {/* B — Sourcing Analyzer / Matchmaker */}
            <Link to="/fleet" className="ui-card bento-card bento-b" style={{ textDecoration: 'none' }}>
              <div className="bento-icon" style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>
                <Users2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                Matchmaker &amp; Sourcing Analyzer →
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Buyer-first workflow: see exactly what water quality you need, get ranked suppliers with
                transport efficiency, and bundle 2–3 factories per basket.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="status-pill status-emerald">Multi-source routing</span>
                <span className="status-pill status-emerald">AMS ranking</span>
              </div>
            </Link>

            {/* C — Blender Lab */}
            <Link to="/blender" className="ui-card bento-card bento-c" style={{ textDecoration: 'none' }}>
              <div className="bento-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <FlaskConical size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                Water Blender Lab →
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Mix real network streams like a recipe and check them against 4 industrial end-uses —
                reinforced concrete, cooling towers, textiles and more — with 10 live chemistry parameters.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="status-pill status-amber">Mass-balance math</span>
                <span className="status-pill status-amber">ASTM end-use specs</span>
              </div>
            </Link>

            {/* D — Tanker Fleet (wide) */}
            <Link to="/fleet" className="ui-card bento-card bento-d" style={{ textDecoration: 'none' }}>
              <div className="bento-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Truck size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                Live Tanker Fleet &amp; GIS Map →
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Animated delivery trucks on real corridor routes, digital Bills of Lading with SCADA security
                tokens, and live fleet load-factor tracking across {m.trucksOnRoadDaily ?? 0} daily trips.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="status-pill status-cyan">{m.fleetUtilizationPct ?? 0}% fleet load factor</span>
                <span className="status-pill status-cyan">GIS corridor routing</span>
              </div>
            </Link>

            {/* E — Safety & Contracts */}
            <Link to="/compliance" className="ui-card bento-card bento-e" style={{ textDecoration: 'none' }}>
              <div className="bento-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                Safety Telemetry &amp; Contracts →
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Inline SCADA emergency shutoff valves and formal bilateral Water Purchase Agreements —
                every route is fail-safe by design.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="status-pill status-rose">0.2s fail-safe</span>
              </div>
            </Link>

            {/* F — ESG Audit */}
            <Link to="/compliance" className="ui-card bento-card bento-f" style={{ textDecoration: 'none' }}>
              <div className="bento-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Award size={22} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
                ESG Audit &amp; Stewardship →
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Generate water stewardship certificates with {NUM_FMT(m.avoidedCO2TonsYear || 0)} tonnes of CO₂e
                avoided per year — aligned with UN SDGs and CSRD reporting.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 'auto' }}>
                <span className="status-pill status-emerald">CSRD aligned</span>
                <span className="status-pill status-emerald">SDG 6 · 9 · 12</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Onboarding Journey (Register Now → Matchmaker) */}
      <section style={{ borderTop: '1px solid var(--border-light)', background: 'rgba(7, 10, 18, 0.95)' }}>
        <div className="web-section">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <div className="section-tag">
              <Sparkles size={14} />
              <span>Your Onboarding Journey</span>
            </div>
            <h2 className="section-title">How AquaSwap Works — From Sign-Up to First Match</h2>
            <p className="section-subtitle" style={{ margin: '10px auto 0 auto' }}>
              A decentralized, zero-pipeline circular water network. Follow six guided steps — it all starts with your account.
            </p>
          </div>

          {/* STEP 1 — Register Now (hero focus) */}
          <div
            className="ui-card"
            style={{
              padding: '40px 36px',
              maxWidth: '860px',
              margin: '0 auto',
              textAlign: 'center',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 0 44px rgba(14, 165, 233, 0.14)',
              background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.07) 0%, rgba(11, 16, 28, 0.95) 60%)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#04141f', boxShadow: '0 6px 20px rgba(14, 165, 233, 0.35)' }}>
                <Building2 size={26} strokeWidth={2.4} />
              </div>
              <span className="status-pill status-cyan">Step 1 — Start Here</span>
            </div>

            <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
              Register Now — Create Your Factory Account
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', maxWidth: '560px', margin: '0 auto 22px auto', lineHeight: 1.6 }}>
              One account connects your whole facility: sign up with basic details, or log in if your plant
              already exists on the grid. Takes about 15 minutes — no pipeline capex, no long-term contract.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '22px' }}>
              <button className="btn btn-primary btn-lg" onClick={onOpenAddModal}>
                <Building2 size={17} />
                <span>Register Now</span>
                <ArrowRight size={15} />
              </button>
              <button className="btn btn-secondary btn-lg" onClick={onOpenAuth}>
                <KeyRound size={16} color="#38bdf8" />
                <span>Sign Up / Log In</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {['Free demo cluster preview', 'Industry templates prefill everything', 'Bank-grade data handling'].map((t) => (
                <span key={t} className="check-item">
                  <CheckCircle2 size={13} color="#34d399" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* STEP 2–6 — Setup journey grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div className="ui-card bento-card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="bento-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                  <Factory size={20} />
                </div>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(14, 165, 233, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 800, fontSize: '0.9rem' }}>
                  2
                </div>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Account Setup Guidelines</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Enter your factory name, official business licence ID, GPS location inside the watershed cluster, and your
                municipal BES account. This locks your coordinates onto the logistics map and sets your baseline utility bill.
              </p>
            </div>

            <div className="ui-card bento-card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="bento-icon" style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>
                  <Building2 size={20} />
                </div>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(129, 140, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 800, fontSize: '0.9rem' }}>
                  3
                </div>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>What Kind of Factory Is It?</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                Pick your industry template — textile dyeing, food &amp; beverage, pharma synthesis, ready-mix concrete,
                cooling &amp; power — then choose your role: <strong style={{ color: '#818cf8' }}>Water Giver</strong> (leftover effluent),
                <strong style={{ color: '#38bdf8' }}> Water Taker</strong>, or <strong style={{ color: '#34d399' }}>Both</strong>.
              </p>
            </div>

            <div className="ui-card bento-card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="bento-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <Waves size={20} />
                </div>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontWeight: 800, fontSize: '0.9rem' }}>
                  4
                </div>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Declare Your Water Types</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                List every stream available in your own factory — rinse &amp; wash water, RO reject brine, cooling blowdown,
                condensate — with daily volume and its chemistry: TDS, COD, BOD, chlorides, hardness, silica, iron, color,
                oil &amp; pH. Templates prefill typical values; lab reports refine them.
              </p>
            </div>

            <div className="ui-card bento-card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="bento-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <FlaskConical size={20} />
                </div>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontWeight: 800, fontSize: '0.9rem' }}>
                  5
                </div>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Test &amp; Blend-Check Your Water</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                The Water Blender Lab grades your declared streams against end-use targets (reinforced concrete, cooling
                towers, textiles) and shows exactly which quality checks pass or fail — and how blending fixes them.
              </p>
              <Link to="/blender" style={{ fontSize: '0.8rem', color: '#fbbf24', textDecoration: 'none', fontWeight: 600 }}>
                Open Blender Lab →
              </Link>
            </div>

            <div className="ui-card bento-card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="bento-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <Users2 size={20} />
                </div>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 800, fontSize: '0.9rem' }}>
                  6
                </div>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Find Matches &amp; Start Trading</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                The Exchange Network computes your ROI-positive routes, the Matchmaker ranks partner factories, and tankers
                deliver under digital SCADA verification with a signed Water Purchase Agreement.
              </p>
              <Link to="/fleet" style={{ fontSize: '0.8rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                Find Your Matchmaker →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pre-Footer High-Converting CTA — Xometry "instant quote" energy */}
      <section style={{ borderTop: '1px solid var(--border-light)', background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.08) 0%, rgba(7, 10, 18, 0.98) 100%)' }}>
        <div className="web-section" style={{ textAlign: 'center', padding: '70px 24px' }}>
          <button onClick={onOpenSavingsCalculator} className="section-tag" style={{ border: 'none', cursor: 'pointer' }}>
            <Calculator size={14} />
            <span>30-Second Savings Audit</span>
          </button>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginTop: '14px', letterSpacing: '-0.03em' }}>
            Connect your plant in{' '}
            <span className="gradient-text">15 minutes</span>.
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '1.05rem', maxWidth: '620px', margin: '16px auto 32px auto' }}>
            Join the {cluster.name} circular water grid — cut utility bills without capex, dodge river
            discharge fines, and let the network find your first trade route automatically.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={onOpenAddModal}>
              <Building2 size={17} />
              <span>Register Now</span>
              <ArrowRight size={15} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={onOpenHowItWorks}>
              <Sparkles size={16} color="#38bdf8" />
              <span>Jargon-Buster Tour</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
