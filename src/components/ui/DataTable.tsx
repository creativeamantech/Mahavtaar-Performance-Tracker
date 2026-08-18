import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  render?: (value: any, row: any, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  pageSize?: number;
  onRowClick?: (row: any) => void;
  rowClassName?: (row: any) => string;
  footer?: React.ReactNode;
}

export function DataTable({ columns, data, pageSize = 50, onRowClick, rowClassName, footer }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden rounded-xl">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full font-sans text-xs min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`sticky top-0 whitespace-nowrap px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider text-xs ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.sortable !== false ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                >
                  <span className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end w-full' : ''}`}>
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted-foreground/60 italic font-medium">
                  No records found
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-border transition-colors hover:bg-muted ${i % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'} ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName?.(row) || ''}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`whitespace-nowrap px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                      {col.render ? col.render(row[col.key], row, page * pageSize + i) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded-md border border-border px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors">Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="rounded-md border border-border px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
