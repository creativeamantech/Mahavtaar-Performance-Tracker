import { calculateRow } from './calculations';
import { resolveTargetPct } from './targets';

export function buildCityPivot(records: any[], targets: Record<string, number> = {}) {
  const map: Record<string, any> = {};
  records.forEach(r => {
    const c = calculateRow(r);
    const city = (r.city || r.City || 'UNKNOWN').toUpperCase();
    const state = (r.state || r.State || 'UNKNOWN').toUpperCase();
    
    if (!map[city]) map[city] = { city, state, collection: 0, count: 0, totalPOS: 0, paid: 0, paidPOS: 0, rollbackPOS: 0, targetPOS: 0 };
    
    const posVal = Number(r.principal_outstanding) || 0;
    map[city].collection += Number(r.dac ?? r.DAC) || 0;
    map[city].count += 1;
    map[city].totalPOS += posVal;
    if (c.mainPaid === 1) map[city].paid += 1;
    map[city].paidPOS += c.mainPaidPOS || 0;
    map[city].rollbackPOS += c.rollbackPOS || 0;

    const xPct = resolveTargetPct(targets, { city: r.city || r.City, state: r.state || r.State, bkt: r.bom_bkt });
    
    map[city].targetPOS += (posVal * xPct) / 100;
  });
  return Object.values(map).map((city: any) => {
    return {
      ...city,
      pct: city.totalPOS ? city.paidPOS / city.totalPOS : 0,
      rollbackPct: city.totalPOS ? city.rollbackPOS / city.totalPOS : 0,
      target: Math.max(0, city.targetPOS - city.paidPOS),
    };
  }).sort((a: any, b: any) => b.count - a.count);
}

export function buildTeamPivot(records: any[], targets: Record<string, number> = {}) {
  const map: Record<string, any> = {};
  records.forEach(r => {
    const c = calculateRow(r);
    const exec = r.executive_name || r['Executive Name'] || 'UNKNOWN';
    const bkt = r.bom_bkt || 'UNKNOWN';
    
    const key = `${bkt}__${exec}`;
    if (!map[key]) map[key] = { bkt, exec, collection: 0, count: 0, totalPOS: 0, paid: 0, paidPOS: 0, posPaidOnlyCount: 0, posPaidOnlyPOS: 0, targetPOS: 0 };
    map[key].collection += Number(r.dac ?? r.DAC) || 0;
    map[key].count += 1;
    const posVal = Number(r.principal_outstanding) || 0;
    map[key].totalPOS += posVal;
    if (c.teamPaid === 1) {
      map[key].paid += 1;
      map[key].paidPOS += c.teamPaidPOS || 0;
    }
    if (c.posCleared <= 0 && c.teamPaid !== 1) {
      map[key].posPaidOnlyCount += 1;
      map[key].posPaidOnlyPOS += posVal;
    }

    const xPct = resolveTargetPct(targets, { city: r.city || r.City, state: r.state || r.State, bkt: r.bom_bkt });
              
    map[key].targetPOS += (posVal * xPct) / 100;
  });
  return Object.values(map)
    .map((e: any) => ({ 
      ...e, 
      pct: e.totalPOS ? e.paidPOS / e.totalPOS : 0,
      target: Math.max(0, e.targetPOS - e.paidPOS)
    }))
    .sort((a: any, b: any) => a.bkt - b.bkt || a.exec.localeCompare(b.exec));
}

export function buildCrossTab(records: any[], targets: Record<string, number> = {}) {
  const execs = [...new Set(records.map(r => r.executive_name || r['Executive Name'] || 'UNKNOWN'))].sort() as string[];
  
  const cityCounts: Record<string, number> = {};
  records.forEach(r => {
    const city = (r.city || r.City || '').toUpperCase();
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });
  const cities = [...new Set(records.map(r => (r.city || r.City || '').toUpperCase()))]
    .sort((a, b) => cityCounts[b] - cityCounts[a]) as string[];

  const matrix: Record<string, Record<string, { paidPOS: number; totalPOS: number; targetPOS: number; target: number }>> = {};

  records.forEach(r => {
    const c = calculateRow(r);
    const city = (r.city || r.City || '').toUpperCase();
    const exec = r.executive_name || r['Executive Name'] || 'UNKNOWN';
    
    if (!matrix[city]) matrix[city] = {};
    if (!matrix[city][exec]) matrix[city][exec] = { paidPOS: 0, totalPOS: 0, targetPOS: 0, target: 0 };
    
    const posVal = Number(r.principal_outstanding) || 0;
    matrix[city][exec].paidPOS += c.teamPaidPOS || 0;
    matrix[city][exec].totalPOS += posVal;

    const xPct = resolveTargetPct(targets, { city: r.city || r.City, state: r.state || r.State, bkt: r.bom_bkt });
              
    matrix[city][exec].targetPOS += (posVal * xPct) / 100;
  });

  // Calculate needed POS (target) for each cell
  cities.forEach(city => {
    execs.forEach(exec => {
      if (matrix[city] && matrix[city][exec]) {
        matrix[city][exec].target = Math.max(0, matrix[city][exec].targetPOS - matrix[city][exec].paidPOS);
      }
    });
  });

  return { execs, cities, matrix };
}
