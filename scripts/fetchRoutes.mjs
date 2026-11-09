import fs from 'fs';
import { INDUSTRIAL_CLUSTERS } from '../src/data/industrialProfiles.js';

async function fetchAllRoutes() {
  const result = {};
  console.log('Fetching real street paths from OSRM for all cluster facilities...');
  
  for (const c of INDUSTRIAL_CLUSTERS) {
    console.log(`\nCluster: ${c.name}`);
    for (const s of c.suppliers) {
      for (const b of c.buyers) {
        const key = `${s.coords.lat.toFixed(4)},${s.coords.lng.toFixed(4)}-${b.coords.lat.toFixed(4)},${b.coords.lng.toFixed(4)}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${s.coords.lng},${s.coords.lat};${b.coords.lng},${b.coords.lat}?overview=full&geometries=geojson`;
        
        try {
          const res = await fetch(url).then(r => r.json());
          if (res.code === 'Ok' && res.routes?.[0]) {
            const rawCoords = res.routes[0].geometry.coordinates;
            const latLngs = rawCoords.map(([lng, lat]) => [Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
            result[key] = {
              points: latLngs,
              distanceMeters: Math.round(res.routes[0].distance),
              durationSeconds: Math.round(res.routes[0].duration)
            };
            console.log(`  ✓ ${s.name.split(' ')[0]} ➔ ${b.name.split(' ')[0]}: ${(res.routes[0].distance/1000).toFixed(1)} km (${latLngs.length} street waypoints)`);
          } else {
            console.warn(`  ✗ OSRM returned: ${res.code} for ${s.name} -> ${b.name}`);
          }
        } catch (e) {
          console.error(`  ✗ Error for ${key}:`, e.message);
        }
        await new Promise(r => setTimeout(r, 250));
      }
    }
  }

  fs.writeFileSync('./src/data/cachedStreetRoutes.json', JSON.stringify(result, null, 2));
  console.log(`\nSuccess! Saved ${Object.keys(result).length} street routes to ./src/data/cachedStreetRoutes.json`);
}

fetchAllRoutes().catch(console.error);

