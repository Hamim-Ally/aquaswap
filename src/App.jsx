import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import ESGCertificateModal from './components/ESGCertificateModal';
import AuthModal from './components/AuthModal';

import { INDUSTRIAL_CLUSTERS } from './data/industrialProfiles';
import { solveWaterNetworkOptimization } from './engine/optimizationSolver';
import { clustersAPI, facilitiesAPI, authAPI } from './services/api';

export default function App() {
  const [clusters, setClusters] = useState(INDUSTRIAL_CLUSTERS);
  const [selectedCluster, setSelectedCluster] = useState(() => {
    try {
      const savedId = localStorage.getItem('aquaswap_cluster_id');
      if (savedId) {
        const found = INDUSTRIAL_CLUSTERS.find((c) => c.id === savedId);
        if (found) return found;
      }
    } catch (e) {}
    return INDUSTRIAL_CLUSTERS[0];
  });

  const handleSelectCluster = (cluster) => {
    setSelectedCluster(cluster);
    try {
      localStorage.setItem('aquaswap_cluster_id', cluster.id);
    } catch (e) {}
  };
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFacilityInitialType, setAddFacilityInitialType] = useState('supplier');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isESGCertificateOpen, setIsESGCertificateOpen] = useState(false);
  const [selectedMatchForWPA, setSelectedMatchForWPA] = useState(null);

  // Enterprise Authentication State (null by default for guest, or restored from localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aquaswap_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');

  // Load live clusters & facilities from SQLite backend upon startup
  useEffect(() => {
    clustersAPI
      .getAll()
      .then((data) => {
        if (data?.clusters?.length) {
          setClusters(data.clusters);
          setSelectedCluster((prev) => {
            const found = data.clusters.find((c) => c.id === prev.id);
            return found || data.clusters[0];
          });
        }
      })
      .catch((err) => {
        console.warn('Backend clusters API unavailable, using in-memory baseline:', err.message);
      });
  }, []);

  const handleOpenSignIn = (mode = 'signin') => {
    setAuthModalMode(typeof mode === 'string' ? mode : 'signin');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleOpenMockAccounts = () => {
    setAuthModalMode('demo');
    setIsAuthModalOpen(true);
  };

  // Handler for adding a new facility dynamically and saving to database
  const handleAddFacility = useCallback(
    (type, facility) => {
      // 1. Update React State immediately for responsive UI
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

      // 2. Persist to SQLite Backend
      facilitiesAPI
        .create({
          name: facility.name,
          type: type,
          clusterId: selectedCluster.id,
          sector: facility.sector,
          category: facility.category,
          capacityW: facility.capacityW,
          demandD: facility.demandD,
          effluent: facility.effluent,
          tolerance: facility.toleranceM || facility.tolerance,
          description: facility.description
        })
        .catch((err) => {
          console.warn('Failed to persist facility to SQLite backend:', err.message);
        });
    },
    [selectedCluster.id]
  );

  const handleLoginSuccess = (user, isNewRegistration = false) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('aquaswap_user', JSON.stringify(user));
    } catch (e) {}

    // Refresh clusters from SQLite backend so newly registered facility appears
    clustersAPI
      .getAll()
      .then((data) => {
        if (data?.clusters?.length) {
          setClusters(data.clusters);
          setSelectedCluster((prev) => {
            const found = data.clusters.find((c) => c.id === (user.clusterId || prev.id));
            return found || data.clusters[0];
          });
        }
      })
      .catch(() => {});
  };

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
  };

  const handleOpenAddModal = (role = 'supplier') => {
    setAddFacilityInitialType(role);
    setIsAddModalOpen(true);
  };

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


  const handleRunOptimization = () => {
    setSolverOptions((prev) => ({ ...prev }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Global Multi-Page Navigation Header */}
      <Header
        clusters={clusters}
        selectedCluster={selectedCluster}
        setSelectedCluster={handleSelectCluster}
        currentUser={currentUser}
        onOpenSignIn={handleOpenSignIn}
        onOpenSignUp={handleOpenSignUp}
        onOpenMockAccounts={handleOpenMockAccounts}
        onLogout={handleLogout}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
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
                onOpenMockAccounts={handleOpenMockAccounts}
                onOpenSignIn={handleOpenSignIn}
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
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
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
                cluster={activeCluster}
                optimizationResults={optimizationResults}
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
              />
            }
          />

          {/* Live Fleet & Partner Matchmaker Unified Page */}
          <Route
            path="/fleet"
            element={
              <FleetPage
                cluster={activeCluster}
                optimizationResults={optimizationResults}
                onSelectMatchForWPA={setSelectedMatchForWPA}
              />
            }
          />

          {/* Legacy /matchmaker route - smoothly renders the unified page with matchmaker focus */}
          <Route
            path="/matchmaker"
            element={
              <FleetPage
                cluster={activeCluster}
                optimizationResults={optimizationResults}
                onSelectMatchForWPA={setSelectedMatchForWPA}
                defaultTab="matchmaker"
              />
            }
          />

          {/* Unified Safety, Contracts & ESG Governance Page */}
          <Route
            path="/compliance"
            element={
              <CompliancePage
                selectedMatch={selectedMatchForWPA}
                cluster={activeCluster}
                metrics={optimizationResults.metrics}
                onOpenESGCertificate={() => setIsESGCertificateOpen(true)}
              />
            }
          />

          {/* Legacy /esg route - smoothly renders the unified page with ESG focus */}
          <Route
            path="/esg"
            element={
              <CompliancePage
                selectedMatch={selectedMatchForWPA}
                cluster={activeCluster}
                metrics={optimizationResults.metrics}
                onOpenESGCertificate={() => setIsESGCertificateOpen(true)}
                defaultTab="esg"
              />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Global Multi-Page Footer */}
      <Footer
        onOpenESGCertificate={() => setIsESGCertificateOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenSignIn={handleOpenSignIn}
        onOpenSignUp={handleOpenSignUp}
      />

      {/* Modals Accessible Across Any Page */}
      <FacilityManagerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddFacility={handleAddFacility}
        initialType={addFacilityInitialType}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onOpenAddModal={handleOpenAddModal}
      />

      <ESGCertificateModal
        isOpen={isESGCertificateOpen}
        onClose={() => setIsESGCertificateOpen(false)}
        cluster={activeCluster}
        metrics={optimizationResults.metrics}
      />

      {/* Enterprise Authentication Sign In / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
        clusters={clusters}
      />
    </div>
  );
}
