import React from 'react';
import OptimizerView from '../components/OptimizerView';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';

export default function OptimizerPage({
  cluster,
  solverOptions,
  setSolverOptions,
  optimizationResults,
  onRunOptimization,
  isSimpleMode,
  onOpenHowItWorks,
  onOpenSavingsCalculator,
  onOpenESGCertificate,
  climateSeason,
  setClimateSeason
}) {
  return (
    <div className="web-section" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      {/* Breadcrumb / Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.85rem'
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to Overview</span>
        </Link>

        <span className="status-pill status-cyan">
          Page: /optimizer
        </span>
      </div>

      {/* Optimizer Main View */}
      <div
        className="ui-card"
        style={{
          padding: '32px',
          background: 'rgba(11, 16, 28, 0.95)',
          border: '1px solid var(--border-glow)'
        }}
      >
        <OptimizerView
          cluster={cluster}
          solverOptions={solverOptions}
          setSolverOptions={setSolverOptions}
          optimizationResults={optimizationResults}
          onRunOptimization={onRunOptimization}
          isSimpleMode={isSimpleMode}
          onOpenHowItWorks={onOpenHowItWorks}
          onOpenSavingsCalculator={onOpenSavingsCalculator}
          onOpenESGCertificate={onOpenESGCertificate}
          climateSeason={climateSeason}
          setClimateSeason={setClimateSeason}
        />
      </div>
    </div>
  );
}
