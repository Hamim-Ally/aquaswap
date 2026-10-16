import React, { useState, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import OptimizerPage from './pages/OptimizerPage';
import BlenderPage from './pages/BlenderPage';
import FleetPage from './pages/FleetPage';
import MatchmakerPage from './pages/MatchmakerPage';
import CompliancePage from './pages/CompliancePage';
import ESGPage from './pages/ESGPage';

// Modals
import FacilityManagerModal from './components/FacilityManagerModal';
import HowItWorksModal from './components/HowItWorksModal';
import SavingsCalculatorModal from './components/SavingsCalculatorModal';
import ESGCertificateModal from './components/ESGCertificateModal';

import { INDUSTRIAL_CLUSTERS } from './data/industrialProfiles';
import { solveWaterNetworkOptimization } from './engine/optimizationSolver';

export default function App() {
  const [clusters, setClusters] = useState(INDUSTRIAL_CLUSTERS);
  const [selectedCluster, setSelectedCluster] = useState(INDUSTRIAL_CLUSTERS[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSavingsCalculatorOpen, setIsSavingsCalculatorOpen] = useState(false);
  const [isESGCertificateOpen, setIsESGCertificateOpen] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [selectedMatchForWPA, setSelectedMatchForWPA] = useState(null);

  // Climate Season State ('monsoon', 'dry', 'drought')
  const [climateSeason, setClimateSeason] = useState('monsoon');

  // Solver hyperparameters
  const [solverOptions, setSolverOptions] = useState({
    alpha: 1.0,
    beta: 0.4,
    gamma: 0.5,
    delta: 50.0,
    qMin: 25.0,
    allowBlending: true,
    maxTreatmentLevel: 3
  });

  // Dynamically calibrated cluster based on seasonal drought/climate condition
  const activeCluster = useMemo(() => {
    let tariffMultiplier = 1.0;
    let scarcity = 0.70;

    if (climateSeason === 'dry') {
      tariffMultiplier = 1.33;
      scarcity = 0.85;
    } else if (climateSeason === 'drought') {
      tariffMultiplier = 2.11;
      scarcity = 0.98;
    }

    return {
      ...selectedCluster,
      municipalWaterTariff: Number((selectedCluster.municipalWaterTariff * tariffMultiplier).toFixed(2)),
      watershedScarcityIndex: scarcity
    };
  }, [selectedCluster, climateSeason]);

  // Solve the superstructure allocation problem
  const optimizationResults = useMemo(() => {
    return solveWaterNetworkOptimization(activeCluster, solverOptions);
  }, [activeCluster, solverOptions]);

  // Handler for adding a new facility dynamically
  const handleAddFacility = useCallback(
    (type, facility) => {
      setClusters((prevClusters) => {
        return prevClusters.map((c) => {
          if (c.id === selectedCluster.id) {
            const updated = { ...c };
            if (type === 'supplier') {
              updated.suppliers = [...updated.suppliers, facility];
            } else {
              updated.buyers = [...updated.buyers, facility];
            }
            setSelectedCluster(updated);
            return updated;
          }
          return c;
        });
      });
    },
    [selectedCluster.id]
  );

  const handleRunOptimization = () => {
    setSolverOptions((prev) => ({ ...prev }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Global Multi-Page Navigation Header */}
      <Header
        clusters={clusters}
        selectedCluster={selectedCluster}
        setSelectedCluster={setSelectedCluster}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        isSimpleMode={isSimpleMode}
        setIsSimpleMode={setIsSimpleMode}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenSavingsCalculator={() => setIsSavingsCalculatorOpen(true)}
        onOpenESGCertificate={() => setIsESGCertificateOpen(true)}
      />

      {/* 2. Routes for Dedicated Multi-Page Website */}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Home Page */}
          <Route
            path="/"
            element={
              <HomePage
                metrics={optimizationResults.metrics}
                cluster={activeCluster}
                onOpenSavingsCalculator={() => setIsSavingsCalculatorOpen(true)}
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            }
          />

          {/* Optimizer & Exchange Network Page */}
          <Route
            path="/optimizer"
            element={
              <OptimizerPage
                cluster={activeCluster}
                solverOptions={solverOptions}
                setSolverOptions={setSolverOptions}
                optimizationResults={optimizationResults}
                onRunOptimization={handleRunOptimization}
                isSimpleMode={isSimpleMode}
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
                onOpenSavingsCalculator={() => setIsSavingsCalculatorOpen(true)}
                onOpenESGCertificate={() => setIsESGCertificateOpen(true)}
                climateSeason={climateSeason}
                setClimateSeason={setClimateSeason}
              />
            }
          />

          {/* Water Blender Lab Page */}
          <Route
            path="/blender"
            element={
              <BlenderPage
                isSimpleMode={isSimpleMode}
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
              />
            }
          />

          {/* Live Tanker Fleet & GIS Map Page */}
          <Route
            path="/fleet"
            element={
              <FleetPage
                cluster={activeCluster}
                optimizationResults={optimizationResults}
                isSimpleMode={isSimpleMode}
              />
            }
          />

          {/* Partner Matchmaker Directory Page */}
          <Route
            path="/matchmaker"
            element={
              <MatchmakerPage
                cluster={activeCluster}
                onSelectMatchForWPA={setSelectedMatchForWPA}
                isSimpleMode={isSimpleMode}
              />
            }
          />

          {/* Safety, SCADA & Contracts Page */}
          <Route
            path="/compliance"
            element={
              <CompliancePage
                selectedMatch={selectedMatchForWPA}
                cluster={activeCluster}
                isSimpleMode={isSimpleMode}
              />
            }
          />

          {/* ESG Audit & Stewardship Page */}
          <Route
            path="/esg"
            element={
              <ESGPage
                cluster={activeCluster}
                metrics={optimizationResults.metrics}
                onOpenESGCertificate={() => setIsESGCertificateOpen(true)}
              />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Global Multi-Page Footer */}
      <Footer
        onOpenSavingsCalculator={() => setIsSavingsCalculatorOpen(true)}
        onOpenESGCertificate={() => setIsESGCertificateOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* Modals Accessible Across Any Page */}
      <FacilityManagerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddFacility={handleAddFacility}
        isSimpleMode={isSimpleMode}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <SavingsCalculatorModal
        isOpen={isSavingsCalculatorOpen}
        onClose={() => setIsSavingsCalculatorOpen(false)}
        cluster={activeCluster}
        onOpenAddFacility={() => setIsAddModalOpen(true)}
      />

      <ESGCertificateModal
        isOpen={isESGCertificateOpen}
        onClose={() => setIsESGCertificateOpen(false)}
        cluster={activeCluster}
        metrics={optimizationResults.metrics}
      />
    </div>
  );
}
