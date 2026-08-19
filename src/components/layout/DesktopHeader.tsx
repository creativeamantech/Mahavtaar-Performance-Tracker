import { Search, Bell, Filter, UserCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useMemo } from 'react';
import { ThemeToggle } from '../ThemeToggle';

const PAGE_TITLES: Record<string, { title: string, subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Enterprise Recovery & Management' },
  '/data-entry': { title: 'Data Entry Workspace', subtitle: 'Import, validate, and manage CRM data sets.' },
  '/city-pivot': { title: 'City Pivot Analysis', subtitle: 'Volume and performance metrics across all operational regions.' },
  '/team-pivot': { title: 'Executive Performance', subtitle: 'Analyze collection metrics and achievement rates across the recovery team.' },
  '/matrix': { title: 'City × Executive Matrix', subtitle: 'Analyzing collections across regions and personnel.' },
  '/settings': { title: 'System Configuration', subtitle: 'Manage state targets, user access, and core application parameters.' },
  '/audit': { title: 'Audit Log', subtitle: 'System-wide activity history and data provenance.' },
};

export function DesktopHeader() {
  const location = useLocation();
  const { records, globalBucket, setGlobalBucket } = useData();

  const availableBuckets = useMemo(() => {
    const bkts = new Set<string>();
    (records || []).forEach((r: any) => {
      if (r.bom_bkt) bkts.add(String(r.bom_bkt).trim().toUpperCase());
    });
    return Array.from(bkts).sort();
  }, [records]);
  const info = PAGE_TITLES[location.pathname] || { title: 'Mahavtaar CRM', subtitle: 'Enterprise Recovery' };

  return (
    <header className="hidden md:flex sticky top-0 z-30 justify-between items-center px-8 py-4 bg-card border-b border-border shadow-sm">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">{info.title}</h2>
        <p className="font-sans text-sm text-muted-foreground mt-1">{info.subtitle}</p>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search universally..." 
            className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all w-64"
          />
        </div>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        {/* Bucket Filters in Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mx-2">
          <button
            onClick={() => setGlobalBucket('ALL')}
            className={`px-3 py-1.5 font-sans text-xs rounded transition-colors border ${globalBucket === 'ALL' ? 'bg-primary/10 text-primary font-semibold border-primary' : 'text-muted-foreground hover:bg-muted border-transparent'}`}
          >
            All Buckets
          </button>
          {availableBuckets.map(b => (
            <button
              key={b}
              onClick={() => setGlobalBucket(b)}
              className={`px-3 py-1.5 font-sans text-xs rounded transition-colors border ${globalBucket === b ? 'bg-primary/10 text-primary font-semibold border-primary' : 'text-muted-foreground hover:bg-muted border-transparent'}`}
            >
              Bkt {b}
            </button>
          ))}
        </div>

        <ThemeToggle />
        <button className="p-2 hover:bg-muted rounded-full transition-colors text-primary">
          <UserCircle className="h-7 w-7" />
        </button>
      </div>
    </header>
  );
}
