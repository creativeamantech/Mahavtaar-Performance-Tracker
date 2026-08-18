import { useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataTable } from '../components/ui/DataTable';
import { useData } from '../contexts/DataContext';
import { fmtDate } from '../lib/formatters';
import { Search } from 'lucide-react';

export default function AuditLog() {
  const { auditLog } = useData();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return auditLog;
    const s = search.toLowerCase();
    return auditLog.filter(a => a.agreementid.toLowerCase().includes(s) || a.changedBy.toLowerCase().includes(s));
  }, [auditLog, search]);

  const columns = [
    { key: 'createdAt', label: 'Timestamp', render: (v: string) => <span className="text-muted-foreground">{fmtDate(v)}</span> },
    { key: 'agreementid', label: 'Agreement ID', render: (v: string) => <span className="text-muted-foreground">{v}</span> },
    { key: 'field', label: 'Field Changed', render: (v: string) => <span className="uppercase">{v}</span> },
    { key: 'oldValue', label: 'Old Value', render: (v: string) => <span className="text-muted-foreground line-through">{v || '—'}</span> },
    { key: 'newValue', label: 'New Value', render: (v: string) => <span className="text-primary font-medium">{v}</span> },
    { key: 'changedBy', label: 'Changed By' },
    { key: 'source', label: 'Source', render: (v: string) => <span className={v === 'MANUAL' ? 'text-info' : 'text-success'}>{v}</span> },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-heading text-xl font-extrabold uppercase tracking-wide">Manual Entry Audit Log</h1>
        <p className="font-data text-xs text-muted-foreground">Track all manual data changes</p>
      </div>

      <div className="mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by agreement ID or user..."
            className="h-8 w-full rounded-md border border-border bg-input pl-7 pr-3 font-data text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">No audit entries yet. Manual edits will appear here.</p>
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
    </AppLayout>
  );
}
