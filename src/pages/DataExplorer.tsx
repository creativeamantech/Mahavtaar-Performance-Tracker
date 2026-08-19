import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { calculateRow } from '../lib/calculations';
import { fmtCur } from '../lib/formatters';
import { Filter, Database } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { ResponsiveFilter } from '../components/ui/ResponsiveFilter';

export default function DataExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { records, isLoading } = useData();
  const { user, isExecutive } = useAuth();
  
  // Filter States
  const [selectedState, setSelectedState] = useState<string>(searchParams.get('state') || 'All');
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || 'All');
  const [selectedBucket, setSelectedBucket] = useState<string>(searchParams.get('bucket') || 'All');
  const [selectedExecutive, setSelectedExecutive] = useState<string>(searchParams.get('executive') || 'All');
  const [selectedPaidStatus, setSelectedPaidStatus] = useState<string>(searchParams.get('paid') || 'All'); // All, Paid, Unpaid
  
  
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 500;

  useEffect(() => {
    // Update URL when filters change to allow sharing links
    const params = new URLSearchParams();
    if (selectedState !== 'All') params.set('state', selectedState);
    if (selectedCity !== 'All') params.set('city', selectedCity);
    if (selectedBucket !== 'All') params.set('bucket', selectedBucket);
    if (selectedExecutive !== 'All') params.set('executive', selectedExecutive);
    if (selectedPaidStatus !== 'All') params.set('paid', selectedPaidStatus);
    setSearchParams(params, { replace: true });
    setPage(1); // Reset page on filter change
  }, [selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus, setSearchParams]);

  const baseRecords = useMemo(() => {
    if (isExecutive() && user) return records.filter((r: any) => r.executive_name === user.name);
    return records;
  }, [records, user, isExecutive]);

  // Derived options for filters
  const availableStates = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.state || r.State || 'UNKNOWN').trim().toUpperCase()).filter(Boolean))).sort()], [baseRecords]);
  const availableCities = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.city || r.City || 'UNKNOWN').trim().toUpperCase()).filter(Boolean))).sort()], [baseRecords]);
  const availableBuckets = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.bom_bkt || 'UNKNOWN').trim()).filter(Boolean))).sort((a,b) => Number(a) - Number(b))], [baseRecords]);
  const availableExecutives = useMemo(() => ['All', ...Array.from(new Set(baseRecords.map((r: any) => String(r.executive_name || r['Executive Name'] || 'UNKNOWN').trim()).filter(Boolean))).sort()], [baseRecords]);
  
  // Computed Records
  const filteredRecords = useMemo(() => {
    return baseRecords.filter((r: any) => {
      if (selectedState !== 'All' && String(r.state || r.State || 'UNKNOWN').trim().toUpperCase() !== selectedState) return false;
      if (selectedCity !== 'All' && String(r.city || r.City || 'UNKNOWN').trim().toUpperCase() !== selectedCity) return false;
      if (selectedBucket !== 'All' && String(r.bom_bkt || 'UNKNOWN').trim() !== selectedBucket) return false;
      if (selectedExecutive !== 'All' && String(r.executive_name || r['Executive Name'] || 'UNKNOWN').trim() !== selectedExecutive) return false;
      
      const c = calculateRow(r);
      const isPaid = c.mainPaid === 1;
      
      if (selectedPaidStatus === 'Paid' && !isPaid) return false;
      if (selectedPaidStatus === 'Unpaid' && isPaid) return false;
      
      return true;
    });
  }, [baseRecords, selectedState, selectedCity, selectedBucket, selectedExecutive, selectedPaidStatus]);

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredRecords, page]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-10 w-48 bg-muted rounded-md mb-4" />
          <div className="h-20 w-full bg-card border border-border rounded-xl" />
          <div className="h-[500px] w-full bg-card border border-border rounded-xl" />
        </div>
      
      

    </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-xl font-extrabold uppercase tracking-wide flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" /> Data Explorer
          </h1>
          <p className="font-sans text-xs text-muted-foreground mt-1">Raw record inspection and drill-down analysis</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm">
          {filteredRecords.length} Records Found
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-4 mb-6">
        <ResponsiveFilter
          filters={[
            { id: 'paid', label: 'Paid Status', value: selectedPaidStatus, onChange: setSelectedPaidStatus, options: [{value: 'All', label: 'All Cases'}, {value: 'Paid', label: 'Main Paid Only'}, {value: 'Unpaid', label: 'Unpaid Only'}] },
            { id: 'bkt', label: 'Bucket', value: selectedBucket, onChange: setSelectedBucket, options: availableBuckets.map(s => ({ value: s, label: s === 'All' ? 'All' : `Bucket ${s}` })) },
            { id: 'state', label: 'State', value: selectedState, onChange: setSelectedState, options: availableStates.map(s => ({ value: s, label: s })) },
            { id: 'city', label: 'City', value: selectedCity, onChange: setSelectedCity, options: availableCities.map(s => ({ value: s, label: s })) },
            { id: 'exec', label: 'Executive', value: selectedExecutive, onChange: setSelectedExecutive, options: availableExecutives.map(s => ({ value: s, label: s })) },
          ]}
        />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="p-3 font-sans text-xs text-muted-foreground font-semibold">Aggr No</th>
                <th className="p-3 font-sans text-xs text-muted-foreground font-semibold">Name</th>
                <th className="p-3 font-sans text-xs text-muted-foreground font-semibold">Bucket</th>
                <th className="p-3 font-sans text-xs text-muted-foreground font-semibold">City</th>
                <th className="p-3 font-sans text-xs text-muted-foreground font-semibold">Executive</th>
                <th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">POS</th>
                <th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">DAC</th>
                <th className="p-3 font-sans text-xs text-muted-foreground font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="font-data text-sm">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="h-8 w-8 mb-2 opacity-50" />
                      <p>No records match your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r: any, idx: number) => {
                  const c = calculateRow(r);
                  const isPaid = c.mainPaid === 1;
                  return (
                    <tr key={r.id || idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-primary font-medium cursor-pointer hover:underline" onClick={() => setSelectedRecord(r)}>{r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-'}</td>
                      <td className="p-3 text-primary cursor-pointer hover:underline font-medium" onClick={() => setSelectedRecord(r)}>{r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || r.customername || '-'}</td>
                      <td className="p-3 text-foreground">{r.bom_bkt}</td>
                      <td className="p-3 text-foreground">{r.city || r.City || '-'}</td>
                      <td className="p-3 text-foreground">{r.executive_name || r['Executive Name'] || '-'}</td>
                      <td className="p-3 text-right text-foreground font-medium">{fmtCur(Number(r.principal_outstanding) || 0)}</td>
                      <td className="p-3 text-right text-foreground font-medium">{fmtCur(Number(r.dac ?? r.DAC) || 0)}</td>
                      <td className="p-3 text-right">
                        
                        {isPaid ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-success/15 text-success px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Main Paid</span>
                            <div className="flex items-center gap-1.5 w-24">
                              <div className="h-1.5 flex-1 bg-success/20 rounded-full overflow-hidden">
                                <div className="h-full bg-success rounded-full" style={{ width: `${Math.min((Number(r.dac ?? r.DAC) || 0) / (Number(r.principal_outstanding) || 1) * 100, 100)}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-success">{Math.min(Math.round(((Number(r.dac ?? r.DAC) || 0) / (Number(r.principal_outstanding) || 1)) * 100), 100)}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-destructive/15 text-destructive px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Unpaid</span>
                            {(Number(r.dac ?? r.DAC) || 0) > 0 && (
                               <span className="text-[10px] text-muted-foreground font-semibold">Partial DAC</span>
                            )}
                          </div>
                        )}

                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <span className="text-xs text-muted-foreground font-sans">
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredRecords.length)} of {filteredRecords.length}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-background border border-border rounded text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                Prev
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-background border border-border rounded text-sm disabled:opacity-50 hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    <Sheet open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl overflow-hidden flex flex-col p-0">
          {selectedRecord && (() => {
            const c = calculateRow(selectedRecord);
            const isPaid = c.mainPaid === 1;
            return (
              <>
                <SheetHeader className="p-6 pb-4 border-b border-border bg-muted/20">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <SheetTitle className="text-2xl font-bold tracking-tight mb-1 text-foreground">
                        {selectedRecord.customer_name || selectedRecord.CUSTOMERNAME || selectedRecord['Customer Name'] || selectedRecord.CUSTOMER_NAME || selectedRecord.customername || '-'}
                      </SheetTitle>
                      <SheetDescription className="text-base text-muted-foreground font-medium">
                        {selectedRecord.agreementid || selectedRecord.agreement_no || selectedRecord.AGREEMENTNO || selectedRecord.AGREEMENTID || '-'}
                      </SheetDescription>
                    </div>
                    {isPaid ? (
                       <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90 uppercase font-bold tracking-wider px-3 py-1 text-xs">
                         Main Paid
                       </Badge>
                    ) : (
                       <Badge variant="outline" className="text-muted-foreground uppercase font-bold tracking-wider px-3 py-1 text-xs">
                         Unpaid
                       </Badge>
                    )}
                  </div>
                </SheetHeader>
                <ScrollArea className="flex-1 p-6">
                  <div className="grid gap-6">
                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Principal Outstanding</div>
                        <div className="text-2xl font-bold text-foreground">{fmtCur(Number(selectedRecord.principal_outstanding) || 0)}</div>
                      </div>
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground mb-1">DAC Amount</div>
                        <div className="text-2xl font-bold text-foreground">{fmtCur(Number(selectedRecord.dac ?? selectedRecord.DAC) || 0)}</div>
                      </div>
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground mb-1">EMI Amount</div>
                        <div className="text-xl font-semibold text-foreground">{fmtCur(Number(selectedRecord.emi_amt) || 0)}</div>
                      </div>
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground mb-1">New Total</div>
                        <div className="text-xl font-semibold text-foreground">{fmtCur(Number(selectedRecord.new_total) || 0)}</div>
                      </div>
                    </div>

                    {/* All Raw Data */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-foreground flex items-center gap-2">
                        <Database className="w-5 h-5 text-muted-foreground" />
                        Full Record Details
                      </h4>
                      <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <tbody className="divide-y divide-border">
                            {Object.entries(selectedRecord).filter(([k,v]) => v !== null && v !== undefined && v !== '').map(([key, value]) => (
                              <tr key={key} className="hover:bg-muted/50 transition-colors">
                                <th className="p-3 font-medium text-muted-foreground w-1/3 align-top break-words">
                                  {key}
                                </th>
                                <td className="p-3 text-foreground font-mono text-xs break-words">
                                  {String(value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
