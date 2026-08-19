import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { AppLayout } from '../components/layout/AppLayout';
import { useMediaQuery } from '../hooks/use-media-query';
import { calculateRow } from '../lib/calculations';
import { buildCityPivot } from '../lib/pivots';
import { buildTargetKey } from '../lib/targets';
import { fmtCur, fmtPct } from '../lib/formatters';
import { DollarSign, TrendingUp, Filter, Target, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { records, targets, isLoading } = useData();
  const { globalBucket } = useData();
  


  const filteredRecords = useMemo(() => {
    if (!records) return [];
    if (globalBucket === 'ALL') return records;
    return records.filter((r: any) => String(r.bom_bkt).trim().toUpperCase() === globalBucket);
  }, [records, globalBucket]);

  const stats = useMemo(() => {
    return filteredRecords.reduce((acc, row) => {
      const c = calculateRow(row);
      acc.total += 1;
      if (c.mainPaid === 1) { acc.totalCollection += (Number(row.dac ?? row.DAC) || 0); }
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
            <div className="h-6 w-32 rounded bg-muted"></div>
            <div className="h-10 w-40 rounded-md bg-muted"></div>
          </div>
          <div className="mb-6 h-[100px] rounded-xl bg-card border border-border shadow-sm"></div>
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
          <h2 className="mb-2 font-heading text-2xl font-bold text-foreground">No Data Available</h2>
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
  
  // No rollback
  const neededPOS = Math.max(0, totalTargetPOS - stats.paidPOS);
  const targetAchievedPct = totalTargetPOS > 0 ? Math.min(stats.paidPOS / totalTargetPOS, 1) : (stats.paidPOS > 0 ? 1 : 0);
  const actualPct = stats.totalPOS > 0 ? stats.paidPOS / stats.totalPOS : 0;

  const topCitiesByCount = [...cityPivot].sort((a, b) => b.count - a.count).slice(0, 10);
  const chartData = topCitiesByCount.map(c => ({ name: c.city, count: c.count, collection: c.collection }));

  const pieData = [
    { name: 'Paid', value: stats.mainPaidCount },
    { name: 'Unpaid', value: stats.unpaidCount },
  ];

  return (
    <AppLayout>


      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
            <Filter className="h-8 w-8" />
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">No data available for this bucket</h3>
          <p className="mt-1 text-sm text-muted-foreground">Select a different bucket to view performance metrics.</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {/* KPI 1 - Recovery % */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recovery Rate</h3>
                <span className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {fmtPct(actualPct)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-auto">
                <span className="font-heading text-4xl font-bold text-foreground">{(actualPct * 100).toFixed(1)}</span>
                <span className="font-sans text-lg font-semibold text-muted-foreground">%</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-4">
                <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(actualPct * 100, 100)}%` }}></div>
              </div>
            </div>

            {/* KPI 2 - Recovered POS */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid POS</h3>
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              <div className="flex flex-col mt-auto">
                <span className="font-heading text-2xl lg:text-3xl font-bold text-success">{fmtCur(stats.paidPOS)}</span>
                <p className="font-sans text-xs text-muted-foreground mt-1">Total POS of Main Paid cases</p>
              </div>
            </div>

            {/* KPI 3 - Needed POS */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Needed POS</h3>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col mt-auto">
                <span className="font-heading text-2xl lg:text-3xl font-bold text-foreground">{fmtCur(neededPOS)}</span>
                <p className="font-sans text-xs text-muted-foreground mt-1">To reach target</p>
              </div>
            </div>

            {/* KPI 4 - Total Collection */}
            <div className="bg-primary border border-primary/20 rounded-xl p-5 flex flex-col justify-between shadow-md text-primary-foreground hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-sans text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider">Total Collection</h3>
                <DollarSign className="h-5 w-5 text-primary-foreground/80" />
              </div>
              <div className="flex flex-col mt-auto">
                <span className="font-heading text-2xl lg:text-3xl font-bold">{fmtCur(stats.totalCollection)}</span>
                <p className="font-sans text-xs text-primary-foreground/80 mt-1">DAC from Main Paid cases</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading text-lg font-bold text-foreground">Paid vs Unpaid</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
                <div className="w-40 h-40 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell key="cell-0" fill="hsl(var(--primary))" />
                        <Cell key="cell-1" fill="hsl(var(--muted-foreground))" opacity={0.2} />
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, 'Cases']} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-heading text-2xl font-bold text-foreground">{((stats.mainPaidCount / stats.total) * 100).toFixed(0)}%</span>
                    <span className="font-sans text-xs text-muted-foreground">Paid</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-foreground">Paid Cases</span>
                  </div>
                  <span className="font-semibold text-foreground">{stats.mainPaidCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-muted-foreground/30"></span>
                    <span className="text-muted-foreground">Unpaid Cases</span>
                  </div>
                  <span className="font-semibold text-muted-foreground">{stats.unpaidCount}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 sm:p-5 border-b border-border flex justify-between items-center bg-muted/10">
                <h3 className="font-heading text-lg font-bold text-foreground">Top 10 City Snapshot</h3>
                <Link to="/city-pivot" className="font-sans text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  View All &rarr;
                </Link>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="p-3 font-sans text-xs text-muted-foreground font-semibold">City Name</th>
                      <th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">Cases</th>
                      <th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">Paid Cases</th>
                      <th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">Sum of %</th>
                      <th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">Needed</th>
                      <th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">Collection</th>
                    </tr>
                  </thead>
                  <tbody className="font-data text-sm">
                    {topCitiesByCount.map((city) => {
                      const posPct = city.pct;
                      return (
                        <tr key={city.city} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="p-3 text-primary font-semibold hover:underline"><Link to={`/explorer?city=${encodeURIComponent(city.city)}`}>{city.city}</Link></td>
                          <td className="p-3 text-right text-foreground">{city.count}</td>
                          <td className="p-3 text-right text-foreground">{city.paid}</td>
                          <td className="p-3 text-right text-foreground font-bold">{fmtPct(posPct)}</td>
                          <td className="p-3 text-right text-warning">{fmtCur(city.target)}</td>
                          <td className="p-3 text-right text-success">{fmtCur(city.collection)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">Collection Volume (Top Cities)</h3>
                <p className="font-sans text-xs text-muted-foreground mt-1">Total collection values by region</p>
              </div>
            </div>
            <div className="w-full h-64 relative overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px', fontWeight: 'bold' }} 
                    formatter={(val: number) => fmtCur(val)} 
                  />
                  <Bar dataKey="collection" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
}
