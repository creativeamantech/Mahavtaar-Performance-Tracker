import { useState, useMemo, useCallback } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { UploadStepper } from '../components/ui/UploadStepper';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateRow } from '../lib/calculations';
import { fmtCur } from '../lib/formatters';
import { toast } from 'sonner';
import { Search, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DataEntry() {
  const { records, loadMainFile, loadPaidFile, loadAdditionalFile, loadCorrectedFile, updateRecord, uploadHistory } = useData();
  const { user, isExecutive } = useAuth();
  const [search, setSearch] = useState('');
  const [bucketFilter, setBucketFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const filteredRecords = useMemo(() => {
    let data = records;
    if (isExecutive() && user) data = data.filter(r => r.executive_name === user.name);
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(r => r.agreementid.toLowerCase().includes(s) || r.city?.toLowerCase().includes(s) || r.executive_name?.toLowerCase().includes(s));
    }
    if (bucketFilter !== 'all') data = data.filter(r => String(r.bom_bkt) === bucketFilter);
    if (paidFilter !== 'all') {
      data = data.filter(r => {
        const c = calculateRow(r);
        return paidFilter === 'paid' ? c.mainPaid : !c.mainPaid;
      });
    }
    if (cityFilter !== 'all') data = data.filter(r => r.city === cityFilter);
    return data;
  }, [records, search, bucketFilter, paidFilter, cityFilter, user, isExecutive]);

  const cities = useMemo(() => [...new Set(records.map(r => r.city))].sort(), [records]);

  const handleMainUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = loadMainFile(e.target!.result as ArrayBuffer, file.name, user?.name || 'Unknown');
        toast.success(`Main data loaded — ${result.rowCount} records`);
      } catch {
        toast.error('Failed to parse file');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [loadMainFile, user]);

  const handlePaidUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = loadPaidFile(e.target!.result as ArrayBuffer, file.name, user?.name || 'Unknown');
        toast.success(`Paid file merged — ${result.matched} records updated`);
      } catch {
        toast.error('Failed to parse paid file');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [loadPaidFile, user]);

  const handleAdditionalUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = loadAdditionalFile(e.target!.result as ArrayBuffer, file.name, user?.name || 'Unknown');
        const s = result.stats;
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-bold">Additional Collection Merged</span>
            <span className="text-xs">Unique Loans: {s.uniqueLoans}</span>
            <span className="text-xs">Valid Provisional Added: {s.newValidProv}</span>
            <span className="text-xs text-destructive">Conflicts Detected: {s.newConflicts}</span>
            <span className="text-xs text-muted-foreground">Already Confirmed: {s.alreadyConfirmed}</span>
            <span className="text-xs text-muted-foreground">Ignored (Corrected): {s.alreadyCorrected}</span>
          </div>,
          { duration: 8000 }
        );
      } catch {
        toast.error('Failed to parse additional file');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [loadAdditionalFile, user]);

  const handleCorrectedUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = loadCorrectedFile(e.target!.result as ArrayBuffer, file.name, user?.name || 'Unknown');
        toast.success(`Corrected DAC merged — ${result.matched} records updated`);
      } catch {
        toast.error('Failed to parse corrected DAC file');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [loadCorrectedFile, user]);

  const handleFieldUpdate = useCallback((agreementid: string, field: string, value: string) => {
    const numVal = parseFloat(value) || 0;
    updateRecord(agreementid, field, numVal, user?.name || 'Unknown');
    toast.success(`Saved ✓`);
  }, [updateRecord, user]);

  const exportConflicts = useCallback(() => {
    const conflicts = records.filter(r => r.is_conflict);
    if (conflicts.length === 0) {
      toast.info('No conflicts to export');
      return;
    }
    const data = conflicts.map(r => ({
      'Loan ID': r.agreementid,
      'Executive Name': r.executive_name,
      'Collection Date': r.provisional_collection_dates || '',
      'Current Confirmed DAC': r.dac || 0,
      'Provisional DAC': r.provisional_dac_raw || 0,
      'Status': 'Conflict - Needs Review'
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Conflicts');
    XLSX.writeFile(wb, `Conflicts_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [records]);

  const lastMain = uploadHistory.find(u => u.type === 'MAIN_DATA');
  const lastPaid = uploadHistory.find(u => u.type === 'PAID_FILE');
  const lastAdditional = uploadHistory.find(u => u.type === 'ADDITIONAL_COLLECTION_FILE');
  const lastCorrected = uploadHistory.find(u => u.type === 'CORRECTED_DAC_FILE');

  const columns = [
    { key: 'agreementid', label: 'Agreement ID', width: '120px', render: (v: string) => <span className="text-muted-foreground">{v}</span> },
    { key: 'bom_bkt', label: 'Bkt', width: '40px', render: (v: number) => <StatusBadge variant="bucket">{v}</StatusBadge> },
    { key: 'executive_name', label: 'Executive', width: '100px' },
    { key: 'city', label: 'City', width: '80px' },
    { key: 'emi_amt', label: 'EMI', align: 'right' as const, render: (v: number) => fmtCur(v) },
    { key: 'principal_outstanding', label: 'POS', align: 'right' as const, render: (v: number) => fmtCur(v) },
    {
      key: 'dac', label: 'DAC', align: 'right' as const, width: '90px',
      render: (_v: number, row: any) => (
        <EditableCell
          value={row.dac}
          source={row.dac_source}
          onSave={(val) => handleFieldUpdate(row.agreementid, 'dac', val)}
        />
      ),
    },
    {
      key: 'provisional_dac', label: 'Prov DAC', align: 'right' as const, width: '90px',
      render: (_v: number, row: any) => {
        if (!row.provisional_dac && !row.is_conflict) return <span className="text-muted-foreground">-</span>;
        return (
          <span className={`inline-flex items-center gap-1 rounded bg-muted/50 px-1.5 py-0.5 text-right font-data text-xs ${row.is_conflict ? 'text-destructive font-bold' : 'text-info'}`}>
            {fmtCur(row.provisional_dac_raw || row.provisional_dac)}
            {row.is_conflict && <span title={`Conflict with Confirmed DAC (${fmtCur(row.dac)})`}>⚠️</span>}
          </span>
        );
      }
    },
    {
      key: 'ecs', label: 'ECS', align: 'right' as const, width: '90px',
      render: (_v: number, row: any) => (
        <EditableCell
          value={row.ecs}
          source={row.ecs_source}
          onSave={(val) => handleFieldUpdate(row.agreementid, 'ecs', val)}
        />
      ),
    },
    {
      key: 'special', label: 'Special', align: 'right' as const, width: '90px',
      render: (_v: number, row: any) => (
        <EditableCell
          value={row.special}
          source={row.special_source}
          onSave={(val) => handleFieldUpdate(row.agreementid, 'special', val)}
        />
      ),
    },
    {
      key: '_total', label: 'Total', align: 'right' as const, sortable: false,
      render: (_: any, row: any) => {
        const c = calculateRow(row);
        return <span className={c.total > 0 ? 'text-success' : 'text-muted-foreground'}>{fmtCur(c.total)}</span>;
      },
    },
    {
      key: '_emiCount', label: 'EMI#', align: 'center' as const, sortable: false,
      render: (_: any, row: any) => {
        const c = calculateRow(row);
        const variant = c.emiCount === 0 ? 'unpaid' : c.emiCount === 1 ? 'bucket' : 'paid';
        return <StatusBadge variant={variant}>{c.emiCount}</StatusBadge>;
      },
    },
    {
      key: '_mainPaid', label: 'Status', sortable: false,
      render: (_: any, row: any) => {
        const c = calculateRow(row);
        return <StatusBadge variant={c.mainPaid ? 'paid' : 'unpaid'}>{c.mainPaid ? 'PAID' : 'UNPAID'}</StatusBadge>;
      },
    },
  ];

  const hasConflicts = records.some(r => r.is_conflict);

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-extrabold uppercase tracking-wide">Data Entry</h1>
          <p className="font-data text-xs text-muted-foreground">Upload files & manage payment data</p>
        </div>
        {hasConflicts && (
          <button onClick={exportConflicts} className="flex h-9 items-center gap-2 rounded-md bg-destructive px-4 font-heading text-xs font-bold text-destructive-foreground hover:bg-destructive/90">
            <Download className="h-3.5 w-3.5" /> Export Conflicts
          </button>
        )}
      </div>

      {/* Upload Workflow */}
      <UploadStepper steps={[
        {
          id: 'step-1',
          title: 'Main Data File',
          optional: false,
          status: lastMain ? 'done' : 'pending',
          lastUpload: lastMain?.fileName,
          onFileSelect: handleMainUpload
        },
        {
          id: 'step-2',
          title: 'Paid File',
          optional: false,
          status: lastPaid ? 'done' : 'pending',
          lastUpload: lastPaid?.fileName,
          onFileSelect: handlePaidUpload
        },
        {
          id: 'step-3',
          title: 'Additional Collection',
          optional: true,
          status: lastAdditional ? 'done' : 'pending',
          lastUpload: lastAdditional?.fileName,
          onFileSelect: handleAdditionalUpload
        },
        {
          id: 'step-4',
          title: 'Corrected DAC',
          optional: true,
          status: lastCorrected ? 'done' : 'pending',
          lastUpload: lastCorrected?.fileName,
          onFileSelect: handleCorrectedUpload
        }
      ]} />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ID, city, executive..."
            className="h-8 w-56 rounded-md border border-border bg-input pl-7 pr-3 font-data text-xs outline-none focus:border-primary"
          />
        </div>
        <select value={bucketFilter} onChange={e => setBucketFilter(e.target.value)} className="h-8 rounded-md border border-border bg-input px-2 font-data text-xs outline-none focus:border-primary">
          <option value="all">All Buckets</option>
          {[1, 2, 3, 4, 5].map(b => <option key={b} value={b}>Bucket {b}</option>)}
        </select>
        <select value={paidFilter} onChange={e => setPaidFilter(e.target.value)} className="h-8 rounded-md border border-border bg-input px-2 font-data text-xs outline-none focus:border-primary">
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="h-8 rounded-md border border-border bg-input px-2 font-data text-xs outline-none focus:border-primary">
          <option value="all">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || bucketFilter !== 'all' || paidFilter !== 'all' || cityFilter !== 'all') && (
          <button onClick={() => { setSearch(''); setBucketFilter('all'); setPaidFilter('all'); setCityFilter('all'); }}
            className="flex h-8 items-center gap-1 rounded-md border border-border px-2 font-data text-xs text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" /> Reset
          </button>
        )}
        <span className="ml-auto font-data text-xs text-muted-foreground">
          Showing {filteredRecords.length} of {records.length} records
        </span>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredRecords}
        rowClassName={(row: any) => {
          const c = calculateRow(row);
          if (row.is_conflict) return 'border-l-2 border-l-destructive bg-destructive/5';
          return c.mainPaid ? 'border-l-2 border-l-success' : 'border-l-2 border-border';
        }}
      />
    </AppLayout>
  );
}

function EditableCell({ value, source, onSave }: { value: number; source?: string; onSave: (val: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value || 0));

  const borderClass = source === 'MANUAL' ? 'border-primary' : source === 'PAID_FILE' ? 'border-success' : source === 'CORRECTED' ? 'border-info' : 'border-border';
  const icon = source === 'MANUAL' ? '🔒' : source === 'PAID_FILE' ? '📁' : source === 'CORRECTED' ? '✓' : '';

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { setEditing(false); onSave(val); }}
        onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onSave(val); } }}
        className={`h-6 w-20 rounded border ${borderClass} bg-input px-1 text-right font-data text-xs outline-none focus:border-primary`}
      />
    );
  }
  return (
    <span onClick={() => setEditing(true)} className={`inline-flex cursor-pointer items-center gap-0.5 rounded border ${borderClass} bg-input/50 px-1.5 py-0.5 text-right`}>
      {fmtCur(value)} {icon && <span className="text-[9px]">{icon}</span>}
    </span>
  );
}
