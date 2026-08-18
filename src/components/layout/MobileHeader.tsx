
import { Hexagon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/data-entry': 'Data Entry',
  '/city-pivot': 'City Pivot',
  '/team-pivot': 'Team Pivot',
  '/matrix': 'City × Team',
  '/settings': 'Settings',
  '/audit': 'Audit Log',
};

export function MobileHeader() {
  const location = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[location.pathname] || 'Mahavtaar';

  return (
    <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <div className="flex items-center gap-2">
        <div className="relative flex h-8 w-8 items-center justify-center text-accent">
          <Hexagon className="absolute inset-0 h-full w-full fill-accent/20 stroke-accent stroke-[2]" />
          <span className="z-10 font-sans text-sm font-bold text-accent">M</span>
        </div>
        <h1 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">{title}</h1>
      </div>
      {user && (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          user.role === 'ADMIN' ? 'bg-primary text-primary-foreground' :
          user.role === 'MANAGER' ? 'bg-info text-info-foreground' :
          user.role === 'EXECUTIVE' ? 'bg-success text-success-foreground' :
          'bg-muted text-muted-foreground'
        }`}>
          {user.role}
        </span>
      )}
    </div>
  );
}
