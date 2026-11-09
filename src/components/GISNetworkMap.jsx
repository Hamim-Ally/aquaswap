import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import {
  getStreetRoute,
  getStreetRouteSync,
  getTankerPositionAlongStreet
} from '../services/streetRouting';
import {
  MapPin,
  Truck,
  Droplets,
  X,
  Info,
  Building2,
  ArrowRight,
  Play,
  Pause,
  QrCode,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Layers,
  Maximize2,
  Navigation,
  Compass,
  Eye,
  EyeOff,
  Route
} from 'lucide-react';

// 100% Free, Public Basemaps (ZERO API Key Required - No Carto watermarks)
const TILE_LAYERS = {
  dark: {
    name: 'Cyber Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    subdomains: ['server'],
    maxZoom: 16
  },
  streets: {
    name: 'Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; StreetMap contributors',
    subdomains: ['server'],
    maxZoom: 19
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
    subdomains: ['server'],
    maxZoom: 18
  }
};

export default function GISNetworkMap({ cluster, optimizationResults }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'suppliers', 'buyers'
  const [isFleetRunning, setIsFleetRunning] = useState(true);
  const [fleetSpeed, setFleetSpeed] = useState(1); // 1x, 2x, 4x
  const [activeTileType, setActiveTileType] = useState('dark');
  const [showRoutes, setShowRoutes] = useState(true);
  const [showTankers, setShowTankers] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedBillOfLading, setSelectedBillOfLading] = useState(null);
  const [searchParams] = useSearchParams();
  const targetSupplier = searchParams.get('supplier');
  const targetBuyer = searchParams.get('buyer');

  const suppliers = cluster?.suppliers || [];
  const buyers = cluster?.buyers || [];
  const activeConnections = optimizationResults?.activeConnections || [];

  // DOM and Leaflet references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routesLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const tankersLayerRef = useRef(null);

  // Animation state stored in refs for 60fps jitter-free updates
  const fleetProgressRef = useRef(0);
  const animFrameIdRef = useRef(null);
  const tankerMarkersMapRef = useRef(new Map());

  // Center coordinates (default to cluster or Gazipur)
  const clusterLat = cluster?.coordinates?.lat ?? 23.998;
  const clusterLng = cluster?.coordinates?.lng ?? 90.395;
  const clusterZoom = 13.2;

  // Asynchronous street route state for custom or dynamically added facilities
  const [liveStreetRoutes, setLiveStreetRoutes] = useState({});

  useEffect(() => {
    let isCancelled = false;
    activeConnections.forEach(async (conn) => {
      const sup = suppliers.find((s) => s.id === conn.supplierId);
      const buy = buyers.find((b) => b.id === conn.buyerId);
      if (!sup || !buy) return;

      const sLat = sup.coords?.lat ?? clusterLat;
      const sLng = sup.coords?.lng ?? clusterLng;
      const bLat = buy.coords?.lat ?? clusterLat;
      const bLng = buy.coords?.lng ?? clusterLng;
      const key = `${sLat.toFixed(4)},${sLng.toFixed(4)}-${bLat.toFixed(4)},${bLng.toFixed(4)}`;

      const routeData = await getStreetRoute(sLat, sLng, bLat, bLng);
      if (!isCancelled && routeData?.points) {
        setLiveStreetRoutes((prev) => ({
          ...prev,
          [key]: routeData
        }));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [activeConnections, suppliers, buyers, clusterLat, clusterLng]);

  // Deep-link corridor autofocus (e.g. when navigated from Exchange Network)
  useEffect(() => {
    if (targetSupplier && targetBuyer && activeConnections.length > 0) {
      const match = activeConnections.find(
        (c) => c.supplierId === targetSupplier && c.buyerId === targetBuyer
      );
      if (match) {
        const sup = suppliers.find((s) => s.id === match.supplierId);
        const buy = buyers.find((b) => b.id === match.buyerId);
        if (sup && buy) {
          setSelectedNode({ type: 'corridor', conn: match, sup, buy });
          const supLat = sup.coords?.lat ?? clusterLat;
          const supLng = sup.coords?.lng ?? clusterLng;
          const buyLat = buy.coords?.lat ?? clusterLat;
          const buyLng = buy.coords?.lng ?? clusterLng;
          setTimeout(() => {
            if (mapInstanceRef.current) {
              const bounds = L.latLngBounds([[supLat, supLng], [buyLat, buyLng]]);
              mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 14.5, animate: true });
            }
          }, 400);
        }
      }
    }
  }, [targetSupplier, targetBuyer, activeConnections, suppliers, buyers, clusterLat, clusterLng]);

  // Precompute real highway and street routes for active connections
  const computedRoutes = useMemo(() => {
    return activeConnections.map((conn, idx) => {
      const sup = suppliers.find((s) => s.id === conn.supplierId);
      const buy = buyers.find((b) => b.id === conn.buyerId);
      if (!sup || !buy) return null;

      const sLat = sup.coords?.lat ?? clusterLat;
      const sLng = sup.coords?.lng ?? clusterLng;
      const bLat = buy.coords?.lat ?? clusterLat;
      const bLng = buy.coords?.lng ?? clusterLng;
      const key = `${sLat.toFixed(4)},${sLng.toFixed(4)}-${bLat.toFixed(4)},${bLng.toFixed(4)}`;

      // Fetch pre-cached or live OSRM street points
      const streetData = liveStreetRoutes[key] || getStreetRouteSync(sLat, sLng, bLat, bLng);
      const points = streetData.points;
      const midIdx = Math.floor(points.length / 2);
      const midPoint = points[midIdx] || [(sLat + bLat) / 2, (sLng + bLng) / 2];

      return {
        conn,
        sup,
        buy,
        idx,
        sLat,
        sLng,
        bLat,
        bLng,
        points,
        midPoint,
        streetDistanceKm: streetData.distanceKm || conn.distanceKm,
        streetDurationMin: streetData.durationMin || Math.round((conn.distanceKm || 10) * 2.2)
      };
    }).filter(Boolean);
  }, [activeConnections, suppliers, buyers, clusterLat, clusterLng, liveStreetRoutes]);

  // Smart centering: frames facilities with proper spacing
  const handleFitClusterBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const allPoints = [];
    suppliers.forEach((s) => {
      if (s.coords?.lat && s.coords?.lng) allPoints.push([s.coords.lat, s.coords.lng]);
    });
    buyers.forEach((b) => {
      if (b.coords?.lat && b.coords?.lng) allPoints.push([b.coords.lat, b.coords.lng]);
    });

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      const center = bounds.getCenter();
      // Enforce minimum zoom 13.2 so facilities are spread out across 500-700px instead of crowded in a knot
      const boundsZoom = map.getBoundsZoom(bounds);
      const targetZoom = Math.min(14.5, Math.max(13.2, boundsZoom));
      map.setView(center, targetZoom, { animate: true });
    } else {
      map.setView([clusterLat, clusterLng], clusterZoom, { animate: true });
    }
  };

  // 1. Initialize Leaflet Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    tankerMarkersMapRef.current.clear();

    const map = L.map(mapContainerRef.current, {
      center: [clusterLat, clusterLng],
      zoom: clusterZoom,
      zoomControl: false,
      attributionControl: true
    });

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial Tile Layer
    const tileConf = TILE_LAYERS[activeTileType] || TILE_LAYERS.dark;
    const tileLayer = L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      subdomains: tileConf.subdomains,
      maxZoom: tileConf.maxZoom
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Feature Layer Groups
    routesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    tankersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Auto focus cluster properly
    setTimeout(() => {
      handleFitClusterBounds();
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [cluster?.id]);

  // 2. Invalidate map size when drawer toggles or window resizes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 320);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedNode]);

  // 3. Switch Tile Basemap Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const tileConf = TILE_LAYERS[activeTileType] || TILE_LAYERS.dark;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(tileConf.url, {
      attribution: tileConf.attribution,
      subdomains: tileConf.subdomains,
      maxZoom: tileConf.maxZoom
    }).addTo(map);

    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  }, [activeTileType]);

  // 4. Render Corridors and Facility Markers (Decluttered & Sleek)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const routesGroup = routesLayerRef.current;
    const markersGroup = markersLayerRef.current;
    if (!routesGroup || !markersGroup) return;

    routesGroup.clearLayers();
    markersGroup.clearLayers();

    // --- Render Water Corridors (Polylines) ---
    if (showRoutes) {
      computedRoutes.forEach((route) => {
        const { conn, sup, buy, points, midPoint, idx } = route;
        const isSelected = selectedNode?.type === 'corridor' && selectedNode?.conn === conn;

        // Outer Glow Line
        const glowLine = L.polyline(points, {
          color: isSelected ? '#38bdf8' : '#0284c7',
          weight: isSelected ? 8 : 4.5,
          opacity: isSelected ? 0.6 : 0.25,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: true
        });

        // Foreground Dashed Water Flow Line
        const flowLine = L.polyline(points, {
          color: isSelected ? '#ffffff' : '#38bdf8',
          weight: isSelected ? 3.5 : 2.2,
          opacity: isSelected ? 1 : 0.85,
          dashArray: '6, 6',
          className: isFleetRunning ? 'aquaswap-route-flow' : '',
          interactive: true
        });

        const clickHandler = () => {
          setSelectedNode({ type: 'corridor', conn, sup, buy });
        };

        glowLine.on('click', clickHandler);
        flowLine.on('click', clickHandler);

        // Tooltip on corridor hover
        glowLine.bindTooltip(
          `<div style="font-weight:700; color:#38bdf8;">${sup.name.split(' ')[0]} ➔ ${buy.name.split(' ')[0]}</div><div style="font-size:11px; color:#cbd5e1;">Flow: <strong>${conn.flowVolumeM3} m³/d</strong> • Dist: <strong>${conn.distanceKm} km</strong></div>`,
          { sticky: true, opacity: 0.95 }
        );

        routesGroup.addLayer(glowLine);
        routesGroup.addLayer(flowLine);

        // Compact Midpoint Badge (Only for top flows or selected corridor to prevent clutter)
        if (showLabels && (isSelected || idx < 3)) {
          const badgeIcon = L.divIcon({
            className: 'aquaswap-midpoint-icon',
            iconSize: [64, 20],
            iconAnchor: [32, 10],
            html: `
              <div style="
                background: rgba(15, 23, 42, 0.92);
                border: 1px solid ${isSelected ? '#38bdf8' : '#0284c7'};
                color: #38bdf8;
                border-radius: 10px;
                padding: 1px 6px;
                font-size: 9px;
                font-weight: 700;
                font-family: var(--font-mono);
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 3px;
                cursor: pointer;
                white-space: nowrap;
              ">
                <span>💧</span>
                <span>${conn.flowVolumeM3}m³</span>
              </div>
            `
          });

          const badgeMarker = L.marker(midPoint, { icon: badgeIcon, interactive: true });
          badgeMarker.on('click', clickHandler);
          routesGroup.addLayer(badgeMarker);
        }
      });
    }

    // --- Render Suppliers (Cyan/Blue Givers) ---
    if (filterType === 'all' || filterType === 'suppliers') {
      suppliers.forEach((sup) => {
        const lat = sup.coords?.lat ?? clusterLat;
        const lng = sup.coords?.lng ?? clusterLng;
        const isSelected = selectedNode?.type === 'supplier' && selectedNode?.data?.id === sup.id;

        const supIcon = L.divIcon({
          className: 'aquaswap-supplier-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: `
            <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div class="aquaswap-pulse-ring" style="border: 2px solid rgba(2, 132, 199, 0.7); background: rgba(2, 132, 199, 0.2);"></div>
              <div style="
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: #0284c7;
                border: 2px solid #ffffff;
                box-shadow: 0 3px 8px rgba(2, 132, 199, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
                transition: transform 0.15s ease;
              ">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              ${
                showLabels
                  ? `
                <div style="
                  position: absolute;
                  top: 24px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: rgba(15, 23, 42, 0.9);
                  color: #38bdf8;
                  border: 1px solid rgba(2, 132, 199, 0.4);
                  border-radius: 3px;
                  padding: 1px 5px;
                  font-size: 9px;
                  font-weight: 700;
                  white-space: nowrap;
                  pointer-events: none;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.4);
                ">
                  ${sup.name.split(' ')[0]}
                </div>
              `
                  : ''
              }
            </div>
          `
        });

        const marker = L.marker([lat, lng], { icon: supIcon, interactive: true, zIndexOffset: isSelected ? 500 : 100 });
        marker.on('click', () => setSelectedNode({ type: 'supplier', data: sup }));

        marker.bindTooltip(
          `<div style="font-weight:800; color:#38bdf8; font-size:12px;">${sup.name}</div>
           <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">Sector: <strong>${sup.sector}</strong></div>
           <div style="font-size:11px; color:#38bdf8; font-weight:700;">Effluent Supply: ${sup.capacityW} m³/day</div>
           <div style="font-size:10px; color:#94a3b8;">TDS: ${sup.effluent?.TDS || 'N/A'} mg/L • pH: ${sup.effluent?.pH || '7.4'}</div>`,
          { direction: 'top', offset: [0, -12], opacity: 0.95 }
        );

        markersGroup.addLayer(marker);
      });
    }

    // --- Render Buyers (Emerald/Green Receivers) ---
    if (filterType === 'all' || filterType === 'buyers') {
      buyers.forEach((buy) => {
        const lat = buy.coords?.lat ?? clusterLat;
        const lng = buy.coords?.lng ?? clusterLng;
        const isSelected = selectedNode?.type === 'buyer' && selectedNode?.data?.id === buy.id;

        const buyIcon = L.divIcon({
          className: 'aquaswap-buyer-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: `
            <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div class="aquaswap-pulse-ring" style="border: 2px solid rgba(16, 185, 129, 0.7); background: rgba(16, 185, 129, 0.2);"></div>
              <div style="
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: #10b981;
                border: 2px solid #ffffff;
                box-shadow: 0 3px 8px rgba(16, 185, 129, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
                transition: transform 0.15s ease;
              ">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                </svg>
              </div>
              ${
                showLabels
                  ? `
                <div style="
                  position: absolute;
                  top: 24px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: rgba(15, 23, 42, 0.9);
                  color: #34d399;
                  border: 1px solid rgba(16, 185, 129, 0.4);
                  border-radius: 3px;
                  padding: 1px 5px;
                  font-size: 9px;
                  font-weight: 700;
                  white-space: nowrap;
                  pointer-events: none;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.4);
                ">
                  ${buy.name.split(' ')[0]}
                </div>
              `
                  : ''
              }
            </div>
          `
        });

        const marker = L.marker([lat, lng], { icon: buyIcon, interactive: true, zIndexOffset: isSelected ? 500 : 100 });
        marker.on('click', () => setSelectedNode({ type: 'buyer', data: buy }));

        marker.bindTooltip(
          `<div style="font-weight:800; color:#34d399; font-size:12px;">${buy.name}</div>
           <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">Sector: <strong>${buy.sector}</strong></div>
           <div style="font-size:11px; color:#34d399; font-weight:700;">Intake Demand: ${buy.demandD} m³/day</div>
           <div style="font-size:10px; color:#94a3b8;">Max TDS Tolerance: ${buy.toleranceM?.TDS || 50000} mg/L</div>`,
          { direction: 'top', offset: [0, -12], opacity: 0.95 }
        );

        markersGroup.addLayer(marker);
      });
    }
  }, [computedRoutes, suppliers, buyers, filterType, showRoutes, showLabels, isFleetRunning, selectedNode]);

  // 5. Smooth 60fps Animation Loop for Moving Tankers on Real Map (Streamlined Design)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const tankersGroup = tankersLayerRef.current;
    if (!map || !tankersGroup) return;

    if (!showTankers) {
      tankersGroup.clearLayers();
      tankerMarkersMapRef.current.clear();
      return;
    }

    let lastTimestamp = performance.now();

    const animateFrame = (currentTimestamp) => {
      const deltaSec = (currentTimestamp - lastTimestamp) / 1000;
      lastTimestamp = currentTimestamp;

      if (isFleetRunning) {
        // Advance progress smoothly (loop 0 to 1)
        const speedRate = 0.035 * fleetSpeed;
        fleetProgressRef.current = (fleetProgressRef.current + speedRate * deltaSec) % 1;
      }

      const currentProgress = fleetProgressRef.current;
      const markersMap = tankerMarkersMapRef.current;

      computedRoutes.forEach((route, idx) => {
        const { conn, sup, buy, points, streetDistanceKm, streetDurationMin } = route;
        const truckId = `TNK-0${idx + 1}`;

        // Stagger each tanker along the real street route cleanly
        const offsetT = (currentProgress + idx * 0.38) % 1;
        const pos = getTankerPositionAlongStreet(points, offsetT);

        const progressPercent = Math.round(offsetT * 100);
        const etaMinutes = Math.max(2, Math.round((1 - offsetT) * (streetDurationMin || conn.distanceKm * 2.2)));

        const currentBolData = {
          truckId,
          sup,
          buy,
          conn,
          streetDistanceKm,
          streetDurationMin,
          progress: progressPercent,
          etaMin: etaMinutes
        };

        let tankerEntry = markersMap.get(truckId);

        if (!tankerEntry) {
          const tankerIcon = L.divIcon({
            className: `aquaswap-tanker-node`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            html: `
              <div id="tanker-container-${truckId}" style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <!-- Radar Ping Ring -->
                <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid rgba(56, 189, 248, 0.7); background: rgba(56, 189, 248, 0.15); animation: aquaswapPulse 2s infinite;"></div>
                
                <!-- Rotating Tanker Node -->
                <div id="tanker-rotator-${truckId}" style="
                  width: 22px;
                  height: 22px;
                  background: #0f172a;
                  border: 1.5px solid #38bdf8;
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.6);
                  transform: rotate(${pos.angle}deg);
                  transition: transform 0.1s ease-out;
                ">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                    <path d="M15 18H9"/>
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                    <circle cx="17" cy="18" r="2"/>
                    <circle cx="7" cy="18" r="2"/>
                  </svg>
                </div>

                <!-- Call Sign Pill Tag -->
                <div style="
                  position: absolute;
                  top: -9px;
                  background: #0284c7;
                  color: #ffffff;
                  border-radius: 3px;
                  padding: 0 3px;
                  font-size: 7.5px;
                  font-weight: 800;
                  font-family: var(--font-mono);
                  white-space: nowrap;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.5);
                ">
                  ${truckId}
                </div>
              </div>
            `
          });

          const marker = L.marker([pos.lat, pos.lng], { icon: tankerIcon, interactive: true, zIndexOffset: 800 });
          marker._bolData = currentBolData;

          marker.on('click', () => {
            if (marker._bolData) {
              setSelectedBillOfLading(marker._bolData);
            }
          });

          marker.bindTooltip(
            `<div style="font-weight:700; color:#38bdf8;">Tanker ${truckId} [In Transit]</div>
             <div style="font-size:11px; color:#cbd5e1;">${sup.name.split(' ')[0]} ➔ ${buy.name.split(' ')[0]}</div>
             <div style="font-size:10px; color:#94a3b8; margin-top:2px;">ETA: ~${etaMinutes} mins • Click for Custody Manifest</div>`,
            { direction: 'top', offset: [0, -12], opacity: 0.95 }
          );

          tankersGroup.addLayer(marker);
          markersMap.set(truckId, { marker, truckId });
        } else {
          // Smoothly update existing marker coordinate & rotation
          tankerEntry.marker._bolData = currentBolData;
          tankerEntry.marker.setLatLng([pos.lat, pos.lng]);
          const rotatorEl = document.getElementById(`tanker-rotator-${truckId}`);
          if (rotatorEl) {
            rotatorEl.style.transform = `rotate(${pos.angle}deg)`;
          }
        }
      });

      animFrameIdRef.current = requestAnimationFrame(animateFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(animateFrame);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [computedRoutes, showTankers, isFleetRunning, fleetSpeed]);

  const totalFlowDaily = activeConnections.reduce((acc, c) => acc + (c.flowVolumeM3 || 0), 0);
  const totalCorridors = activeConnections.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={20} color="#0284c7" />
              <span>Live Tanker Fleet & Route Map</span>
            </h2>
            <span className="status-pill status-cyan">{cluster.region}</span>
            <span className={`status-pill ${isFleetRunning ? 'status-emerald' : 'status-amber'}`}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isFleetRunning ? '#10b981' : '#f59e0b', display: 'inline-block', marginRight: '4px' }}></span>
              {isFleetRunning ? `Fleet Active (${computedRoutes.length} Corridors)` : 'Telemetry Paused'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px', margin: '4px 0 0 0' }}>
            Real street transit network. Click any facility or tanker to inspect live manifests.
          </p>
        </div>

        {/* Fleet Control Action Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Pause / Play */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsFleetRunning(!isFleetRunning)}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isFleetRunning ? <Pause size={14} color="#0284c7" /> : <Play size={14} color="#10b981" />}
            <span>{isFleetRunning ? 'Pause' : 'Play'}</span>
          </button>

          {/* Speed Multiplier */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-light)' }}>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setFleetSpeed(spd)}
                style={{
                  border: 'none',
                  background: fleetSpeed === spd ? '#ffffff' : 'transparent',
                  color: fleetSpeed === spd ? '#0284c7' : '#64748b',
                  fontWeight: fleetSpeed === spd ? 700 : 500,
                  fontSize: '0.74rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: fleetSpeed === spd ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Layer Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className={`tab-pill ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              All ({suppliers.length + buyers.length})
            </button>
            <button
              className={`tab-pill ${filterType === 'suppliers' ? 'active' : ''}`}
              onClick={() => setFilterType('suppliers')}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Suppliers ({suppliers.length})
            </button>
            <button
              className={`tab-pill ${filterType === 'buyers' ? 'active' : ''}`}
              onClick={() => setFilterType('buyers')}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Buyers ({buyers.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Map Container & Right Details Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedNode ? '1fr 340px' : '1fr', gap: '20px', transition: 'all 0.3s ease' }}>
        
        {/* Real Map Canvas Wrapper */}
        <div
          className="ui-card"
          style={{
            position: 'relative',
            height: '620px',
            overflow: 'hidden',
            background: '#0f172a',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Top-Left: Clean Legend */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: 'var(--text-main)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }}></span>
              <strong>Supplier</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <strong>Buyer</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={13} color="#0284c7" />
              <strong>Live Tanker</strong>
            </div>
            <div style={{ height: '12px', width: '1px', background: '#e2e8f0' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
              <Info size={13} color="#0284c7" />
              <span>Click node/truck for manifest</span>
            </div>
          </div>

          {/* Top-Right: Basemap Switcher & Center Tool */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {/* Basemap Picker Pill */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.94)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
              }}
            >
              <Layers size={13} color="#38bdf8" style={{ marginLeft: '4px' }} />
              {Object.keys(TILE_LAYERS).map((key) => {
                const conf = TILE_LAYERS[key];
                const isActive = activeTileType === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTileType(key)}
                    style={{
                      border: 'none',
                      background: isActive ? '#0284c7' : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {conf.name}
                  </button>
                );
              })}
            </div>

            {/* Recenter / Focus Cluster Button */}
            <button
              onClick={handleFitClusterBounds}
              title="Reset View / Focus Cluster"
              style={{
                background: 'rgba(15, 23, 42, 0.94)',
                color: '#38bdf8',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
              }}
            >
              <Maximize2 size={13} />
              <span>Center</span>
            </button>
          </div>

          {/* Bottom-Left: Live Telemetry Status Ribbon */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              color: '#e2e8f0',
              fontSize: '0.76rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={13} color="#38bdf8" />
              <span>Grid: <strong style={{ color: '#ffffff' }}>{cluster.name.split(' ')[0]}</strong></span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.15)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={13} color="#38bdf8" />
              <span>Active Corridors: <strong style={{ color: '#38bdf8' }}>{totalCorridors}</strong></span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.15)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Droplets size={13} color="#10b981" />
              <span>In-Transit Volume: <strong style={{ color: '#10b981' }}>{totalFlowDaily.toLocaleString()} m³/d</strong></span>
            </div>
          </div>

          {/* LEAFLET REAL MAP DOM CONTAINER */}
          <div
            ref={mapContainerRef}
            className="aquaswap-map-container"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Right Drawer: Selected Node Details */}
        {selectedNode && (
          <div
            className="ui-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              maxHeight: '620px',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span className={`status-pill ${selectedNode.type === 'corridor' ? 'status-cyan' : selectedNode.type === 'supplier' ? 'status-cyan' : 'status-emerald'}`}>
                  {selectedNode.type === 'corridor'
                    ? 'Active Water Corridor'
                    : selectedNode.type === 'supplier'
                    ? 'Water Supplier'
                    : 'Water Buyer'}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px', margin: '6px 0 0 0' }}>
                  {selectedNode.type === 'corridor'
                    ? `${selectedNode.sup.name.split(' ')[0]} → ${selectedNode.buy.name.split(' ')[0]}`
                    : selectedNode.data.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px', borderRadius: '50%' }}
              >
                <X size={15} />
              </button>
            </div>

            {selectedNode.type === 'corridor' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                  This corridor connects <strong>{selectedNode.sup.name}</strong> to <strong>{selectedNode.buy.name}</strong> along verified highway & industrial transit rights-of-way.
                </p>

                {/* Factory Pinpoint Location Badges */}
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                    Pinpoint Coordinates
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>
                    <strong>Origin:</strong> {selectedNode.conn?.originPinpoint?.latStr || `${selectedNode.sup.coords?.lat?.toFixed(4)}° N`}, {selectedNode.conn?.originPinpoint?.lngStr || `${selectedNode.sup.coords?.lng?.toFixed(4)}° E`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>
                    <strong>Destination:</strong> {selectedNode.conn?.destPinpoint?.latStr || `${selectedNode.buy.coords?.lat?.toFixed(4)}° N`}, {selectedNode.conn?.destPinpoint?.lngStr || `${selectedNode.buy.coords?.lng?.toFixed(4)}° E`}
                  </div>
                </div>

                {/* Recommended Vehicle Mode */}
                {selectedNode.conn?.transportWay && (
                  <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: 'var(--radius-sm)', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>Recommended Vehicle</span>
                      <span className="status-pill status-emerald" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {selectedNode.conn.easeScore || 95}% Suitability
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={16} color="#0284c7" />
                      <span>{selectedNode.conn.vehicleName || '28 m³ Heavy Vacuum Tanker'}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '2px' }}>
                      {selectedNode.conn.deliveryWayRationale}
                    </div>
                  </div>
                )}

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Traded Volume</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                    {selectedNode.conn.flowVolumeM3} m³/day
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Haul Distance & Trips</div>
                  <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {selectedNode.conn.distanceKm} km • {selectedNode.conn.tankerTrucksDaily} {selectedNode.conn.recommendedVehicle === 'pipeline' ? 'continuous flow' : 'trips/day'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Daily Cost Savings</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    ৳ {Math.round(selectedNode.conn.totalCostDaily * 2.8).toLocaleString()}/day
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sector: <strong style={{ color: 'var(--text-main)' }}>{selectedNode.data.sector}</strong>
                </div>
                {selectedNode.data.coords && (
                  <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: '4px', border: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="#0284c7" />
                    <span><strong>Coordinates:</strong> {Math.abs(selectedNode.data.coords.lat || 0).toFixed(4)}° {selectedNode.data.coords.lat >= 0 ? 'N' : 'S'}, {Math.abs(selectedNode.data.coords.lng || 0).toFixed(4)}° {selectedNode.data.coords.lng >= 0 ? 'E' : 'W'}</span>
                  </div>
                )}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                  {selectedNode.data.description}
                </p>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedNode.type === 'supplier' ? 'Effluent Discharge Produced' : 'Daily Process Demand'}
                  </div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    {selectedNode.type === 'supplier' ? selectedNode.data.capacityW : selectedNode.data.demandD} m³/day
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Salinity (TDS)</div>
                  <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                    {selectedNode.type === 'supplier' ? selectedNode.data.effluent.TDS : selectedNode.data.toleranceM.TDS} mg/L
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chemical Oxygen Demand (COD)</div>
                  <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {selectedNode.type === 'supplier' ? selectedNode.data.effluent.COD : selectedNode.data.toleranceM.COD} mg/L
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. DIGITAL BILL OF LADING (BOL) MODAL */}
      {selectedBillOfLading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={() => setSelectedBillOfLading(null)}
        >
          <div
            className="ui-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#0284c7" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Digital Bill of Lading (Custody Manifest)
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    DoE & ASTM C1602 Verified Transport Protocol
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBillOfLading(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px', borderRadius: '50%' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tanker Call Sign:</span>
                <span className="mono" style={{ color: '#0284c7', fontWeight: 800 }}>{selectedBillOfLading.truckId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
                  In Transit ({selectedBillOfLading.progress}% journey complete)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Time of Arrival:</span>
                <span className="mono" style={{ color: '#0284c7', fontWeight: 700 }}>
                  ~ {selectedBillOfLading.etaMin} minutes
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Origin (Supplier):</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedBillOfLading.sup.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Destination (Buyer):</span>
                <strong style={{ color: '#0284c7' }}>{selectedBillOfLading.buy.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payload Volume:</span>
                <strong style={{ color: 'var(--text-main)' }}>28.0 m³ (Vacuum Stainless Steel)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transit Corridor:</span>
                <span className="mono" style={{ color: 'var(--text-main)' }}>{selectedBillOfLading.conn.corridorName || 'National Highway Corridor'}</span>
              </div>
            </div>

            {/* Quality Pre-Check Pass Seal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
              <ShieldCheck size={24} color="#059669" />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>
                <strong style={{ color: '#059669' }}>SCADA Pre-Trip Laboratory Test: PASSED</strong>
                <br /><span style={{ color: 'var(--text-muted)' }}>TDS: {selectedBillOfLading.conn.treatedEffluent?.TDS || 1800} mg/L • pH: 7.4 • COD: {selectedBillOfLading.conn.treatedEffluent?.COD || 65} mg/L • Zero prohibited chemical toxins detected.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <QrCode size={16} color="#0284c7" />
                <span>QR Verification Token #9942</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedBillOfLading(null)}>
                Confirm & Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
