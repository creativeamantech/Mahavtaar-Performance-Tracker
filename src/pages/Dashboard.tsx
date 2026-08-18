import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { calculateRow } from '../lib/calculations';
import { buildCityPivot } from '../lib/pivots';
import { fmtCur, fmtPct, pctColor } from '../lib/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Shield, RotateCcw, X as XIcon } from 'lucide-react';

export default function Dashboard() {
  const { records, targets } = useData();
  const { user, isExecutive } = useAuth();
  const [showBucketDetails, setShowBucketDetails] = useState(false);

  const filteredRecords = useMemo(() => {
    if (isExecutive() && user) return records.filter(r => r.executive_name === user.name);
    return records;
  }, [records, user, isExecutive]);

  const stats = useMemo(() => {
    let totalCollection = 0, totalPOS = 0, mainPaidCount = 0, mainPaidPOS = 0, rollbackPOS = 0, unpaidCount = 0, totalProvDac = 0;
    const emiDist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    let settlementCount = 0, lastMonthPaidCount = 0;
    const bucketDist: Record<number, number> = {};
    const bucketStats: Record<number, { pos: number, paidPOS: number }> = {};

    filteredRecords.forEach(r => {
      const c = calculateRow(r);
      const bkt = r.bom_bkt;
      const pos = Number(r.principal_outstanding) || 0;
      
      totalCollection += Number(r.dac) || 0;
      totalProvDac += Number(r.provisional_dac) || 0;
      totalPOS += pos;
      
      if (!bucketStats[bkt]) bucketStats[bkt] = { pos: 0, paidPOS: 0 };
      bucketStats[bkt].pos += pos;

      if (c.mainPaid) { 
        mainPaidCount++; 
        mainPaidPOS += c.mainPaidPOS || 0; 
        bucketStats[bkt].paidPOS += c.mainPaidPOS || 0;
      } else {
        unpaidCount++;
      }
      
      rollbackPOS += c.rollbackPOS || 0;
      emiDist[Math.min(c.emiCount, 4)] = (emiDist[Math.min(c.emiCount, 4)] || 0) + 1;
      if (r.settlement_approved_amt) settlementCount++;
      if (r.last_month_paid_flag) lastMonthPaidCount++;
      bucketDist[bkt] = (bucketDist[bkt] || 0) + 1;
    });

    return {
      totalCollection, totalPOS, mainPaidPOS, rollbackPOS, totalProvDac,
      paidPct: totalPOS ? mainPaidPOS / totalPOS : 0,
      mainPaidCount, unpaidCount, total: filteredRecords.length,
      emiDist, settlementCount, lastMonthPaidCount, bucketDist, bucketStats
    };
  }, [filteredRecords]);

  const cityPivot = useMemo(() => buildCityPivot(filteredRecords, targets).slice(0, 10), [filteredRecords, targets]);

  const chartData = cityPivot.map(c => ({ name: c.city, collection: c.collection }));
  const pieData = [
    { name: 'Paid', value: stats.mainPaidCount },
    { name: 'Unpaid', value: stats.unpaidCount },
  ];

  const cityColumns = [
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'collection', label: 'Collection', align: 'right' as const, render: (v: number) => <span className="text-primary">{fmtCur(v)}</span> },
    { key: 'pct', label: '%', align: 'right' as const, render: (v: number) => <span className={pctColor(v)}>{fmtPct(v)}</span> },
    { key: 'count', label: 'Count', align: 'right' as const },
    { key: 'target', label: 'Target', align: 'right' as const, render: (v: number) => (
      v <= 0 ? <StatusBadge variant="paid">✓ Achieved</StatusBadge> : <span className="text-primary">{fmtCur(v)}</span>
    )},
  ];

  if (filteredRecords.length === 0) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <DollarSign className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="font-heading text-xl font-bold">No Data Yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Upload a main data file from the Data Entry page to get started.</p>
          <Link to="/data-entry" className="mt-4 rounded-md bg-primary px-4 py-2 font-heading text-xs font-bold text-primary-foreground">
            Go to Data Entry
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-heading text-xl font-extrabold uppercase tracking-wide">Dashboard</h1>
        <p className="font-data text-xs text-muted-foreground">{stats.total} records loaded</p>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Collection" value={fmtCur(stats.totalCollection)} subLabel={`${stats.mainPaidCount} paid accounts`} accentColor="primary" icon={<DollarSign className="h-3.5 w-3.5 text-primary" />} />
        <StatCard label="Main Paid %" value={fmtPct(stats.paidPct)} subLabel={`${stats.mainPaidCount} / ${stats.total} accounts`} accentColor="success" icon={<TrendingUp className="h-3.5 w-3.5 text-success" />} />
        <div onClick={() => setShowBucketDetails(true)} className="cursor-pointer transition-transform hover:scale-[1.02]">
          <StatCard label="Total POS" value={fmtCur(stats.totalPOS)} subLabel="Click for Bucket Breakdown" accentColor="info" icon={<Shield className="h-3.5 w-3.5 text-info" />} />
        </div>
        <StatCard label="Rollback POS" value={fmtCur(stats.rollbackPOS)} accentColor="destructive" icon={<RotateCcw className="h-3.5 w-3.5 text-destructive" />} />
        <StatCard label="Provisional DAC" value={fmtCur(stats.totalProvDac)} subLabel="Unconfirmed" accentColor="destructive" icon={<DollarSign className="h-3.5 w-3.5 text-destructive" />} />
      </div>

      {/* Bucket Details Modal */}
      {showBucketDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Bucket POS Breakdown</h2>
              <button onClick={() => setShowBucketDetails(false)} className="rounded-md p-1 text-muted-foreground hover:bg-bg-hover hover:text-foreground">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full font-data text-xs">
                <thead>
                  <tr className="border-b border-border bg-accent-dim/30">
                    <th className="px-3 py-2 text-left">Bucket</th>
                    <th className="px-3 py-2 text-right">Total POS</th>
                    <th className="px-3 py-2 text-right">Paid POS</th>
                    <th className="px-3 py-2 text-right">% Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.bucketStats).sort(([a], [b]) => Number(a) - Number(b)).map(([bkt, { pos, paidPOS }]) => {
                    const pct = pos ? paidPOS / pos : 0;
                    return (
                      <tr key={bkt} className="border-b border-border hover:bg-bg-hover">
                        <td className="px-3 py-2 font-bold text-primary">B{bkt}</td>
                        <td className="px-3 py-2 text-right">{fmtCur(pos)}</td>
                        <td className="px-3 py-2 text-right">{fmtCur(paidPOS)}</td>
                        <td className={`px-3 py-2 text-right ${pctColor(pct)}`}>{fmtPct(pct)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="col-span-3 rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider">Collection by City</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fill: 'hsl(215,16%,47%)', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(214,32%,91%)', fontSize: 10, fontFamily: 'DM Mono' }} width={80} />
              <Tooltip formatter={(v: number) => fmtCur(v)} contentStyle={{ background: 'hsl(220,33%,10%)', border: '1px solid hsl(213,30%,18%)', borderRadius: 6, fontSize: 11 }} />
              <Bar dataKey="collection" fill="hsl(38,92%,50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-2 rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider">Paid vs Unpaid</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                <Cell fill="hsl(160,84%,39%)" />
                <Cell fill="hsl(0,84%,60%)" />
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(220,33%,10%)', border: '1px solid hsl(213,30%,18%)', borderRadius: 6, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Paid ({stats.mainPaidCount})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Unpaid ({stats.unpaidCount})</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">EMI Count Distribution</h4>
          <div className="flex gap-2">
            {Object.entries(stats.emiDist).map(([k, v]) => (
              <div key={k} className="text-center">
                <div className={`font-heading text-lg font-bold ${Number(k) === 0 ? 'text-destructive' : Number(k) === 1 ? 'text-primary' : 'text-success'}`}>{v}</div>
                <div className="font-data text-[10px] text-muted-foreground">EMI {k}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">Settlement Cases</h4>
          <div className="font-heading text-2xl font-bold text-primary">{stats.settlementCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">Last Month Paid</h4>
          <div className="font-heading text-2xl font-bold text-success">{stats.lastMonthPaidCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">Bucket Distribution</h4>
          <div className="flex gap-2">
            {Object.entries(stats.bucketDist).sort(([a], [b]) => Number(a) - Number(b)).map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="font-heading text-lg font-bold text-primary">{v}</div>
                <div className="font-data text-[10px] text-muted-foreground">B{k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City Snapshot */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider">City Snapshot</h3>
          <Link to="/city-pivot" className="font-data text-xs text-primary hover:underline">View Full Report →</Link>
        </div>
        <DataTable columns={cityColumns} data={cityPivot} pageSize={10} />
      </div>
    </AppLayout>
  );
}
