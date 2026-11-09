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

export default function MatchScoreExplorer({ cluster, onSelectMatchForWPA }) {
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Factory Partner Matchmaker
            </h2>
            <span className="status-pill status-cyan">Bilateral Optimization Engine</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px', margin: '4px 0 0 0' }}>
            Bilateral compatibility scored against geographic haul distance, treatment OPEX, and contamination tolerances.
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
              style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
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
              style={{ width: '80px', accentColor: '#0284c7' }}
            />
            <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>
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

          return (
            <div
              key={match.id}
              className="ui-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderLeft: isHighMatch ? '4px solid #059669' : '4px solid #0284c7',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {/* Partner Names & Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', flexWrap: 'wrap' }}>
                    <span>{match.supplier.name}</span>
                    <ArrowRight size={14} color="var(--text-muted)" />
                    <span style={{ color: '#0284c7' }}>{match.buyer.name}</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {match.supplier.sector} → {match.buyer.sector}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: isHighMatch ? '#059669' : '#0284c7' }}>
                    {match.amsScore}%
                  </div>
                  <span className={`status-pill ${isHighMatch ? 'status-emerald' : 'status-cyan'}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                    {isHighMatch ? 'Optimal Match' : 'Feasible'}
                  </span>
                </div>
              </div>

              {/* Compatibility Assessment */}
              <div
                style={{
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  color: 'var(--text-main)'
                }}
              >
                <strong>Corridor Assessment:</strong> Located <strong>{match.distanceKm} km</strong> apart.
                Using {match.recommendedTreatment.shortName}, water satisfies <strong>{match.qualityCompatibility}% process purity fit</strong> for {match.buyer.name}'s equipment.
              </div>

              {/* Stats Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Daily Volume</div>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {match.potentialFlowM3Day} m³
                  </div>
                </div>

                <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Corridor Haul</div>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {match.distanceKm} km
                  </div>
                </div>

                <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Feasibility</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isHighMatch ? '#059669' : '#0284c7', marginTop: '2px' }}>
                    {match.economicFeasibility}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onSelectMatchForWPA(match)}
                >
                  <FileText size={14} />
                  <span>Verify Compliance & View WPA</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
