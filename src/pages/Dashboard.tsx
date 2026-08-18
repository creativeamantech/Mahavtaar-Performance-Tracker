import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
import { HeroMetric } from '../components/ui/HeroMetric';
import { calculateRow } from '../lib/calculations';
import { buildCityPivot } from '../lib/pivots';
import { DataTable } from '../components/ui/DataTable';
import { fmtCur, fmtPct, pctColor } from '../lib/formatters';
import {
  DollarSign, TrendingUp, Shield, RotateCcw,
  UploadCloud, PieChart as PieChartIcon, Target, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Label
} from 'recharts';

export default function Dashboard() {
  const { records, targets, isLoading } = useData();
  const [globalBucket, setGlobalBucket] = useState<string>('ALL');

  
  const availableBuckets = useMemo(() => {
    const bkts = new Set<string>();
    (records || []).forEach((r: any) => {
      if (r.bom_bkt) bkts.add(String(r.bom_bkt).trim().toUpperCase());
    });
    return Array.from(bkts).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    if (globalBucket === 'ALL') return records;
    return records.filter((r: any) => String(r.bom_bkt).trim().toUpperCase() === globalBucket);
  }, [records, globalBucket]);

  const stats = useMemo(() => {
    return filteredRecords.reduce((acc, row) => {
      const c = calculateRow(row);
      acc.total += 1;
      acc.totalCollection += (Number(row.dac ?? row.DAC) || 0);
      const pos = Number(row.principal_outstanding) || 0;
      acc.totalPOS += pos;
      if (c.mainPaid === 1) {
        acc.mainPaidCount += 1;
        acc.paidPOS += c.mainPaidPOS || 0;
      } else {
        acc.unpaidCount += 1;
      }
      acc.rollbackPOS += c.rollbackPOS || 0;
      return acc;
    }, {
      total: 0, totalCollection: 0, totalPOS: 0,
      mainPaidCount: 0, unpaidCount: 0, paidPOS: 0,
      rollbackPOS: 0
    });
  }, [filteredRecords]);

  const { cityPivot, totalTargetPOS } = useMemo(() => {
    const pivot = buildCityPivot(filteredRecords, targets);
    let totalTarget = 0;
    pivot.forEach(c => {
      totalTarget += c.targetPOS;
    });
    return { cityPivot: pivot, totalTargetPOS: totalTarget };
  }, [filteredRecords, targets]);

  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="h-6 w-32 rounded bg-muted"></div>
              <div className="mt-2 h-3 w-24 rounded bg-muted/50"></div>
            </div>
            <div className="h-10 w-40 rounded-md bg-muted"></div>
          </div>
          <div className="mb-6 h-[100px] rounded-xl bg-card border border-border shadow-sm"></div>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-xl bg-card border border-border shadow-sm"></div>
            ))}
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="col-span-3 h-80 rounded-xl bg-card border border-border shadow-sm"></div>
            <div className="col-span-2 h-80 rounded-xl bg-card border border-border shadow-sm"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!records || records.length === 0) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-card border border-border shadow-sm">
            <UploadCloud className="h-10 w-10 text-primary opacity-80" />
          </div>
          <h2 className="mb-2 font-sans text-2xl font-bold text-foreground">No Data Available</h2>
          <p className="mb-8 max-w-md font-sans text-sm text-muted-foreground leading-relaxed">
            Upload your Main Allocation file to initialize the dashboard and begin tracking performance.
          </p>
          <Link
            to="/data-entry"
            className="rounded-md bg-primary px-6 py-2.5 font-sans text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            Go to Data Entry
          </Link>
        </div>
      </AppLayout>
    );
  }

  
  const paidPct = stats.totalPOS ? stats.paidPOS / stats.totalPOS : 0;
  const rollbackPct = stats.totalPOS ? stats.rollbackPOS / stats.totalPOS : 0;
  const neededPOS = Math.max(0, totalTargetPOS - stats.paidPOS);
  const targetAchievedPct = totalTargetPOS > 0 ? Math.min(stats.paidPOS / totalTargetPOS, 1) : (stats.paidPOS > 0 ? 1 : 0);

  const topCitiesByCount = [...cityPivot].sort((a, b) => b.count - a.count).slice(0, 10);
  const chartData = topCitiesByCount.map(c => ({ name: c.city, count: c.count, collection: c.collection }));

  const pieData = [
    { name: 'Paid', value: stats.mainPaidCount },
    { name: 'Unpaid', value: stats.unpaidCount },
  ];

  const cityColumns = [
    { key: 'rank', label: 'Rank', align: 'center' as const, render: (_v: any, _r: any, idx: number) => <span className="font-bold text-muted-foreground">{idx + 1}</span> },
    { key: 'city', label: 'City' },
    { key: 'count', label: 'Total Cases', align: 'right' as const, render: (v: number) => <span className="font-bold text-foreground">{v}</span> },
    { key: 'collection', label: 'Collection', align: 'right' as const, render: (v: number) => <span className="text-primary font-bold">{fmtCur(v)}</span> },
    { key: 'totalPOS', label: 'Total POS', align: 'right' as const, render: (v: number) => fmtCur(v) },
    { key: 'target', label: 'Needed POS', align: 'right' as const, render: (v: number) => v <= 0 ? <span className="text-success text-xs uppercase font-bold">Achieved</span> : <span className="text-warning font-medium">{fmtCur(v)}</span> },
  ];

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-xl font-extrabold uppercase tracking-wide text-foreground">Dashboard</h1>
          <p className="font-sans text-xs text-muted-foreground mt-1">{filteredRecords.length} records in view</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm w-full sm:w-auto overflow-hidden">
          <div className="flex items-center gap-2 px-3 border-r border-border">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filter Bucket</span>
          </div>
          <select 
            value={globalBucket} 
            onChange={(e) => setGlobalBucket(e.target.value)}
            className="h-8 bg-transparent text-sm font-semibold pl-2 pr-8 outline-none cursor-pointer hover:bg-muted/50 rounded flex-1 appearance-none"
          >
            <option value="ALL">ALL BUCKETS</option>
            {availableBuckets.map(b => (
              <option key={b} value={b}>BUCKET {b}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
            <Filter className="h-8 w-8" />
          </div>
          <h3 className="font-sans text-lg font-bold text-foreground">No data available for this bucket</h3>
          <p className="mt-1 text-sm text-muted-foreground">Select a different bucket to view performance metrics.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 - Achieved vs Target */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">Achieved vs Target</h3>
            <Target className="h-4 w-4 text-primary opacity-50" />
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="font-data text-2xl font-bold text-foreground">{fmtPct(targetAchievedPct)}</span>
            <span className="font-heading text-[10px] uppercase font-bold text-success mb-1">Achieved</span>
          </div>
          <div className="space-y-1 mt-2 border-t border-[rgba(255,255,255,0.05)] pt-2">
            <div className="flex justify-between font-data text-[11px]"><span className="text-muted-foreground">Target:</span> <span className="font-medium">{fmtCur(totalTargetPOS)}</span></div>
            <div className="flex justify-between font-data text-[11px]"><span className="text-muted-foreground">Achieved:</span> <span className="font-medium text-success">{fmtCur(stats.paidPOS)}</span></div>
            <div className="flex justify-between font-data text-[11px]"><span className="text-muted-foreground">Gap:</span> <span className="font-medium text-destructive">{fmtCur(neededPOS)}</span></div>
          </div>
        </div>

        {/* KPI 2 - Rollback % */}
        <StatCard label="Rollback %" value={fmtPct(rollbackPct)} subLabel={`${fmtCur(stats.rollbackPOS)} out of ${fmtCur(stats.totalPOS)}`} accentColor="destructive" icon={<RotateCcw className="h-4 w-4" />} />
        
        {/* KPI 3 - Needed POS */}
        <StatCard label="Needed POS" value={fmtCur(neededPOS)} subLabel="Amount required to hit target" accentColor="warning" icon={<Target className="h-4 w-4" />} />
        
        {/* KPI 4 - Paid POS */}
        <StatCard label="Paid POS" value={fmtCur(stats.paidPOS)} subLabel="Total recovered amount" accentColor="success" icon={<DollarSign className="h-4 w-4" />} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="col-span-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Priority Cities (By Case Count)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 10 }}>
              <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fill: 'hsl(215,16%,47%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215,16%,47%)', fontSize: 10, fontFamily: 'Inter' }} width={80} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [fmtCur(v), 'Collection']} contentStyle={{ background: 'white', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12, color: 'black', fontFamily: 'Inter' }} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Bar dataKey="collection" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col">
          <h3 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-muted-foreground">Paid vs Unpaid (Count)</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" stroke="none">
                  <Cell fill="hsl(var(--success))" />
                  <Cell fill="hsl(var(--destructive))" />
                  <Label 
                    value={`${((stats.mainPaidCount / (stats.total || 1)) * 100).toFixed(1)}%`} 
                    position="center" 
                    fill="hsl(var(--foreground))" 
                    style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Inter' }}
                  />
                </Pie>
                <Tooltip contentStyle={{ background: 'white', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12, color: 'black', fontFamily: 'Inter' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs mt-2 font-medium">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Paid ({stats.mainPaidCount})</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> Unpaid ({stats.unpaidCount})</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">Top 10 Priority City Snapshot</h3>
            <p className="text-xs text-muted-foreground mt-1">Ranked by case volume</p>
          </div>
          <Link to="/city-pivot" className="rounded-md border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted">View Full Report →</Link>
        </div>
        <DataTable columns={cityColumns} data={topCitiesByCount} pageSize={10} />
      </div>
        </>
      )}
    </AppLayout>
  );
}
