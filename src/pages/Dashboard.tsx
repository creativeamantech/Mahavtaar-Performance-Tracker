import { useState } from 'react';
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
  UploadCloud, PieChart as PieChartIcon, Target, XIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Label
} from 'recharts';

export default function Dashboard() {
  const { records, targets } = useData();
  const [showBucketDetails, setShowBucketDetails] = useState(false);

  // Default state for empty data
  if (!records || records.length === 0) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <UploadCloud className="h-10 w-10 text-primary opacity-80" />
          </div>
          <h2 className="mb-2 font-heading text-2xl font-bold text-foreground">No Data Available</h2>
          <p className="mb-8 max-w-md font-data text-sm text-muted-foreground leading-relaxed">
            Upload your Main Allocation file to initialize the dashboard and begin tracking performance.
          </p>
          <Link
            to="/data-entry"
            className="rounded-md bg-primary px-6 py-2.5 font-heading text-sm font-bold text-primary-foreground shadow-[0_4px_14px_rgba(245,158,11,0.2)] transition-transform hover:scale-105"
          >
            Go to Data Entry
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Pre-calculate stats
  const stats = records.reduce((acc, row) => {
    const c = calculateRow(row);
    const bkt = row.bom_bkt || 'UNKNOWN';
    const emi = c.emiCount;

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
    acc.totalProvDac += (Number(row.provisional_dac) || 0);
    acc.bucketDist[bkt] = (acc.bucketDist[bkt] || 0) + 1;
    acc.emiDist[emi] = (acc.emiDist[emi] || 0) + 1;

    if (!acc.bucketStats[bkt]) acc.bucketStats[bkt] = { pos: 0, paidPOS: 0 };
    acc.bucketStats[bkt].pos += pos;
    if (c.mainPaid === 1) acc.bucketStats[bkt].paidPOS += c.mainPaidPOS || 0;

    if (c.isSettlement) acc.settlementCount += 1;
    if (c.lastMonthPaid) acc.lastMonthPaidCount += 1;

    return acc;
  }, {
    total: 0, totalCollection: 0, totalPOS: 0,
    mainPaidCount: 0, unpaidCount: 0, paidPOS: 0,
    rollbackPOS: 0, totalProvDac: 0,
    bucketDist: {} as Record<string, number>,
    emiDist: {} as Record<string, number>,
    bucketStats: {} as Record<string, { pos: number, paidPOS: number }>,
    settlementCount: 0, lastMonthPaidCount: 0
  });

  stats.paidPct = stats.totalPOS ? stats.paidPOS / stats.totalPOS : 0;

  const cityPivot = buildCityPivot(records, targets).slice(0, 10);
  const chartData = cityPivot.map(c => ({ name: c.city, collection: c.collection }));

  const pieData = [
    { name: 'Paid', value: stats.mainPaidCount },
    { name: 'Unpaid', value: stats.unpaidCount },
  ];

  const cityColumns = [
    { key: 'city', label: 'City' },
    { key: 'collection', label: 'Collection', align: 'right' as const, render: (v: number) => <span className="text-primary font-bold">{fmtCur(v)}</span> },
    { key: 'totalPOS', label: 'Total POS', align: 'right' as const, render: (v: number) => fmtCur(v) },
    { key: 'paid', label: 'Paid Acc', align: 'right' as const, render: (v: number) => <span className="text-success">{v}</span> },
    { key: 'target', label: 'Needed POS', align: 'right' as const, render: (v: number) => v <= 0 ? <span className="text-success text-[10px] uppercase font-bold">Achieved</span> : fmtCur(v) },
    { key: 'pct', label: 'Achieved %', align: 'right' as const, render: (v: number, row: any) => {
      const isAchieved = row.target <= 0;
      const pctValue = Math.min(v * 100, 100);
      const barColor = isAchieved ? 'bg-success' : 'bg-primary';
      
      return (
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pctValue}%` }} />
          </div>
          <span className={`w-12 font-bold ${pctColor(v)}`}>{fmtPct(v)}</span>
        </div>
      );
    }}
  ];

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-extrabold uppercase tracking-wide text-foreground">Dashboard</h1>
          <p className="font-data text-xs text-muted-foreground mt-1">{stats.total} total records loaded</p>
        </div>
      </div>

      {/* Row 1: Hero Metric */}
      <div className="mb-6">
        <HeroMetric 
          pct={stats.paidPct} 
          label="Overall POS Recovery" 
          subLabel={`${fmtCur(stats.paidPOS)} recovered out of ${fmtCur(stats.totalPOS)}`} 
        />
      </div>

      {/* Row 2: Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Collection" value={fmtCur(stats.totalCollection)} subLabel={`${stats.mainPaidCount} paid accounts`} accentColor="primary" icon={<DollarSign className="h-3.5 w-3.5 text-primary" />} trend={[100, 150, 120, 200, 180, 250]} />
        <StatCard label="Main Paid %" value={fmtPct(stats.paidPct)} subLabel={`${stats.mainPaidCount} / ${stats.total} accounts`} accentColor="success" icon={<TrendingUp className="h-3.5 w-3.5 text-success" />} trend={[10, 15, 20, 18, 25, 30]} />
        <div onClick={() => setShowBucketDetails(true)} className="cursor-pointer">
          <StatCard label="Total POS" value={fmtCur(stats.totalPOS)} subLabel="Click for Breakdown" accentColor="info" icon={<Shield className="h-3.5 w-3.5 text-info" />} />
        </div>
        <StatCard label="Rollback POS" value={fmtCur(stats.rollbackPOS)} accentColor="destructive" icon={<RotateCcw className="h-3.5 w-3.5 text-destructive" />} trend={[50, 45, 60, 40, 30, 20]} />
        <StatCard label="Provisional DAC" value={fmtCur(stats.totalProvDac)} subLabel="Unconfirmed" accentColor="destructive" icon={<PieChartIcon className="h-3.5 w-3.5 text-destructive" />} />
      </div>

      {/* Row 3: Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="col-span-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
          <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">Top 10 Cities Collection</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 10 }}>
              <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fill: 'hsl(215,16%,47%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(214,32%,91%)', fontSize: 10, fontFamily: 'DM Mono' }} width={80} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => fmtCur(v)} contentStyle={{ background: '#050D1A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, fontSize: 11, color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="collection" fill="hsl(38,92%,50%)" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
          <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">Paid vs Unpaid</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} dataKey="value" stroke="none">
                <Cell fill="hsl(160,84%,39%)" />
                <Cell fill="hsl(0,84%,60%)" />
                <Label 
                  value={`${((stats.mainPaidCount / stats.total) * 100).toFixed(1)}%`} 
                  position="center" 
                  fill="#fff" 
                  style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Syne' }}
                />
              </Pie>
              <Tooltip contentStyle={{ background: '#050D1A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, fontSize: 11, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 text-xs mt-2">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Paid ({stats.mainPaidCount})</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> Unpaid ({stats.unpaidCount})</span>
          </div>
        </div>
      </div>

      {/* Row 4: Quick Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 flex items-center justify-between">
          <div>
            <h4 className="mb-1 font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">Settlement Cases</h4>
            <div className="font-heading text-2xl font-bold text-primary">{stats.settlementCount}</div>
          </div>
          <Target className="h-8 w-8 text-primary/20" />
        </div>
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 flex items-center justify-between">
          <div>
            <h4 className="mb-1 font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">Last Month Paid</h4>
            <div className="font-heading text-2xl font-bold text-success">{stats.lastMonthPaidCount}</div>
          </div>
          <RotateCcw className="h-8 w-8 text-success/20" />
        </div>
        <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 col-span-2">
          <h4 className="mb-2 font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">EMI Count Dist.</h4>
          <div className="flex gap-4">
            {Object.entries(stats.emiDist).map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <span className={`font-heading text-lg font-bold ${Number(k) === 0 ? 'text-destructive' : Number(k) === 1 ? 'text-primary' : 'text-success'}`}>{v}</span>
                <span className="font-data text-[10px] text-muted-foreground">EMI {k}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 5: City Snapshot */}
      <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">City Snapshot (Top 10)</h3>
          <Link to="/city-pivot" className="rounded bg-[rgba(255,255,255,0.04)] px-3 py-1 font-data text-xs text-primary transition-colors hover:bg-[rgba(255,255,255,0.08)]">View Full Report →</Link>
        </div>
        <DataTable columns={cityColumns} data={cityPivot} pageSize={10} />
      </div>

      {/* Bucket Details Modal */}
      {showBucketDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050D1A]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#050D1A] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-info to-transparent" />
            <div className="mb-4 flex items-center justify-between mt-2">
              <h2 className="font-heading text-lg font-bold">Bucket POS Breakdown</h2>
              <button onClick={() => setShowBucketDetails(false)} className="rounded-md p-1 text-muted-foreground hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-hidden rounded-md border border-[rgba(255,255,255,0.06)]">
              <table className="w-full font-data text-xs">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium">Bucket</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">Total POS</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">Paid POS</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">% Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.bucketStats).sort(([a], [b]) => Number(a) - Number(b)).map(([bkt, { pos, paidPOS }]) => {
                    const pct = pos ? paidPOS / pos : 0;
                    return (
                      <tr key={bkt} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                        <td className="px-3 py-2 font-bold text-info">B{bkt}</td>
                        <td className="px-3 py-2 text-right">{fmtCur(pos)}</td>
                        <td className="px-3 py-2 text-right">{fmtCur(paidPOS)}</td>
                        <td className={`px-3 py-2 text-right ${pctColor(pct)} font-bold`}>{fmtPct(pct)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
