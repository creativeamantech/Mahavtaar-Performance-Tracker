import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { buildCityPivot } from '../lib/pivots';
import { fmtCur, fmtPct, pctColor, targetColor } from '../lib/formatters';
import { exportCityPivot } from '../lib/exporter';
import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveFilter } from '../components/ui/ResponsiveFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function CityPivot() {
  const { records, targets, isLoading } = useData();
  const { user, isExecutive } = useAuth();

  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedBucket, setSelectedBucket] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');

  const baseRecords = useMemo(() => {
    if (isExecutive() && user) return records.filter(r => r.executive_name === user.name);
    return records;
  }, [records, user, isExecutive]);

  // Extract available options
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    baseRecords.forEach(r => {
      const state = String(r.state || r.State || 'UNKNOWN').trim().toUpperCase();
      if (state) states.add(state);
    });
    return ['All', ...Array.from(states).sort()];
  }, [baseRecords]);

  const recordsByState = useMemo(() => {
    if (selectedState === 'All') return baseRecords;
    return baseRecords.filter(r => String(r.state || r.State || 'UNKNOWN').trim().toUpperCase() === selectedState);
  }, [baseRecords, selectedState]);

  const availableBuckets = useMemo(() => {
    const buckets = new Set<string>();
    recordsByState.forEach(r => {
      const bkt = String(r.bom_bkt || 'UNKNOWN').trim();
      if (bkt) buckets.add(bkt);
    });
    return ['All', ...Array.from(buckets).sort((a,b) => Number(a) - Number(b))];
  }, [recordsByState]);

  const recordsByBucket = useMemo(() => {
    if (selectedBucket === 'All') return recordsByState;
    return recordsByState.filter(r => String(r.bom_bkt || 'UNKNOWN').trim() === selectedBucket);
  }, [recordsByState, selectedBucket]);

  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    recordsByBucket.forEach(r => {
      const city = String(r.city || r.City || 'UNKNOWN').trim().toUpperCase();
      if (city) cities.add(city);
    });
    return ['All', ...Array.from(cities).sort()];
  }, [recordsByBucket]);

  const finalRecords = useMemo(() => {
    if (selectedCity === 'All') return recordsByBucket;
    return recordsByBucket.filter(r => String(r.city || r.City || 'UNKNOWN').trim().toUpperCase() === selectedCity);
  }, [recordsByBucket, selectedCity]);

  // Filter resets
  useEffect(() => {
    if (selectedBucket !== 'All' && !availableBuckets.includes(selectedBucket)) {
      setSelectedBucket('All');
    }
  }, [availableBuckets, selectedBucket]);

  useEffect(() => {
    if (selectedCity !== 'All' && !availableCities.includes(selectedCity)) {
      setSelectedCity('All');
    }
  }, [availableCities, selectedCity]);

  const cityData = useMemo(() => buildCityPivot(finalRecords, targets), [finalRecords, targets]);

  const grandTotal = useMemo(() => ({
    city: 'GRAND TOTAL', state: '', 
    collection: cityData.reduce((s, c) => s + c.collection, 0),
    pct: 0, rollbackPct: 0,
    count: cityData.reduce((s, c) => s + c.count, 0),
    totalPOS: cityData.reduce((s, c) => s + c.totalPOS, 0),
    paid: cityData.reduce((s, c) => s + c.paid, 0),
    paidPOS: cityData.reduce((s, c) => s + c.paidPOS, 0),
    target: cityData.reduce((s, c) => s + c.target, 0),
  }), [cityData]);

  // compute grand pct
  const gPct = grandTotal.totalPOS ? grandTotal.paidPOS / grandTotal.totalPOS : 0;

  const columns = [
    { key: '_idx', label: 'Rank', width: '40px', hideBelow: 'lg' as const, sortable: false, render: (_: any, __: any, index: number) => <span className="font-bold text-muted-foreground">{index + 1}</span> },
    { key: 'city', label: 'City', render: (v: string) => <Link to={`/explorer?city=${encodeURIComponent(v)}`} className="font-medium text-primary hover:underline">{v}</Link> },
    { key: 'state', label: 'State', hideBelow: 'md' as const, render: (v: string) => <span className="text-muted-foreground text-[11px]">{v}</span> },
    { key: 'collection', label: 'Collection', align: 'right' as const, hideBelow: 'md' as const, render: (v: number) => <span className="text-primary">{fmtCur(v)}</span> },
    { key: 'pct', label: 'Sum of %', align: 'right' as const, render: (v: number, row: any) => {
      const isAchieved = row.target <= 0;
      const pctValue = Math.min(v * 100, 100);
      const barColor = isAchieved ? 'bg-success' : 'bg-primary';
      return (
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pctValue}%` }} />
          </div>
          <span className={`w-12 text-right font-bold ${pctColor(v)}`}>{fmtPct(v)}</span>
        </div>
      );
    } },
    { key: 'rollbackPct', label: 'Rollback %', align: 'right' as const, render: (v: number) => <span className="text-info">{fmtPct(v)}</span> },
    { key: 'count', label: 'Total Count', align: 'right' as const },
    { key: 'totalPOS', label: 'Total POS', align: 'right' as const, hideBelow: 'lg' as const, render: (v: number) => fmtCur(v) },
    { key: 'paid', label: 'Total Paid', align: 'right' as const, render: (v: number) => <span className="text-success">{v}</span> },
    { key: 'paidPOS', label: 'Total Paid POS', align: 'right' as const, render: (v: number) => fmtCur(v) },
    { key: 'target', label: 'Needed POS', align: 'right' as const, hideBelow: 'sm' as const, render: (v: number) => (
      v <= 0 ? <StatusBadge variant="paid">✓ Achieved</StatusBadge> : <span className={targetColor(v)}>{fmtCur(v)}</span>
    )},
  ];

  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="h-6 w-48 rounded bg-muted"></div>
              <div className="mt-2 h-3 w-32 rounded bg-muted/50"></div>
            </div>
            <div className="h-9 w-24 rounded-md bg-muted"></div>
          </div>
          <div className="mb-6 h-24 rounded-xl bg-card border border-border shadow-sm"></div>
          <div className="h-[500px] rounded-xl bg-card border border-border shadow-sm"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-extrabold uppercase tracking-wide">Citywise Performance</h1>
          <p className="font-sans text-xs text-muted-foreground">Main Paid Logic · State X% Targets</p>
        </div>
        <button onClick={() => exportCityPivot(cityData)} className="flex h-[34px] items-center gap-2 rounded-md bg-primary px-4 font-sans text-xs font-bold text-primary-foreground hover:opacity-90">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-4 mb-6">
        <ResponsiveFilter
          filters={[
            { id: 'state', label: 'State', value: selectedState, onChange: setSelectedState, options: availableStates.map(s => ({ value: s, label: s })) },
            { id: 'bkt', label: 'Bucket', value: selectedBucket, onChange: setSelectedBucket, options: availableBuckets.map(s => ({ value: s, label: s === 'All' ? 'All' : `Bucket ${s}` })) },
            { id: 'city', label: 'City', value: selectedCity, onChange: setSelectedCity, options: availableCities.map(s => ({ value: s, label: s })) },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={cityData}
        footer={
          <div className="flex items-center border-t border-border bg-accent-dim/30 px-3 py-2.5 font-sans text-xs font-bold">
            <span className="w-[40px]" />
            <span className="flex-1">GRAND TOTAL</span>
            <span className="w-24 text-right text-primary">{fmtCur(grandTotal.collection)}</span>
            <span className={`w-20 text-right ${pctColor(gPct)}`}>{fmtPct(gPct)}</span>
            <span className="w-20 text-right" />
            <span className="w-20 text-right">{grandTotal.count}</span>
            <span className="w-24 text-right">{fmtCur(grandTotal.totalPOS)}</span>
            <span className="w-20 text-right text-success">{grandTotal.paid}</span>
            <span className="w-28 text-right">{fmtCur(grandTotal.paidPOS)}</span>
            <span className="w-24 text-right">{fmtCur(grandTotal.target)}</span>
          </div>
        }
      />
    </AppLayout>
  );
}
