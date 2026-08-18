
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { useMediaQuery } from '../../hooks/use-media-query';

interface FilterConfig {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface ResponsiveFilterProps {
  filters: FilterConfig[];
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

export function ResponsiveFilter({
  filters,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions
}: ResponsiveFilterProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  const activeFilterCount = filters.filter(f => f.value && f.value !== 'ALL' && f.value !== 'All').length;

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2">
          {onSearchChange !== undefined && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <button className={`flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${activeFilterCount > 0 ? 'border-primary bg-primary/10 text-primary' : 'border-input bg-card text-foreground'}`}>
                <Filter className="h-4 w-4" />
                <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-card">
              <SheetHeader>
                <SheetTitle className="text-left text-sm font-bold uppercase tracking-wider text-muted-foreground">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-4">
                {filters.map(f => (
                  <div key={f.id} className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{f.label}</label>
                    <select
                      value={f.value}
                      onChange={e => f.onChange(e.target.value)}
                      className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      {f.options.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    );
  }

  // Tablet / Desktop
  return (
    <div className={`mb-6 flex flex-col lg:flex-row gap-4 ${isTablet ? '' : 'lg:items-center'}`}>
      {onSearchChange !== undefined && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchValue || ''}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full lg:w-64 rounded-md border border-input bg-card pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
      )}
      
      <div className={`grid gap-2 ${isTablet ? `grid-cols-${Math.min(filters.length, 4)}` : 'flex flex-wrap lg:flex-1 lg:justify-end'}`}>
        {filters.map(f => (
          <div key={f.id} className={`flex items-center gap-2 rounded-md border border-input bg-card p-1 ${isTablet ? 'w-full' : 'w-auto'}`}>
            <span className="pl-2 pr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">{f.label}</span>
            <select
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              className="h-7 w-full lg:w-auto min-w-[120px] rounded bg-transparent px-1 text-sm font-medium outline-none cursor-pointer"
            >
              {f.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      
      {actions && <div className="flex justify-end">{actions}</div>}
    </div>
  );
}
