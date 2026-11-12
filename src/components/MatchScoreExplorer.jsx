import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  FileText,
  CheckCircle2,
  Truck,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { computeAllMatchScores } from '../engine/waterMatchScore';

export default function MatchScoreExplorer({ cluster, onSelectMatchForWPA }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState('all'); // 'all', 'viable', 'optimal'
  const [sectorFilter, setSectorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score'); // 'score', 'volume', 'distance'
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const suppliers = cluster.suppliers || [];
  const buyers = cluster.buyers || [];

  const allMatches = useMemo(() => {
    return computeAllMatchScores(suppliers, buyers, cluster);
  }, [suppliers, buyers, cluster]);

  const sectorCounts = useMemo(() => {
    const counts = { all: allMatches.length };
    ['textile', 'cement', 'beverage', 'pharmaceutical'].forEach((sec) => {
      counts[sec] = allMatches.filter(
        (m) =>
          m.supplier.sector.toLowerCase().includes(sec) ||
          m.buyer.sector.toLowerCase().includes(sec)
      ).length;
    });
    return counts;
  }, [allMatches]);

  const filteredMatches = useMemo(() => {
    return allMatches
      .filter((match) => {
        if (minScoreFilter === 'optimal' && match.amsScore < 75) return false;
        if (minScoreFilter === 'viable' && match.amsScore < 50) return false;
        if (minScoreFilter === 'all' && match.amsScore < 20) return false;

        if (sectorFilter !== 'all') {
          const sSec = match.supplier.sector.toLowerCase();
          const bSec = match.buyer.sector.toLowerCase();
          if (!sSec.includes(sectorFilter) && !bSec.includes(sectorFilter)) {
            return false;
          }
        }

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const sName = match.supplier.name.toLowerCase();
          const bName = match.buyer.name.toLowerCase();
          const sSec = match.supplier.sector.toLowerCase();
          const bSec = match.buyer.sector.toLowerCase();
          if (!sName.includes(q) && !bName.includes(q) && !sSec.includes(q) && !bSec.includes(q)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'volume') return b.potentialFlowM3Day - a.potentialFlowM3Day;
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        return b.amsScore - a.amsScore;
      });
  }, [allMatches, minScoreFilter, sectorFilter, searchTerm, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* 1. Header & Minimalist Toolbar (All in ONE Single Row) */}
      <div
        className="mobile-stack"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '16px'
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-head, #0f172a)', margin: 0 }}>
                  Factory Partner Matchmaker
                </h1>
                  <span className="status-pill status-cyan" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
                    {cluster.name || 'Bilateral Optimization'}
                  </span>
              </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '3px 0 0 0' }}>
                  Algorithmically ranked pairings scored by physical haul distance, treatment OPEX, and contamination tolerances.
                </p>
              </div>

              {/* Right Action Bar: Search, Min Score, Sort - Strictly in ONE Row */}
                <div
                  className="mobile-scroll-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                    flexWrap: 'nowrap'
                  }}
                >

                  {/* Search Box */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="Search company or sector..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        height: '34px',
                        width: '180px',
                        paddingLeft: '30px',
                        paddingRight: searchTerm ? '26px' : '10px',
                        fontSize: '0.75rem',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '6px',
                        background: '#ffffff',
                        color: 'var(--text-head, #0f172a)',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          border: 'none',
                          background: 'transparent',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Clear search"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Min Score Dropdown */}
                  <select
                    value={minScoreFilter}
                    onChange={(e) => setMinScoreFilter(e.target.value)}
                    style={{
                      height: '34px',
                      width: '145px',
                      padding: '0 8px',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-strong)',
                      background: '#ffffff',
                      color: 'var(--text-head, #0f172a)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      flexShrink: 0
                    }}
                    title="Filter by match score"
                  >
                    <option value="all">All Scores (20%+)</option>
                    <option value="viable">Viable (50%+)</option>
                    <option value="optimal">Optimal (75%+)</option>
                  </select>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      height: '34px',
                      width: '145px',
                      padding: '0 8px',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-strong)',
                      background: '#ffffff',
                      color: 'var(--text-head, #0f172a)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      flexShrink: 0
                    }}
                    title="Sort match results"
                  >
                    <option value="score">Sort: Match %</option>
                    <option value="volume">Sort: Volume</option>
                    <option value="distance">Sort: Distance</option>
                  </select>
                </div>
              </div>

              {/* 2. Industry Sector Filter Pills & Result Count */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    className={`tab-pill ${sectorFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setSectorFilter('all')}
                    style={{ height: '28px', padding: '0 10px', fontSize: '0.74rem', borderRadius: '6px', boxSizing: 'border-box' }}
                  >
                    All Industries ({sectorCounts.all || 0})
                  </button>
                  <button
                    className={`tab-pill ${sectorFilter === 'textile' ? 'active' : ''}`}
                    onClick={() => setSectorFilter('textile')}
                    style={{ height: '28px', padding: '0 10px', fontSize: '0.74rem', borderRadius: '6px', boxSizing: 'border-box' }}
                  >
                    Textile ({sectorCounts.textile || 0})
                  </button>
                  <button
                    className={`tab-pill ${sectorFilter === 'cement' ? 'active' : ''}`}
                    onClick={() => setSectorFilter('cement')}
                    style={{ height: '28px', padding: '0 10px', fontSize: '0.74rem', borderRadius: '6px', boxSizing: 'border-box' }}
                  >
                    Cement ({sectorCounts.cement || 0})
                  </button>
                  <button
                    className={`tab-pill ${sectorFilter === 'beverage' ? 'active' : ''}`}
                    onClick={() => setSectorFilter('beverage')}
                    style={{ height: '28px', padding: '0 10px', fontSize: '0.74rem', borderRadius: '6px', boxSizing: 'border-box' }}
                  >
                    Beverage ({sectorCounts.beverage || 0})
                  </button>
                  <button
                    className={`tab-pill ${sectorFilter === 'pharmaceutical' ? 'active' : ''}`}
                    onClick={() => setSectorFilter('pharmaceutical')}
                    style={{ height: '28px', padding: '0 10px', fontSize: '0.74rem', borderRadius: '6px', boxSizing: 'border-box' }}
                  >
                    Pharma ({sectorCounts.pharmaceutical || 0})
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="status-pill status-cyan" style={{ fontSize: '0.74rem' }}>
                    {filteredMatches.length} pairings found
                  </span>
                </div>
              </div>

              {/* 3. Streamlined Match List Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredMatches.length === 0 ? (
                  <div
                    className="ui-card"
                    style={{
                      padding: '36px 20px',
                      textAlign: 'center',
                      background: '#ffffff',
                      border: '1px dashed var(--border-strong)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      No factory partner matches found for your filter criteria.
                    </p>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSearchTerm('');
                        setMinScoreFilter('all');
                        setSectorFilter('all');
                      }}
                      style={{ marginTop: '12px', fontSize: '0.76rem' }}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredMatches.map((match) => {
                    const isExpanded = expandedMatchId === match.id;
                    const isHighMatch = match.amsScore >= 75;
                    const isMediumMatch = match.amsScore >= 50 && match.amsScore < 75;

                    return (
                      <div
                        key={match.id}
                        className="ui-card"
                        style={{
                          padding: '16px 20px',
                          background: '#ffffff',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        {/* Main Row: Symmetrically Aligned Grid */}
                        <div className="matchmaker-card-row">

                          {/* Left: Score Badge + Supplier -> Buyer Pairing Info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>

                            {/* Compact AMS Score Box */}
                            <div
                              style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '8px',
                                background: isHighMatch ? '#f0fdf4' : isMediumMatch ? '#f0f9ff' : '#fffbeb',
                                border: isHighMatch ? '1px solid #bbf7d0' : isMediumMatch ? '1px solid #bae6fd' : '1px solid #fde68a',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <span
                                className="mono"
                                style={{
                                  fontSize: '1rem',
                                  fontWeight: 800,
                                  color: isHighMatch ? '#16a34a' : isMediumMatch ? '#0284c7' : '#d97706',
                                  lineHeight: 1
                                }}
                              >
                                {match.amsScore}%
                              </span>
                              <span
                                style={{
                                  fontSize: '0.58rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  color: isHighMatch ? '#16a34a' : isMediumMatch ? '#0284c7' : '#d97706',
                                  marginTop: '2px'
                                }}
                              >
                                {isHighMatch ? 'Optimal' : isMediumMatch ? 'Viable' : 'Moderate'}
                              </span>
                            </div>

                            {/* Company Names & Tech Tag */}
                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '0.92rem', color: 'var(--text-head, #0f172a)' }}>
                                  {match.supplier.name}
                                </strong>
                                <ArrowRight size={13} color="#0284c7" style={{ flexShrink: 0 }} />
                                <strong style={{ fontSize: '0.92rem', color: 'var(--text-head, #0f172a)' }}>
                                  {match.buyer.name}
                                </strong>
                              </div>

                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {match.supplier.sector} &rarr; {match.buyer.sector}
                              </div>

                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <FlaskConical size={11} color="#0284c7" />
                                  <span>{match.recommendedTreatment.shortName}</span>
                                </span>
                                <span>&bull;</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#16a34a', fontWeight: 600 }}>
                                  <CheckCircle2 size={11} />
                                  <span>{match.qualityCompatibility}% Purity Fit</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Middle: Crisp, Standardized Metrics Strip */}
                          <div className="matchmaker-metrics-strip">
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Daily Volume</div>
                              <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-head, #0f172a)' }}>
                                {match.potentialFlowM3Day} m³/d
                              </div>
                            </div>

                            <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />

                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Haul Distance</div>
                              <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-head, #0f172a)' }}>
                                {match.distanceKm} km
                              </div>
                            </div>

                            <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />

                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Feasibility</div>
                              <div
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: match.economicFeasibility === 'Highly Viable' ? '#16a34a' : '#0284c7',
                                  background: match.economicFeasibility === 'Highly Viable' ? '#f0fdf4' : '#f0f9ff',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  display: 'inline-block',
                                  border: match.economicFeasibility === 'Highly Viable' ? '1px solid #bbf7d0' : '1px solid #bae6fd'
                                }}
                              >
                                {match.economicFeasibility}
                              </div>
                            </div>

                            <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />

                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>Sector Risk</div>
                              <div
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: match.riskLevel === 'Low' ? '#16a34a' : match.riskLevel === 'Moderate' ? '#0284c7' : '#dc2626'
                                }}
                              >
                                {match.riskLevel} Risk
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', flexShrink: 0 }}>
                            <Link
                              to={`/fleet?supplier=${encodeURIComponent(match.supplier.name)}&buyer=${encodeURIComponent(match.buyer.name)}`}
                              className="btn btn-secondary"
                              style={{
                                height: '32px',
                                fontSize: '0.74rem',
                                padding: '0 10px',
                                gap: '4px',
                                boxSizing: 'border-box'
                              }}
                              title="Inspect corridor path on fleet map"
                            >
                              <span>Live Map</span>
                              <ArrowRight size={12} />
                            </Link>

                            <button
                              className="btn btn-primary"
                              onClick={() => onSelectMatchForWPA(match)}
                              style={{
                                height: '32px',
                                fontSize: '0.74rem',
                                padding: '0 12px',
                                gap: '5px',
                                boxSizing: 'border-box'
                              }}
                              title="Verify compliance and view Water Purchase Agreement"
                            >
                              <FileText size={13} />
                              <span>WPA Contract</span>
                            </button>

                            <button
                              className="btn btn-secondary"
                              onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                              style={{
                                width: '32px',
                                height: '32px',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxSizing: 'border-box'
                              }}
                              title={isExpanded ? 'Collapse assessment details' : 'View corridor and treatment assessment'}
                            >
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Detail: Technical Assessment Breakdown */}
                        {isExpanded && (
                          <div
                            style={{
                              background: '#f8fafc',
                              borderRadius: '6px',
                              padding: '12px 14px',
                              border: '1px solid var(--border-light)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              marginTop: '4px'
                            }}
                          >
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                              <strong>Corridor Assessment:</strong> Physical haul of <strong>{match.distanceKm} km</strong> between facilities.
                              Effluent treated via {match.recommendedTreatment.fullName} satisfies <strong>{match.qualityCompatibility}% process purity</strong> for {match.buyer.name}'s equipment.
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '4px' }}>
                              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Treatment Technology</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                                  {match.recommendedTreatment.fullName}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                  OPEX: ৳ {match.recommendedTreatment.opexPerM3}/m³
                                </div>
                              </div>

                              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Annual Water Impact</div>
                                <div className="mono" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
                                  {match.potentialFreshwaterSavedYear.toLocaleString()} m³/yr
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                  Groundwater extraction displaced
                                </div>
                              </div>

                              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Compliance Guarantee</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: match.isCompliantWithTreatment ? '#16a34a' : '#d97706', marginTop: '2px' }}>
                                  {match.isCompliantWithTreatment ? 'Full Regulatory Compliance' : 'Pre-treatment Required'}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                  Sector Liability: {match.riskLevel}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>

          </div>
          );
}
