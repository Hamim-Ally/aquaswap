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

export default function HowItWorksModal({ isOpen, onClose }) {
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
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(13, 19, 34, 0.98)',
          border: '1px solid rgba(14, 165, 233, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
              }}
            >
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                How AquaSwap Works
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                A quick, plain-English guide to industrial water recycling
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

        {/* Tab switch between The Big Idea and Jargon Buster */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <button
            className={`tab-pill ${activeTab === 'concept' ? 'active' : ''}`}
            onClick={() => setActiveTab('concept')}
            style={{ fontSize: '0.85rem' }}
          >
            💡 The Big Idea (3 Steps)
          </button>
          <button
            className={`tab-pill ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
            style={{ fontSize: '0.85rem' }}
          >
            📖 Jargon Buster (Dictionary)
          </button>
        </div>

        {activeTab === 'concept' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Plain English Story */}
            <div
              style={{
                padding: '16px',
                background: 'rgba(14, 165, 233, 0.08)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: '#e2e8f0'
              }}
            >
              🌍 <strong>The Problem:</strong> Heavy industries (like textile dyeing or food packaging) throw away millions of liters of cleanable water every day, while neighboring factories (like cement or cooling towers) pump fresh drinking water out of the ground.
              <br /><br />
              💡 <strong>The AquaSwap Solution:</strong> We act as an intelligent "Uber + Matchmaker" for water! We test the chemistry, find who needs that water nearby, and arrange safe, cheap delivery.
            </div>

            {/* 3 Simple Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(14, 165, 233, 0.15)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  1
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                    1. Water "Givers" List Their Leftover Water
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                    Textile mills, food processing plants, and refineries register how much leftover water they produce and what's in it (salt, organics, temperature).
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  2
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                    2. AquaSwap Matches & Tests Safety
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                    Our smart algorithm checks if the water is close enough (to keep truck costs low) and whether a simple filter makes it 100% safe for a nearby buyer (e.g. concrete factories or cooling systems).
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  3
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                    3. Everybody Wins & Rivers Stay Clean
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                    The seller avoids fines for dumping water, the buyer gets cheap recycled water instead of expensive municipal water, and drinking aquifers are preserved!
                  </p>
                </div>
              </div>
            </div>

            {/* Quick 1-line summary */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Result: Up to 60% lower water bills + zero river pollution</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={onClose}>
                Got it, Let's Explore!
              </button>
            </div>
          </div>
        ) : (
          /* Plain English Glossary */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Here is what all the scientific words and acronyms mean in plain, simple English:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>TDS (Total Dissolved Solids)</strong>
                  <span className="status-pill status-cyan">Saltiness</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', marginTop: '4px' }}>
                  Think of this as the "saltiness" or mineral level in the water. High TDS water tastes salty and can rust steel beams if used in buildings.
                </p>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>COD / BOD</strong>
                  <span className="status-pill status-emerald">Organic Dirt</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', marginTop: '4px' }}>
                  Measures how much organic material (food scraps, soap, sugars, dyes) is in the water. Low COD means the water is clean and odor-free.
                </p>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>pH Balance</strong>
                  <span className="status-pill status-amber">Acidity</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', marginTop: '4px' }}>
                  Scale from 0 (very acidic like lemon juice) to 14 (alkaline like bleach). Safe water for factories is usually between 6.5 and 8.5 (neutral like tap water).
                </p>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#c084fc', fontSize: '0.9rem' }}>RO & MBR (Treatment Skids)</strong>
                  <span className="status-pill status-rose">Filters</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', marginTop: '4px' }}>
                  High-tech filters. MBR acts like a fine strainer for dirt and bacteria; RO (Reverse Osmosis) is so microscopic it can even remove salt from ocean water.
                </p>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Water Purchase Agreement (WPA)</strong>
                  <span className="status-pill status-cyan">Contract</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', marginTop: '4px' }}>
                  A formal legal contract between two factories agreeing on price per cubic meter ($/m³) and guaranteeing the water quality meets safety standards.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
