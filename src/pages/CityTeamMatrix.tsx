import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useData } from '../contexts/DataContext';
import { buildCrossTab } from '../lib/pivots';
import { fmtPct, pctColor, fmtCur } from '../lib/formatters';
import { exportMatrix } from '../lib/exporter';
import { Download, PieChart, Shield, Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { StatCard } from '../components/ui/StatCard';

export default function CityTeamMatrix() {
  const { records } = useData();

  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedBucket, setSelectedBucket] = useState<string>('All');
  const [selectedExec, setSelectedExec] = useState<string>('All');
  const [selectedAllocDate, setSelectedAllocDate] = useState<string>('All');

  const availableStates = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      const v = String(r.state || r.State || 'UNKNOWN').trim().toUpperCase();
      if (v) set.add(v);
    });
    return ['All', ...Array.from(set).sort()];
  }, [records]);

  const recordsByState = useMemo(() => {
    if (selectedState === 'All') return records;
    return records.filter(r => String(r.state || r.State || 'UNKNOWN').trim().toUpperCase() === selectedState);
  }, [records, selectedState]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    recordsByState.forEach(r => {
      const v = String(r.city || r.City || 'UNKNOWN').trim().toUpperCase();
      if (v) set.add(v);
    });
    return ['All', ...Array.from(set).sort()];
  }, [recordsByState]);

  const recordsByCity = useMemo(() => {
    if (selectedCity === 'All') return recordsByState;
    return recordsByState.filter(r => String(r.city || r.City || 'UNKNOWN').trim().toUpperCase() === selectedCity);
  }, [recordsByState, selectedCity]);

  const availableBuckets = useMemo(() => {
    const set = new Set<string>();
    recordsByCity.forEach(r => {
      const v = String(r.bom_bkt || 'UNKNOWN').trim();
      if (v) set.add(v);
    });
    return ['All', ...Array.from(set).sort((a,b) => Number(a) - Number(b))];
  }, [recordsByCity]);

  const recordsByBucket = useMemo(() => {
    if (selectedBucket === 'All') return recordsByCity;
    return recordsByCity.filter(r => String(r.bom_bkt || 'UNKNOWN').trim() === selectedBucket);
  }, [recordsByCity, selectedBucket]);

  const availableExecs = useMemo(() => {
    const set = new Set<string>();
    recordsByBucket.forEach(r => {
      const v = String(r.executive_name || r['Executive Name'] || 'UNKNOWN').trim();
      if (v) set.add(v);
    });
    return ['All', ...Array.from(set).sort()];
  }, [recordsByBucket]);

  const recordsByExec = useMemo(() => {
    if (selectedExec === 'All') return recordsByBucket;
    return recordsByBucket.filter(r => String(r.executive_name || r['Executive Name'] || 'UNKNOWN').trim() === selectedExec);
  }, [recordsByBucket, selectedExec]);

  const availableAllocDates = useMemo(() => {
    const set = new Set<string>();
    recordsByExec.forEach(r => {
      const v = String(r.allocation_date || 'UNKNOWN').trim();
      if (v) set.add(v);
    });
    return ['All', ...Array.from(set).sort()];
  }, [recordsByExec]);

  const finalRecords = useMemo(() => {
    if (selectedAllocDate === 'All') return recordsByExec;
    return recordsByExec.filter(r => String(r.allocation_date || 'UNKNOWN').trim() === selectedAllocDate);
  }, [recordsByExec, selectedAllocDate]);

  // Reset hooks
  useEffect(() => { if (selectedCity !== 'All' && !availableCities.includes(selectedCity)) setSelectedCity('All'); }, [availableCities, selectedCity]);
  useEffect(() => { if (selectedBucket !== 'All' && !availableBuckets.includes(selectedBucket)) setSelectedBucket('All'); }, [availableBuckets, selectedBucket]);
  useEffect(() => { if (selectedExec !== 'All' && !availableExecs.includes(selectedExec)) setSelectedExec('All'); }, [availableExecs, selectedExec]);
  useEffect(() => { if (selectedAllocDate !== 'All' && !availableAllocDates.includes(selectedAllocDate)) setSelectedAllocDate('All'); }, [availableAllocDates, selectedAllocDate]);

  const { execs, cities, matrix } = useMemo(() => buildCrossTab(finalRecords), [finalRecords]);

  // Overall calculations for the current filtered view
  const overall = useMemo(() => {
    let totalPOS = 0;
    let paidPOS = 0;
    let provisionalPOS = 0;
    finalRecords.forEach(r => {
      totalPOS += (Number(r.principal_outstanding) || 0);
      if (r.provisional_dac && r.provisional_dac > 0) {
        provisionalPOS += (Number(r.principal_outstanding) || 0); // Is Provisional POS the POS of accounts with provisional DAC? Yes, just like Paid POS is the POS of accounts with Paid DAC? Wait, teamPaidPOS logic is complex.
      }
    });
    
    cities.forEach(city => {
      execs.forEach(exec => {
        if (matrix[city] && matrix[city][exec]) {
          paidPOS += matrix[city][exec].paidPOS;
        }
      });
    });
    
    // For provisional, let's just sum the provisional DAC amount itself, since the request is ambiguous on how provisional POS is calculated (since it uses TeamPaid rules normally). Let's sum Provisional DAC.
    let totalProvDac = 0;
    finalRecords.forEach(r => {
      totalProvDac += (Number(r.provisional_dac) || 0);
    });

    return { totalPOS, paidPOS, pct: totalPOS ? paidPOS / totalPOS : 0, totalProvDac };
  }, [finalRecords, cities, execs, matrix]);

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-extrabold uppercase tracking-wide">City × Executive Metrics</h1>
          <p className="font-data text-xs text-muted-foreground">Team Paid % · Multi-Level Filters</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => exportMatrix({ execs, cities, matrix }, selectedBucket)} className="flex h-[34px] items-center gap-2 rounded-md bg-primary px-4 font-heading text-xs font-bold text-primary-foreground hover:opacity-90">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div>
          <label className="mb-1.5 block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
            <SelectContent>{availableStates.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger><SelectValue placeholder="All Cities" /></SelectTrigger>
            <SelectContent>{availableCities.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bucket</label>
          <Select value={selectedBucket} onValueChange={setSelectedBucket}>
            <SelectTrigger><SelectValue placeholder="All Buckets" /></SelectTrigger>
            <SelectContent>{availableBuckets.map(v => <SelectItem key={v} value={v}>{v === 'All' ? 'All' : `Bucket ${v}`}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">Executive</label>
          <Select value={selectedExec} onValueChange={setSelectedExec}>
            <SelectTrigger><SelectValue placeholder="All Execs" /></SelectTrigger>
            <SelectContent>{availableExecs.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alloc Date</label>
          <Select value={selectedAllocDate} onValueChange={setSelectedAllocDate}>
            <SelectTrigger><SelectValue placeholder="All Dates" /></SelectTrigger>
            <SelectContent>{availableAllocDates.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Filtered Total POS" value={fmtCur(overall.totalPOS)} accentColor="info" icon={<Shield className="h-3.5 w-3.5 text-info" />} />
        <StatCard label="Filtered Paid POS" value={fmtCur(overall.paidPOS)} accentColor="success" icon={<Target className="h-3.5 w-3.5 text-success" />} />
        <StatCard label="Filtered Prov DAC" value={fmtCur(overall.totalProvDac)} subLabel="Unconfirmed" accentColor="destructive" icon={<PieChart className="h-3.5 w-3.5 text-destructive" />} />
        <StatCard label="Filtered Team Paid %" value={fmtPct(overall.pct)} subLabel={`${finalRecords.length} records matched`} accentColor="primary" icon={<PieChart className="h-3.5 w-3.5 text-primary" />} />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full font-data text-xs">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="sticky left-0 z-10 bg-card px-3 py-2.5 text-left font-medium text-muted-foreground">City</th>
                {execs.map(exec => (
                  <th key={exec} className="px-3 py-2.5 text-right font-medium text-muted-foreground">{exec}</th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold text-foreground">Grand Total %</th>
                <th className="px-3 py-2.5 text-right font-bold text-muted-foreground">Needed POS</th>
              </tr>
            </thead>
            <tbody>
              {cities.map(city => {
                let cityPaidPOS = 0, cityTotalPOS = 0, cityTargetPOS = 0;
                execs.forEach(exec => {
                  const cell = matrix[city]?.[exec];
                  if (cell) { 
                    cityPaidPOS += cell.paidPOS; 
                    cityTotalPOS += cell.totalPOS; 
                    cityTargetPOS += cell.targetPOS;
                  }
                });
                const cityPct = cityTotalPOS ? cityPaidPOS / cityTotalPOS : 0;
                const cityNeededPOS = Math.max(0, cityTargetPOS - cityPaidPOS);
                return (
                  <tr key={city} className="border-b border-border transition-colors hover:bg-bg-hover">
                    <td className="sticky left-0 z-10 bg-background px-3 py-2 font-medium">{city}</td>
                    {execs.map(exec => {
                      const cell = matrix[city]?.[exec];
                      if (!cell) return <td key={exec} className="px-3 py-2 text-right text-muted-foreground">—</td>;
                      const pct = cell.totalPOS ? cell.paidPOS / cell.totalPOS : 0;
                      return <td key={exec} className={`px-3 py-2 text-right ${pctColor(pct)}`}>{fmtPct(pct)}</td>;
                    })}
                    <td className={`px-3 py-2 text-right font-bold ${pctColor(cityPct)}`}>{fmtPct(cityPct)}</td>
                    <td className="px-3 py-2 text-right text-destructive font-bold">{cityNeededPOS <= 0 ? <span className="text-[10px] text-success uppercase">Achieved</span> : fmtCur(cityNeededPOS)}</td>
                  </tr>
                );
              })}
              {/* Grand Total Row */}
              <tr className="bg-accent-dim/30 font-bold">
                <td className="sticky left-0 z-10 bg-accent-dim/30 px-3 py-2.5 font-heading">Grand Total</td>
                {execs.map(exec => {
                  let paidPOS = 0, totalPOS = 0;
                  cities.forEach(city => {
                    const cell = matrix[city]?.[exec];
                    if (cell) { paidPOS += cell.paidPOS; totalPOS += cell.totalPOS; }
                  });
                  const pct = totalPOS ? paidPOS / totalPOS : 0;
                  return <td key={exec} className={`px-3 py-2.5 text-right ${pctColor(pct)}`}>{fmtPct(pct)}</td>;
                })}
                <td className="px-3 py-2.5 text-right" />
                <td className="px-3 py-2.5 text-right" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-2 font-heading text-sm font-bold">Needed POS Details</h3>
        <p className="font-data text-xs text-muted-foreground leading-relaxed">
          The matrix displays the Team Paid percentage. <br/>
          To view Needed POS, please refer to the City Pivot or Team Pivot reports.
        </p>
      </div>
    </AppLayout>
  );
}
