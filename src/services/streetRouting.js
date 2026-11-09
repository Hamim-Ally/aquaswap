/**
 * AquaSwap Real Street Routing Service
 * Connects facilities via actual highway & industrial transit corridors using OSRM.
 * Features an instant local street cache with live fallback fetching for new/custom facilities.
 */
import cachedRoutes from '../data/cachedStreetRoutes.json';

const liveCache = new Map();

// Helper to construct coordinate lookup key
export const getRouteKey = (sLat, sLng, bLat, bLng) => {
  return `${Number(sLat).toFixed(4)},${Number(sLng).toFixed(4)}-${Number(bLat).toFixed(4)},${Number(bLng).toFixed(4)}`;
};

/**
 * Calculates distance between two lat/lng coordinates in meters (Haversine)
 */
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get turn-by-turn street route between two points.
 * Checks instant pre-computed street cache first, then live cache, then fetches live OSRM.
 */
export async function getStreetRoute(sLat, sLng, bLat, bLng) {
  const key = getRouteKey(sLat, sLng, bLat, bLng);

  // 1. Check pre-computed static street cache
  if (cachedRoutes[key]) {
    const data = cachedRoutes[key];
    return {
      points: data.points,
      distanceKm: Number((data.distanceMeters / 1000).toFixed(1)),
      durationMin: Math.round(data.durationSeconds / 60)
    };
  }

  // 2. Check in-memory session cache
  if (liveCache.has(key)) {
    return liveCache.get(key);
  }

  // 3. Fetch live from OSRM demo server for custom or dynamically generated facilities
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${bLng},${bLat}?overview=full&geometries=geojson`;
    const res = await fetch(url).then((r) => r.json());

    if (res.code === 'Ok' && res.routes?.[0]) {
      const rawCoords = res.routes[0].geometry.coordinates;
      const latLngs = rawCoords.map(([lng, lat]) => [Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
      const routeData = {
        points: latLngs,
        distanceKm: Number((res.routes[0].distance / 1000).toFixed(1)),
        durationMin: Math.round(res.routes[0].duration / 60)
      };

      liveCache.set(key, routeData);
      return routeData;
    }
  } catch (err) {
    console.warn(`[Street Routing] Live fetch failed for ${key}, using direct path fallback:`, err.message);
  }

  // Fallback direct path with intermediate points if offline
  const fallbackPoints = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    fallbackPoints.push([sLat + (bLat - sLat) * t, sLng + (bLng - sLng) * t]);
  }
  const dist = Number((haversineMeters(sLat, sLng, bLat, bLng) / 1000).toFixed(1));
  const fallback = {
    points: fallbackPoints,
    distanceKm: dist,
    durationMin: Math.round(dist * 2.2)
  };
  liveCache.set(key, fallback);
  return fallback;
}

/**
 * Synchronous route getter using pre-cached routes or immediate direct path
 */
export function getStreetRouteSync(sLat, sLng, bLat, bLng) {
  const key = getRouteKey(sLat, sLng, bLat, bLng);

  if (cachedRoutes[key]) {
    const data = cachedRoutes[key];
    return {
      points: data.points,
      distanceKm: Number((data.distanceMeters / 1000).toFixed(1)),
      durationMin: Math.round(data.durationSeconds / 60)
    };
  }

  if (liveCache.has(key)) {
    return liveCache.get(key);
  }

  // Linear fallback until async fetch resolves
  const fallbackPoints = [];
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    fallbackPoints.push([sLat + (bLat - sLat) * t, sLng + (bLng - sLng) * t]);
  }
  const dist = Number((haversineMeters(sLat, sLng, bLat, bLng) / 1000).toFixed(1));
  return {
    points: fallbackPoints,
    distanceKm: dist,
    durationMin: Math.round(dist * 2.2)
  };
}

/**
 * Calculates tanker truck position and heading angle along actual street waypoints
 * with distance-weighted interpolation.
 */
export function getTankerPositionAlongStreet(points, progressT) {
  if (!points || points.length === 0) {
    return { lat: 0, lng: 0, angle: 0 };
  }

  if (points.length === 1) {
    return { lat: points[0][0], lng: points[0][1], angle: 0 };
  }

  const clampedT = Math.max(0, Math.min(1, progressT));

  // Compute segment lengths
  let totalDistance = 0;
  const cumulative = [0];

  for (let i = 0; i < points.length - 1; i++) {
    const d = haversineMeters(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    totalDistance += d;
    cumulative.push(totalDistance);
  }

  const targetDist = clampedT * totalDistance;

  // Find active segment
  let segIdx = 0;
  for (let i = 0; i < cumulative.length - 1; i++) {
    if (targetDist >= cumulative[i] && targetDist <= cumulative[i + 1]) {
      segIdx = i;
      break;
    }
  }

  const p1 = points[segIdx];
  const p2 = points[segIdx + 1] || points[segIdx];

  const segStartDist = cumulative[segIdx];
  const segEndDist = cumulative[segIdx + 1] || segStartDist + 0.0001;
  const segLen = segEndDist - segStartDist;
  const localT = segLen > 0 ? (targetDist - segStartDist) / segLen : 0;

  const lat = p1[0] + (p2[0] - p1[0]) * localT;
  const lng = p1[1] + (p2[1] - p1[1]) * localT;

  // Bearing angle of current street segment
  const dLat = p2[0] - p1[0];
  const dLng = p2[1] - p1[1];
  const angle = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);

  return { lat, lng, angle };
}

