import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import OptimizerPage from './pages/OptimizerPage';
import BlenderPage from './pages/BlenderPage';
import FleetPage from './pages/FleetPage';
import CompliancePage from './pages/CompliancePage';

// Modals
import FacilityManagerModal from './components/FacilityManagerModal';
import HowItWorksModal from './components/HowItWorksModal';
import SavingsCalculatorModal from './components/SavingsCalculatorModal';
import ESGCertificateModal from './components/ESGCertificateModal';
import AuthModal from './components/AuthModal';

import { AuthProvider, useAuth } from './context/AuthContext';
import { apiFetch } from './api';

import { INDUSTRIAL_CLUSTERS } from './data/industrialProfiles';
import { solveWaterNetworkOptimization } from './engine/optimizationSolver';

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { user, authReady, logout } = useAuth();
  const navigate = useNavigate();
  const [clusters, setClusters] = useState(INDUSTRIAL_CLUSTERS);
  const [selectedCluster, setSelectedCluster] = useState(INDUSTRIAL_CLUSTERS[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingRegister, setPendingRegister] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSavingsCalculatorOpen, setIsSavingsCalculatorOpen] = useState(false);
  const [isESGCertificateOpen, setIsESGCertificateOpen] = useState(false);
  const [selectedMatchForWPA, setSelectedMatchForWPA] = useState(null);
  const [blenderFocusId, setBlenderFocusId] = useState(null);
  const [blenderFocusBuyerId, setBlenderFocusBuyerId] = useState(null);

  // Register Now flow: require an account first, then open the registration wizard
  const openRegisterFlow = useCallback(() => {
    if (user) {
      setIsAddModalOpen(true);
    } else {
      setPendingRegister(true);
      setIsAuthOpen(true);
    }
  }, [user]);

  // Pull this account's saved factories from SQLite and merge them into the live clusters
  useEffect(() => {
    if (!authReady || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const { facilities } = await apiFetch('/facilities');
        if (cancelled || !facilities?.length) return;
        setClusters((prevClusters) => {
          let next = prevClusters;
          for (const f of facilities) {
            const fid = f.data?.id;
            const cid = f.data?.clusterId;
            if (!fid || !cid) continue;
            next = next.map((c) => {
              if (c.id !== cid) return c;
              const listKey = f.type === 'supplier' ? 'suppliers' : 'buyers';
              if (c[listKey]?.some((x) => x.id === fid)) return c;
              return { ...c, [listKey]: [...(c[listKey] || []), f.data] };
            });
          }
          setSelectedCluster((prevSel) => {
            const updated = next.find((c) => c.id === prevSel.id);
            return updated || prevSel;
          });
          return next;
        });
      } catch (err) {
        console.warn('Could not load saved facilities:', err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

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

  // Handler for adding a new facility dynamically — updates live state AND persists to the account database
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

      if (user) {
        apiFetch('/facilities', {
          method: 'POST',
          body: {
            type,
            name: facility.name,
            sector: facility.sector,
            data: { ...facility, clusterId: selectedCluster.id }
          }
        }).catch((err) => console.warn('Facility save failed (kept in live session):', err.message));
      }
    },
    [selectedCluster.id, user]
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
        user={user}
        onOpenAddModal={openRegisterFlow}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={logout}
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
                cluster={activeCluster}
                metrics={optimizationResults.metrics}
                onOpenSavingsCalculator={() => setIsSavingsCalculatorOpen(true)}
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
                onOpenAddModal={openRegisterFlow}
                onOpenAuth={() => setIsAuthOpen(true)}
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
                cluster={activeCluster}
                focusFacilityId={blenderFocusId}
                focusBuyerId={blenderFocusBuyerId}
                buyerAllocations={optimizationResults.buyerAllocations}
                onOpenExchange={() => navigate('/optimizer')}
                onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
              />
            }
          />

          {/* Live Tanker Fleet, GIS Map & Partner Matchmaker Page */}
          <Route
            path="/fleet"
            element={
              <FleetPage
                cluster={activeCluster}
                optimizationResults={optimizationResults}
                onSelectMatchForWPA={setSelectedMatchForWPA}
                onOpenBlenderForBuyer={(buyerId) => {
                  setBlenderFocusBuyerId(buyerId);
                  setBlenderFocusId(null);
                  navigate('/blender');
                }}
              />
            }
          />

          {/* Safety, SCADA, Contracts & ESG Audit Page */}
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
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          if (pendingRegister) {
            setPendingRegister(false);
            setIsAddModalOpen(true);
          }
        }}
      />

      <FacilityManagerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddFacility={handleAddFacility}
        onOpenBlender={(facilityId) => {
          setBlenderFocusId(facilityId);
          setBlenderFocusBuyerId(null);
          setIsAddModalOpen(false);
          navigate('/blender');
        }}
        onOpenNetwork={(facilityId) => {
          setBlenderFocusId(facilityId);
          setBlenderFocusBuyerId(null);
          setIsAddModalOpen(false);
          navigate('/optimizer');
        }}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <SavingsCalculatorModal
        isOpen={isSavingsCalculatorOpen}
        onClose={() => setIsSavingsCalculatorOpen(false)}
        cluster={activeCluster}
        onOpenAddFacility={openRegisterFlow}
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
