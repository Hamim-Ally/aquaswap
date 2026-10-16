import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  FileText,
  Star,
  CheckCircle2,
  Sparkles,
  Truck,
  Filter
} from 'lucide-react';
import { computeAllMatchScores } from '../engine/waterMatchScore';

export default function MatchScoreExplorer({ cluster, onSelectMatchForWPA, isSimpleMode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(40);
  const [sectorFilter, setSectorFilter] = useState('all');

  const suppliers = cluster.suppliers || [];
  const buyers = cluster.buyers || [];

  const allMatches = computeAllMatchScores(suppliers, buyers, cluster);

  const filteredMatches = allMatches.filter((match) => {
    const textMatch =
      match.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.supplier.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.buyer.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const scoreMatch = match.amsScore >= minScore;
    const sectorMatch =
      sectorFilter === 'all' ||
      match.supplier.sector.toLowerCase().includes(sectorFilter.toLowerCase()) ||
      match.buyer.sector.toLowerCase().includes(sectorFilter.toLowerCase());

    return textMatch && scoreMatch && sectorMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
              {isSimpleMode ? 'Factory Partner Matchmaker' : 'Water Match Score (AMS) Directory'}
            </h1>
            <span className="status-pill status-cyan">AI B2B Matching</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
            {isSimpleMode
              ? 'Ranked pairings between factories with leftover water and factories looking to buy cheap water.'
              : 'Multi-criteria bilateral compatibility index scored against distance, treatment OPEX, and contamination risk.'}
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by factory name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min Match:</span>
            <input
              type="range"
              min="20"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              style={{ width: '80px' }}
            />
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0ea5e9' }}>
              {minScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Sector Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={13} /> Filter Industry:
        </span>
        {['all', 'textile', 'cement', 'beverage', 'pharmaceutical'].map((sec) => (
          <button
            key={sec}
            className={`tab-pill ${sectorFilter === sec ? 'active' : ''}`}
            onClick={() => setSectorFilter(sec)}
            style={{ padding: '4px 10px', fontSize: '0.75rem', textTransform: 'capitalize' }}
          >
            {sec === 'all' ? 'All Industries' : sec}
          </button>
        ))}
      </div>

      {/* Grid of Partner Match Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>
        {filteredMatches.map((match) => {
          const isHighMatch = match.amsScore >= 75;
          const stars = match.amsScore >= 80 ? '⭐⭐⭐⭐⭐' : match.amsScore >= 65 ? '⭐⭐⭐⭐' : '⭐⭐⭐';

          return (
            <div
              key={match.id}
              className="ui-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                borderLeft: isHighMatch ? '4px solid var(--accent-emerald)' : '4px solid var(--brand-cyan)'
              }}
            >
              {/* Partner Names & Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, color: '#fff', flexWrap: 'wrap' }}>
                    <span>{match.supplier.name}</span>
                    <ArrowRight size={14} color="var(--brand-cyan)" />
                    <span style={{ color: '#38bdf8' }}>{match.buyer.name}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {match.supplier.sector} → {match.buyer.sector}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: isHighMatch ? '#34d399' : '#38bdf8' }}>
                    {match.amsScore}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stars}</div>
                </div>
              </div>

              {/* Plain English Story */}
              <div
                style={{
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  lineHeight: 1.45,
                  color: '#cbd5e1'
                }}
              >
                🤝 <strong>Why they match:</strong> Located only <strong>{match.distanceKm} km</strong> apart.
                With a {match.recommendedTreatment.shortName}, the water reaches <strong>{match.qualityCompatibility}% purity fit</strong> for {match.buyer.name}'s equipment.
              </div>

              {/* Stats Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Daily Volume</div>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    {match.potentialFlowM3Day} m³
                  </div>
                </div>

                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Distance</div>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    {match.distanceKm} km
                  </div>
                </div>

                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Feasibility</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isHighMatch ? '#34d399' : '#38bdf8', marginTop: '2px' }}>
                    {match.economicFeasibility}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onSelectMatchForWPA(match)}
                >
                  <FileText size={14} />
                  <span>Test Safety Valves & View Agreement</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
